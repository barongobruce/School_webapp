/**
 * File upload middleware for the school webapp API.
 *
 * Flow used across the project:
 * 1. Route middleware (handleTeacherUpload, handleLessonUpload, etc.)
 *    → Multer reads multipart/form-data from the request into memory (req.files).
 * 2. Controllers call uploadFiles / uploadFileList
 *    → Files are sent from memory to Cloudinary; URLs are saved in MongoDB.
 * 3. On update/delete/error, controllers call deleteFromCloudinaryMany
 *    → Old or orphaned Cloudinary files are removed.
 *
 * Used by: admin routes (teachers, students, guardians, classes, admin photo),
 * teacher routes (lessons, homework), and user routes (complaints).
 */

const multer = require('multer');
const cloudinary = require('../config/cloudinary.js');

// MIME types allowed for teacher / student / guardian / class / complaint uploads.
const ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/jpg',
    'application/pdf',
];

// Keep files in RAM (file.buffer) instead of writing to disk.
// Controllers then stream those buffers straight to Cloudinary.
const storage = multer.memoryStorage();

/**
 * Rejects files whose MIME type is not in ALLOWED_TYPES.
 * Multer calls this for every incoming file before storing it.
 */
const fileFilter = (_req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
        cb(null, true); // accept file
        return;
    }
    cb(new Error('Only images and PDF files are allowed')); // reject file
};

// Shared Multer instance: memory storage, 5MB max, image/PDF only.
// Reused by teacher, class, student, guardian, and complaint field configs.
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter,
});

/**
 * Multer field map for teacher create/update (admin routes).
 * Expects named form fields matching what the admin frontend sends:
 * picture, up to 3 qualification docs, and ID front/back.
 */
const uploadTeacherFiles = upload.fields([
    { name: 'picture', maxCount: 1 },
    { name: 'qualification0', maxCount: 1 },
    { name: 'qualification1', maxCount: 1 },
    { name: 'qualification2', maxCount: 1 },
    { name: 'idFront', maxCount: 1 },
    { name: 'idBack', maxCount: 1 },
]);

/**
 * Uploads one in-memory Multer file to Cloudinary and returns its secure HTTPS URL.
 *
 * @param {object} file - Multer file object (has buffer, mimetype, originalname)
 * @param {string} folder - Subfolder under school-webapp/ (e.g. 'teachers', 'students')
 * @returns {Promise<string>} Cloudinary secure_url to store in the database
 *
 * Images use resource_type "image"; PDFs/docs use "raw".
 * Controllers (teacher, student, class, etc.) call this via uploadFiles / uploadFileList.
 */
const uploadToCloudinary = (file, folder = 'teachers') =>
    new Promise((resolve, reject) => {
        const isImage = String(file.mimetype || '').startsWith('image/');

        cloudinary.uploader
            .upload_stream(
                {
                    folder: `school-webapp/${folder}`,
                    resource_type: isImage ? 'image' : 'raw',
                    // Use original name (without extension) as base public_id
                    public_id: file.originalname
                        ? file.originalname.replace(/\.[^.]+$/, '')
                        : undefined,
                    use_filename: true,
                    unique_filename: true, // Cloudinary adds a suffix if name already exists
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result.secure_url);
                }
            )
            .end(file.buffer); // push the in-memory buffer into the upload stream
    });

// Broader MIME list for lesson/homework materials (Office docs + plain text too).
const LESSON_ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/jpg',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
];

// Separate Multer config for lessons/homework: same memory storage, larger 10MB limit.
const lessonUpload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter: (_req, file, cb) => {
        if (LESSON_ALLOWED_TYPES.includes(file.mimetype)) {
            cb(null, true);
            return;
        }
        cb(
            new Error(
                'Only images, PDFs, Word, PowerPoint, Excel, and text files are allowed'
            )
        );
    },
});

/**
 * Accepts up to 10 files under the form field name "materials".
 * Used on teacher lesson and homework create/update routes.
 * After this runs, req.files is an array (not an object of named fields).
 */
const uploadLessonFiles = lessonUpload.array('materials', 10);

/**
 * Uploads an array of Multer files to Cloudinary in parallel.
 *
 * Used by lesson & homework controllers because those routes use .array(),
 * so req.files is [file, file, ...] instead of { fieldName: [file] }.
 *
 * @param {Array} files - Array from req.files after handleLessonUpload
 * @param {string} folder - Cloudinary subfolder (e.g. 'lessons', 'homeworks')
 * @returns {Promise<string[]>} Array of secure URLs
 */
const uploadFileList = async (files = [], folder = 'lessons') => {
    const list = Array.isArray(files) ? files : [];
    return Promise.all(list.map((file) => uploadToCloudinary(file, folder)));
};

/**
 * Multer field map for class cover image (admin class create/update).
 */
const uploadClassFiles = upload.fields([
    { name: 'coverImage', maxCount: 1 },
]);

/**
 * Multer field map for student enrollment (admin student create/update).
 * Includes student photo/IDs and optional guardian photo/IDs in one request
 * (admin can create student + guardian together).
 */
const uploadStudentFiles = upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'idFront', maxCount: 1 },
    { name: 'idBack', maxCount: 1 },
    { name: 'guardianPhoto', maxCount: 1 },
    { name: 'guardianIdFront', maxCount: 1 },
    { name: 'guardianIdBack', maxCount: 1 },
]);

/**
 * Multer field map for standalone guardian create/update (admin routes).
 */
const uploadGuardianFiles = upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'idFront', maxCount: 1 },
    { name: 'idBack', maxCount: 1 },
]);

/**
 * Multer field map for complaint photo evidence (user complaint routes).
 */
const uploadComplaintFiles = upload.fields([
    { name: 'photoEvidence', maxCount: 1 },
]);

/**
 * Uploads named Multer fields to Cloudinary and returns { fieldName: url }.
 *
 * Used by admin/user controllers after handle*Upload middleware, where
 * req.files looks like: { picture: [file], idFront: [file], ... }.
 *
 * @param {object} files - req.files object from Multer .fields()
 * @param {string} folder - Cloudinary subfolder (teachers, students, classes, ...)
 * @returns {Promise<object>} Map of field name → Cloudinary URL
 *
 * Example: uploadFiles(req.files, 'students')
 *   → { photo: 'https://...', idFront: 'https://...', ... }
 */
const uploadFiles = async (files = {}, folder = 'teachers') => {
    const uploaded = {};

    // Flat-map every field's file list into parallel upload tasks
    const tasks = Object.entries(files).flatMap(([field, fileList]) =>
        (fileList || []).map(async (file) => {
            uploaded[field] = await uploadToCloudinary(file, folder);
        })
    );

    await Promise.all(tasks);
    return uploaded;
};

/**
 * Parses a Cloudinary URL to get publicId + resourceType needed for deletion.
 *
 * Example URL:
 *   https://res.cloudinary.com/.../image/upload/v123/school-webapp/teachers/photo.jpg
 * → { publicId: 'school-webapp/teachers/photo', resourceType: 'image' }
 *
 * Returns null if the string is not a Cloudinary URL (so we never try to delete local/dummy paths).
 */
const getCloudinaryMeta = (url) => {
    if (!url || typeof url !== 'string' || !url.includes('res.cloudinary.com')) {
        return null;
    }

    // PDFs/docs were uploaded as "raw"; images as "image"
    const resourceType = url.includes('/raw/upload/') ? 'raw' : 'image';
    const afterUpload = url.split('/upload/').pop();

    if (!afterUpload) return null;

    // Strip version segment (v123456/) then drop the file extension for public_id
    const path = afterUpload.replace(/^v\d+\//, '');
    const dotIndex = path.lastIndexOf('.');
    const publicId = dotIndex > -1 ? path.slice(0, dotIndex) : path;

    return { publicId, resourceType };
};

/**
 * Deletes one file from Cloudinary by its full secure URL.
 * Failures are logged but not thrown — so a DB update can still succeed
 * even if Cloudinary cleanup fails.
 */
const deleteFromCloudinary = async (url) => {
    const meta = getCloudinaryMeta(url);
    if (!meta) return;

    try {
        await cloudinary.uploader.destroy(meta.publicId, {
            resource_type: meta.resourceType,
        });
    } catch (error) {
        console.error('Cloudinary delete failed:', error.message);
    }
};

/**
 * Deletes many Cloudinary URLs in parallel (deduped).
 *
 * Controllers use this to:
 * - remove old photos when a profile is updated
 * - roll back new uploads if create/update fails mid-way
 * - clean removed lesson/homework materials
 *
 * @param {string[]} urls - Cloudinary secure URLs (or falsy values, which are skipped)
 */
const deleteFromCloudinaryMany = async (urls = []) => {
    const unique = [...new Set(urls.filter(Boolean))];
    await Promise.all(unique.map(deleteFromCloudinary));
};

/**
 * Express middleware for admin teacher routes (POST/PUT /admin/teachers...).
 * Runs uploadTeacherFiles, returns 400 on Multer errors, otherwise next().
 * After this, the teacher controller calls uploadFiles(req.files) → Cloudinary.
 */
const handleTeacherUpload = (req, res, next) => {
    uploadTeacherFiles(req, res, (error) => {
        if (error) {
            return res.status(400).json({
                message: error.message || 'File upload failed',
            });
        }
        next();
    });
};

/**
 * Express middleware for admin class routes (POST/PATCH /admin/classes...).
 * Accepts coverImage; class controller then uploads it via uploadFiles(..., 'classes').
 */
const handleClassUpload = (req, res, next) => {
    uploadClassFiles(req, res, (error) => {
        if (error) {
            return res.status(400).json({
                message: error.message || 'File upload failed',
            });
        }
        next();
    });
};

/**
 * Express middleware for admin student routes (POST/PATCH /admin/students...).
 * Accepts student + guardian file fields; student controller uploads to 'students' folder.
 */
const handleStudentUpload = (req, res, next) => {
    uploadStudentFiles(req, res, (error) => {
        if (error) {
            return res.status(400).json({
                message: error.message || 'File upload failed',
            });
        }
        next();
    });
};

/**
 * Express middleware for admin guardian routes (POST/PATCH /admin/guardians...).
 * Guardian controller uploads accepted files via uploadFiles(..., 'guardians').
 */
const handleGuardianUpload = (req, res, next) => {
    uploadGuardianFiles(req, res, (error) => {
        if (error) {
            return res.status(400).json({
                message: error.message || 'File upload failed',
            });
        }
        next();
    });
};

/**
 * Express middleware for user complaint routes (POST/PATCH /user/complaint...).
 * Accepts photoEvidence; user controller uploads via uploadFiles(..., 'complaints').
 */
const handleComplaintUpload = (req, res, next) => {
    uploadComplaintFiles(req, res, (error) => {
        if (error) {
            return res.status(400).json({
                message: error.message || 'File upload failed',
            });
        }
        next();
    });
};

/**
 * Express middleware for teacher lesson routes (POST/PATCH /teacher/lessons...).
 * Accepts up to 10 "materials" files; lesson controller uses uploadFileList(..., 'lessons').
 */
const handleLessonUpload = (req, res, next) => {
    uploadLessonFiles(req, res, (error) => {
        if (error) {
            return res.status(400).json({
                message: error.message || 'File upload failed',
            });
        }
        next();
    });
};

/**
 * Same as handleLessonUpload — homework reuses the lesson materials Multer config.
 * Wired on teacher homework routes; controller uploads with uploadFileList(..., 'homeworks').
 */
const handleHomeworkUpload = handleLessonUpload;

// Image-only MIME types for admin profile photo updates.
const IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/jpg',
];

// Multer config that only allows images (no PDFs) for user/admin profile photos.
const imageUpload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (IMAGE_TYPES.includes(file.mimetype)) {
            cb(null, true);
            return;
        }
        cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
    },
});

/**
 * Accepts a single "photo" field for admin profile picture updates.
 */
const uploadUserPhoto = imageUpload.fields([{ name: 'photo', maxCount: 1 }]);

/**
 * Express middleware for PATCH /admin/me/photo.
 * Admin controller then uploads via uploadFiles(req.files, 'admins') and
 * deletes the previous photo with deleteFromCloudinaryMany.
 */
const handleUserPhotoUpload = (req, res, next) => {
    uploadUserPhoto(req, res, (error) => {
        if (error) {
            return res.status(400).json({
                message: error.message || 'File upload failed',
            });
        }
        next();
    });
};

// Public API of this module:
// - handle* = Express route middleware (parse multipart → req.files)
// - uploadFiles / uploadFileList = controller helpers (memory → Cloudinary URLs)
// - deleteFromCloudinaryMany = cleanup helper for updates, deletes, and rollbacks
module.exports = {
    handleTeacherUpload,
    handleClassUpload,
    handleStudentUpload,
    handleGuardianUpload,
    handleComplaintUpload,
    handleLessonUpload,
    handleHomeworkUpload,
    handleUserPhotoUpload,
    uploadFiles,
    uploadFileList,
    deleteFromCloudinaryMany,
};
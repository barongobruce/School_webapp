const ClassModel = require('../../models/class.model.js');
const CourseModel = require('../../models/course.model.js');
const TeacherModel = require('../../models/teacher.model.js');
const { uploadFiles, deleteFromCloudinaryMany } = require('../../middleware/multer.middleware.js');
const ENV = require('../../config/env.js');
const mongoose = require('mongoose');

const loadSharedActiveCourses = () => CourseModel.find({ courseStatus: 'Active' })
    .select('_id courseName courseCode courseType courseStatus courseDescription')
    .sort({ courseName: 1 })
    .lean();

const addClass = async (req, res, next) => {
    try {
        const {
            className,
            classCode,
            description,
            grade,
            academicYear,
            isActive,
        } = req.body;

        if (!className?.trim() || !classCode?.trim()) {
            return res.status(400).json({
                message: 'Class name and class code are required',
            });
        }

        const normalizedCode = classCode.trim().toUpperCase();

        const existing = await ClassModel.findOne({
            $or: [
                { className: className.trim() },
                { classCode: normalizedCode },
            ],
        });

        if (existing) {
            const field =
                existing.classCode === normalizedCode
                    ? 'code'
                    : 'name';
            return res.status(409).json({
                message: `A class with this ${field} already exists`,
            });
        }

        // Every active school course is shared by every class. Keep the
        // existing Class.courses field populated for older screens and APIs.
        const selectedCourses = await CourseModel.find({ courseStatus: 'Active' })
            .select('_id');

        const uploaded = await uploadFiles(req.files, 'classes');
        const courseIds = selectedCourses.map((course) => course._id);

        const newClass = await ClassModel.create({
            className: className.trim(),
            classCode: normalizedCode,
            description: description?.trim() || '',
            grade: grade !== undefined && grade !== '' ? Number(grade) : null,
            academicYear: academicYear?.trim() || '',
            coverImage: uploaded.coverImage || '',
            isActive: isActive === undefined ? true : isActive === true || isActive === 'true',
            courses: courseIds,
        });

        const populated = await ClassModel.findById(newClass._id)
            .select(
                '-assignments -announcements -events -resources -notifications -exams -quizzes -complaints'
            )
            .populate('courses', 'courseName courseCode courseType courseStatus courseDescription')
            .lean();

        res.status(201).json({
            message: 'Class created successfully',
            class: populated,
        });
    } catch (error) {
        next(error);
    }
}

















const getClasses = async (req, res, next) => {
    try {
        const { search, isActive } = req.query;
        const filter = {};

        if (isActive === 'true' || isActive === 'false') {
            filter.isActive = isActive === 'true';
        }

        if (search?.trim()) {
            const term = search.trim();
            const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

            filter.$or = [
                { className: regex },
                { classCode: regex },
                { academicYear: regex },
                { description: regex },
            ];

            const grade = Number(term);
            if (!Number.isNaN(grade)) {
                filter.$or.push({ grade });
            }
        }

        const classes = await ClassModel.find(filter)
            .select(
                '-assignments -announcements -events -resources -notifications -exams -quizzes -complaints'
            )
            .populate('courses', 'courseName courseCode courseType courseStatus')
            .populate({
                path: 'teachers',
                populate: {
                    path: 'user',
                    select: 'firstName lastName email photo isActive',
                },
            })
            .populate({
                path: 'classTeacher',
                select: 'user',
                populate: {
                    path: 'user',
                    select: 'firstName lastName email photo isActive',
                },
            })
            .sort({ createdAt: -1 })
            .lean();

        const sharedCourses = await loadSharedActiveCourses();
        const classesWithSharedCourses = classes.map((classItem) => ({
            ...classItem,
            courses: sharedCourses,
        }));
        res.json({
            count: classesWithSharedCourses.length,
            classes: classesWithSharedCourses,
        });
    } catch (error) {
        next(error);
    }
}
















const getClassById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid class ID' });
        }

        const classItem = await ClassModel.findById(id)
            .select(
                '-assignments -announcements -events -resources -notifications -exams -quizzes -complaints'
            )
            .populate('courses', 'courseName courseCode courseType courseStatus courseDescription')
            .populate({
                path: 'teachers',
                populate: {
                    path: 'user',
                    select: 'firstName lastName email photo isActive',
                },
            })
            .populate({
                path: 'classTeacher',
                select: 'user',
                populate: {
                    path: 'user',
                    select: 'firstName lastName email photo isActive',
                },
            })
            .populate({
                path: 'students',
                populate: {
                    path: 'user',
                    select: 'firstName lastName email photo isActive',
                },
            })
            .lean();

        if (!classItem) {
            return res.status(404).json({ message: 'Class not found' });
        }

        classItem.courses = await loadSharedActiveCourses();
        res.json({ class: classItem });
    } catch (error) {
        next(error);
    }
}









const updateClass = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid class ID' });
        }

        const classItem = await ClassModel.findById(id);

        if (!classItem) {
            return res.status(404).json({ message: 'Class not found' });
        }

        const {
            className,
            classCode,
            description,
            grade,
            academicYear,
            courses,
            isActive,
            removeCoverImage,
        } = req.body;

        if (!className?.trim() || !classCode?.trim()) {
            return res.status(400).json({
                message: 'Class name and class code are required',
            });
        }

        const normalizedCode = classCode.trim().toUpperCase();
        const normalizedName = className.trim();

        const duplicate = await ClassModel.findOne({
            _id: { $ne: id },
            $or: [
                { className: normalizedName },
                { classCode: normalizedCode },
            ],
        });

        if (duplicate) {
            const field =
                duplicate.classCode === normalizedCode ? 'code' : 'name';
            return res.status(409).json({
                message: `A class with this ${field} already exists`,
            });
        }

        let nextClassTeacher = classItem.classTeacher || null;
        if (req.body.classTeacher !== undefined) {
            const classTeacherId = String(req.body.classTeacher || '').trim();
            if (!classTeacherId) {
                nextClassTeacher = null;
            } else {
                if (!mongoose.Types.ObjectId.isValid(classTeacherId)) {
                    return res.status(400).json({ message: 'Invalid class teacher ID' });
                }
                const teacher = await TeacherModel.findById(classTeacherId)
                    .select('_id classes')
                    .lean();
                if (!teacher) {
                    return res.status(404).json({ message: 'Class teacher profile not found' });
                }
                const assignedOnClass = (classItem.teachers || []).some(
                    (teacherId) => teacherId.toString() === classTeacherId,
                );
                const assignedOnTeacher = (teacher.classes || []).some(
                    (classId) => classId.toString() === classItem._id.toString(),
                );
                if (!assignedOnClass && !assignedOnTeacher) {
                    return res.status(400).json({
                        message: 'The designated class teacher must already be assigned to this class',
                    });
                }
                nextClassTeacher = teacher._id;
            }
        }

        const uploaded = await uploadFiles(req.files, 'classes');
        const urlsToDelete = [];

        classItem.className = normalizedName;
        classItem.classCode = normalizedCode;
        classItem.description = description?.trim() || '';
        classItem.grade =
            grade !== undefined && grade !== '' ? Number(grade) : null;
        classItem.academicYear = academicYear?.trim() || '';
        classItem.classTeacher = nextClassTeacher;

        if (isActive !== undefined) {
            classItem.isActive = isActive === true || isActive === 'true';
        }

        if (uploaded.coverImage) {
            if (classItem.coverImage) urlsToDelete.push(classItem.coverImage);
            classItem.coverImage = uploaded.coverImage;
        } else if (removeCoverImage === true || removeCoverImage === 'true') {
            if (classItem.coverImage) urlsToDelete.push(classItem.coverImage);
            classItem.coverImage = '';
        }

        if (courses !== undefined) {
            const selectedCourses = await CourseModel.find({ courseStatus: 'Active' })
                .select('_id');
            classItem.courses = selectedCourses.map((course) => course._id);
        }

        await classItem.save();
        await deleteFromCloudinaryMany(urlsToDelete);

        const populated = await ClassModel.findById(classItem._id)
            .select(
                '-assignments -announcements -events -resources -notifications -exams -quizzes -complaints'
            )
            .populate('courses', 'courseName courseCode courseType courseStatus courseDescription')
            .populate({
                path: 'teachers',
                populate: {
                    path: 'user',
                    select: 'firstName lastName email photo isActive',
                },
            })
            .populate({
                path: 'classTeacher',
                select: 'user',
                populate: {
                    path: 'user',
                    select: 'firstName lastName email photo isActive',
                },
            })
            .populate({
                path: 'students',
                populate: {
                    path: 'user',
                    select: 'firstName lastName email photo isActive',
                },
            })
            .lean();

        populated.courses = await loadSharedActiveCourses();
        res.json({
            message: 'Class updated successfully',
            class: populated,
        });
    } catch (error) {
        next(error);
    }
}



module.exports = { addClass, getClasses, getClassById, updateClass };

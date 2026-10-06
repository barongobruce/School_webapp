const LessonModel = require('../../models/lesson.model.js');
const ClassModel = require('../../models/class.model.js');
const CourseModel = require('../../models/course.model.js');
const {
    assertValidObjectId,
    isAssignedClass,
    serializeLesson,
    lessonPopulate,
} = require('../../utils/lessonAccess.js');
const {
    uploadFileList,
    deleteFromCloudinaryMany,
} = require('../../middleware/multer.middleware.js');

const MAX_MATERIALS = 10;
const NOTES_MAX = 5000;
const TEACHER_NOTES_MAX = 1000;

const toBoundedText = (value, maxLength) => {
    const raw = Array.isArray(value) ? value[value.length - 1] : value;
    return String(raw ?? '')
        .trim()
        .slice(0, maxLength);
};

const parseMaybeJson = (value) => {
    if (typeof value !== 'string') return value;

    const trimmed = value.trim();
    if (!trimmed) return value;

    if (
        (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
        (trimmed.startsWith('[') && trimmed.endsWith(']'))
    ) {
        try {
            return JSON.parse(trimmed);
        } catch {
            return value;
        }
    }

    return value;
};

const toMaterialUrls = (value) => {
    if (value == null || value === '') return [];

    const parsed = parseMaybeJson(value);
    const items = Array.isArray(parsed) ? parsed : [parsed];

    return [
        ...new Set(
            items
                .map((item) => String(item || '').trim())
                .filter((item) => item.length > 0 && item.length <= 500)
        ),
    ].slice(0, MAX_MATERIALS);
};

const getAssignedClassOrThrow = async (classId, teacher) => {
    assertValidObjectId(classId, 'class ID');

    const classItem = await ClassModel.findById(classId)
        .select('className classCode grade academicYear isActive teachers courses')
        .lean();

    if (!classItem) {
        const error = new Error('Class not found');
        error.statusCode = 404;
        throw error;
    }

    if (!isAssignedClass(classItem, teacher)) {
        const error = new Error(
            'Access denied. This class is not assigned to you.'
        );
        error.statusCode = 403;
        throw error;
    }

    return classItem;
};

const resolveCourseForClass = async (courseId, classItem, teacherId) => {
    assertValidObjectId(courseId, 'course ID');

    const course = await CourseModel.findById(courseId)
        .select(
            'courseName courseCode courseStatus courseClass courseTeachers'
        )
        .lean();

    if (!course || course.courseStatus !== 'Active') {
        const error = new Error('Course not found or inactive');
        error.statusCode = 404;
        throw error;
    }

    const classCourseIds = (classItem.courses || []).map((id) => id.toString());
    const belongsToClass =
        classCourseIds.includes(String(course._id)) ||
        String(course.courseClass || '') === String(classItem._id);

    const teachesCourse = (course.courseTeachers || []).some(
        (id) => String(id) === String(teacherId)
    );

    if (!belongsToClass && !teachesCourse) {
        const error = new Error(
            'This course is not available for the selected class.'
        );
        error.statusCode = 400;
        throw error;
    }

    return course;
};

const parseLessonInput = async (body, teacher, { existingMaterials = [] } = {}) => {
    const {
        title,
        course: courseId,
        subject,
        class: classId,
        scheduledAt,
        durationMinutes,
        notes,
        teacherNotes,
        existingMaterials: keptMaterials,
    } = body || {};

    if (!title || !String(title).trim()) {
        const error = new Error('Title is required');
        error.statusCode = 400;
        throw error;
    }
    if (!courseId && !subject) {
        const error = new Error('Subject / course is required');
        error.statusCode = 400;
        throw error;
    }
    if (!classId) {
        const error = new Error('Class is required');
        error.statusCode = 400;
        throw error;
    }
    if (!scheduledAt) {
        const error = new Error('Scheduled date and time are required');
        error.statusCode = 400;
        throw error;
    }

    const scheduledDate = new Date(scheduledAt);
    if (Number.isNaN(scheduledDate.getTime())) {
        const error = new Error('Invalid scheduled date and time');
        error.statusCode = 400;
        throw error;
    }

    const duration = Number(durationMinutes);
    if (!Number.isFinite(duration) || duration < 1) {
        const error = new Error(
            'Duration must be a number of at least 1 minute'
        );
        error.statusCode = 400;
        throw error;
    }

    const classItem = await getAssignedClassOrThrow(classId, teacher);

    let course = null;
    let subjectName = String(subject || '').trim();

    if (courseId) {
        course = await resolveCourseForClass(courseId, classItem, teacher._id);
        subjectName = course.courseName;
    }

    if (!subjectName) {
        const error = new Error('Subject / course is required');
        error.statusCode = 400;
        throw error;
    }

    const kept = toMaterialUrls(
        keptMaterials != null ? keptMaterials : existingMaterials
    );

    return {
        title: String(title).trim(),
        subject: subjectName,
        course: course?._id || null,
        class: classId,
        scheduledAt: scheduledDate,
        durationMinutes: Math.min(Math.round(duration), 480),
        keptMaterials: kept,
        notes: toBoundedText(notes, NOTES_MAX),
        teacherNotes: toBoundedText(teacherNotes, TEACHER_NOTES_MAX),
    };
};

const createLesson = async (req, res, next) => {
    const uploadedUrls = [];

    try {
        const payload = await parseLessonInput(req.body, req.teacher);
        const uploaded = await uploadFileList(req.files || [], 'lessons');
        uploadedUrls.push(...uploaded);

        const materials = [...payload.keptMaterials, ...uploaded].slice(
            0,
            MAX_MATERIALS
        );

        const lesson = await LessonModel.create({
            title: payload.title,
            subject: payload.subject,
            course: payload.course,
            class: payload.class,
            teacher: req.teacher._id,
            scheduledAt: payload.scheduledAt,
            durationMinutes: payload.durationMinutes,
            materials,
            notes: payload.notes,
            teacherNotes: payload.teacherNotes,
        });

        uploadedUrls.length = 0;

        const populated = await LessonModel.findById(lesson._id)
            .populate(lessonPopulate)
            .lean();

        res.status(201).json({
            message: 'Lesson created successfully',
            lesson: serializeLesson(populated),
        });
    } catch (error) {
        await deleteFromCloudinaryMany(uploadedUrls);
        if (error.statusCode) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        next(error);
    }
};

const updateLesson = async (req, res, next) => {
    const uploadedUrls = [];

    try {
        const { id } = req.params;
        assertValidObjectId(id, 'lesson ID');

        const existing = await LessonModel.findOne({
            _id: id,
            teacher: req.teacher._id,
            isActive: true,
        });

        if (!existing) {
            return res.status(404).json({ message: 'Lesson not found' });
        }

        const payload = await parseLessonInput(req.body, req.teacher, {
            existingMaterials: existing.materials || [],
        });
        const uploaded = await uploadFileList(req.files || [], 'lessons');
        uploadedUrls.push(...uploaded);

        const nextMaterials = [...payload.keptMaterials, ...uploaded].slice(
            0,
            MAX_MATERIALS
        );
        const removed = (existing.materials || []).filter(
            (url) => !nextMaterials.includes(url)
        );

        existing.title = payload.title;
        existing.subject = payload.subject;
        existing.course = payload.course;
        existing.class = payload.class;
        existing.scheduledAt = payload.scheduledAt;
        existing.durationMinutes = payload.durationMinutes;
        existing.materials = nextMaterials;
        existing.notes = payload.notes;
        existing.teacherNotes = payload.teacherNotes;

        await existing.save();
        uploadedUrls.length = 0;

        if (removed.length) {
            await deleteFromCloudinaryMany(removed);
        }

        const populated = await LessonModel.findById(existing._id)
            .populate(lessonPopulate)
            .lean();

        res.json({
            message: 'Lesson updated successfully',
            lesson: serializeLesson(populated),
        });
    } catch (error) {
        await deleteFromCloudinaryMany(uploadedUrls);
        if (error.statusCode) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        next(error);
    }
};

const getTeacherLessons = async (req, res, next) => {
    try {
        const lessons = await LessonModel.find({
            teacher: req.teacher._id,
            isActive: true,
        })
            .populate(lessonPopulate)
            .sort({ scheduledAt: 1 })
            .lean();

        const serialized = lessons.map(serializeLesson);

        res.json({
            count: serialized.length,
            lessons: serialized,
        });
    } catch (error) {
        next(error);
    }
};

const getTeacherLessonById = async (req, res, next) => {
    try {
        const { id } = req.params;
        assertValidObjectId(id, 'lesson ID');

        const lesson = await LessonModel.findOne({
            _id: id,
            teacher: req.teacher._id,
            isActive: true,
        })
            .populate(lessonPopulate)
            .lean();

        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }

        res.json({ lesson: serializeLesson(lesson) });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        next(error);
    }
};

module.exports = {
    createLesson,
    updateLesson,
    getTeacherLessons,
    getTeacherLessonById,
};

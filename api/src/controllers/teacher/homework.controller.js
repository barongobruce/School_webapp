const HomeworkModel = require('../../models/homework.model.js');
const ClassModel = require('../../models/class.model.js');
const CourseModel = require('../../models/course.model.js');
const {
    assertValidObjectId,
    isAssignedClass,
    serializeHomework,
    homeworkPopulate,
} = require('../../utils/homeworkAccess.js');
const {
    uploadFileList,
    deleteFromCloudinaryMany,
} = require('../../middleware/multer.middleware.js');

const MAX_MATERIALS = 10;
const INSTRUCTIONS_MAX = 5000;

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

const parseHomeworkInput = async (
    body,
    teacher,
    { existingMaterials = [] } = {}
) => {
    const {
        title,
        course: courseId,
        subject,
        class: classId,
        dueDate,
        instructions,
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
    if (!dueDate) {
        const error = new Error('Due date is required');
        error.statusCode = 400;
        throw error;
    }

    const due = new Date(dueDate);
    if (Number.isNaN(due.getTime())) {
        const error = new Error('Invalid due date');
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
        dueDate: due,
        keptMaterials: kept,
        instructions: toBoundedText(instructions, INSTRUCTIONS_MAX),
    };
};

const createHomework = async (req, res, next) => {
    const uploadedUrls = [];

    try {
        const payload = await parseHomeworkInput(req.body, req.teacher);
        const uploaded = await uploadFileList(req.files || [], 'homeworks');
        uploadedUrls.push(...uploaded);

        const materials = [...payload.keptMaterials, ...uploaded].slice(
            0,
            MAX_MATERIALS
        );

        const homework = await HomeworkModel.create({
            title: payload.title,
            subject: payload.subject,
            course: payload.course,
            class: payload.class,
            teacher: req.teacher._id,
            dueDate: payload.dueDate,
            instructions: payload.instructions,
            materials,
        });

        uploadedUrls.length = 0;

        const populated = await HomeworkModel.findById(homework._id)
            .populate(homeworkPopulate)
            .lean();

        res.status(201).json({
            message: 'Homework created successfully',
            homework: serializeHomework(populated),
        });
    } catch (error) {
        await deleteFromCloudinaryMany(uploadedUrls);
        if (error.statusCode) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        next(error);
    }
};

const updateHomework = async (req, res, next) => {
    const uploadedUrls = [];

    try {
        const { id } = req.params;
        assertValidObjectId(id, 'homework ID');

        const existing = await HomeworkModel.findOne({
            _id: id,
            teacher: req.teacher._id,
            isActive: true,
        });

        if (!existing) {
            return res.status(404).json({ message: 'Homework not found' });
        }

        const payload = await parseHomeworkInput(req.body, req.teacher, {
            existingMaterials: existing.materials || [],
        });
        const uploaded = await uploadFileList(req.files || [], 'homeworks');
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
        existing.dueDate = payload.dueDate;
        existing.instructions = payload.instructions;
        existing.materials = nextMaterials;

        await existing.save();
        uploadedUrls.length = 0;

        if (removed.length) {
            await deleteFromCloudinaryMany(removed);
        }

        const populated = await HomeworkModel.findById(existing._id)
            .populate(homeworkPopulate)
            .lean();

        res.json({
            message: 'Homework updated successfully',
            homework: serializeHomework(populated),
        });
    } catch (error) {
        await deleteFromCloudinaryMany(uploadedUrls);
        if (error.statusCode) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        next(error);
    }
};

const getTeacherHomeworks = async (req, res, next) => {
    try {
        const homeworks = await HomeworkModel.find({
            teacher: req.teacher._id,
            isActive: true,
        })
            .populate(homeworkPopulate)
            .sort({ dueDate: 1 })
            .lean();

        const serialized = homeworks.map(serializeHomework);

        res.json({
            count: serialized.length,
            homeworks: serialized,
        });
    } catch (error) {
        next(error);
    }
};

const getTeacherHomeworkById = async (req, res, next) => {
    try {
        const { id } = req.params;
        assertValidObjectId(id, 'homework ID');

        const homework = await HomeworkModel.findOne({
            _id: id,
            teacher: req.teacher._id,
            isActive: true,
        })
            .populate(homeworkPopulate)
            .lean();

        if (!homework) {
            return res.status(404).json({ message: 'Homework not found' });
        }

        res.json({ homework: serializeHomework(homework) });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        next(error);
    }
};

module.exports = {
    createHomework,
    updateHomework,
    getTeacherHomeworks,
    getTeacherHomeworkById,
};

const mongoose = require('mongoose');

const ClassModel = require('../models/class.model.js');
const CourseModel = require('../models/course.model.js');
const StudentModel = require('../models/student.model.js');
const TeacherModel = require('../models/teacher.model.js');
const GuardianModel = require('../models/guardian.model.js');

const lessonPopulate = [
    {
        path: 'class',
        select: 'className classCode grade academicYear isActive teachers',
    },
    {
        path: 'course',
        select: 'courseName courseCode courseType courseStatus courseClass',
    },
    {
        path: 'teacher',
        select: 'user',
        populate: {
            path: 'user',
            select: 'firstName lastName email photo',
        },
    },
];

const uniqueIds = (ids = []) => [
    ...new Set(
        ids
            .filter(Boolean)
            .map((id) => id.toString())
    ),
];

const assertValidObjectId = (id, label = 'ID') => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error(`Invalid ${label}`);
        error.statusCode = 400;
        throw error;
    }
};

const teacherOwnsClass = (classItem, teacherId) => {
    const id = teacherId.toString();
    return (classItem.teachers || []).some(
        (teacher) => (teacher._id || teacher).toString() === id
    );
};

const isAssignedClass = (classItem, teacher) => {
    if (!classItem || !teacher) return false;

    const teacherId = teacher._id;
    const linkedClassIds = (teacher.classes || []).map((classId) =>
        classId.toString()
    );

    return (
        teacherOwnsClass(classItem, teacherId) ||
        linkedClassIds.includes(classItem._id.toString())
    );
};

const resolveAccessContext = async (user) => {
    if (!user?._id || !user.role) {
        return {
            role: null,
            teacherId: null,
            studentId: null,
            guardianId: null,
            classIds: [],
        };
    }

    if (user.role === 'teacher') {
        const teacher = await TeacherModel.findOne({ user: user._id })
            .select('_id classes')
            .lean();

        if (!teacher) {
            return {
                role: 'teacher',
                teacherId: null,
                studentId: null,
                guardianId: null,
                studentIds: [],
                classIds: [],
            };
        }

        const taughtClasses = await ClassModel.find({ teachers: teacher._id })
            .select('_id')
            .lean();

        return {
            role: 'teacher',
            teacherId: teacher._id,
            teacher,
            studentId: null,
            guardianId: null,
            classIds: uniqueIds([
                ...(teacher.classes || []),
                ...taughtClasses.map((item) => item._id),
            ]),
        };
    }

    if (user.role === 'student') {
        const student = await StudentModel.findOne({ user: user._id })
            .select('_id class')
            .lean();

        return {
            role: 'student',
            teacherId: null,
            studentId: student?._id || null,
            studentIds: student?._id ? [student._id] : [],
            guardianId: null,
            classIds: student?.class ? [student.class.toString()] : [],
        };
    }

    if (user.role === 'guardian') {
        const guardian = await GuardianModel.findOne({ user: user._id })
            .select('_id students')
            .lean();

        if (!guardian) {
            return {
                role: 'guardian',
                teacherId: null,
                studentId: null,
                guardianId: null,
                classIds: [],
            };
        }

        const wards = await StudentModel.find({
            _id: { $in: guardian.students || [] },
        })
            .select('_id class')
            .lean();

        return {
            role: 'guardian',
            teacherId: null,
            studentId: null,
            guardianId: guardian._id,
            studentIds: wards.map((ward) => ward._id),
            classIds: uniqueIds(wards.map((ward) => ward.class)),
        };
    }

    return {
        role: user.role,
        teacherId: null,
        studentId: null,
        guardianId: null,
        classIds: [],
    };
};

const getTeacherName = (lesson) => {
    const user = lesson?.teacher?.user;
    if (!user || typeof user !== 'object') return '';
    return `${user.firstName || ''} ${user.lastName || ''}`.trim();
};

const serializeLesson = (lesson) => {
    if (!lesson) return null;

    const classItem =
        lesson.class && typeof lesson.class === 'object' ? lesson.class : null;
    const courseDoc =
        lesson.course && typeof lesson.course === 'object' ? lesson.course : null;
    const teacherDoc =
        lesson.teacher && typeof lesson.teacher === 'object'
            ? lesson.teacher
            : null;

    return {
        ...lesson,
        id: String(lesson._id),
        className: classItem?.className || '',
        classCode: classItem?.classCode || '',
        courseId: courseDoc?._id || lesson.course || null,
        courseName: courseDoc?.courseName || lesson.subject || '',
        courseCode: courseDoc?.courseCode || '',
        subject: courseDoc?.courseName || lesson.subject || '',
        teacherId: teacherDoc?._id || lesson.teacher || null,
        teacher: getTeacherName(lesson),
    };
};

const buildLessonVisibilityQuery = (context) => {
    const query = { isActive: true };

    if (context.role === 'teacher') {
        if (!context.teacherId) {
            query._id = null;
            return query;
        }
        query.teacher = context.teacherId;
        return query;
    }

    if (!context.classIds.length) {
        query._id = null;
        return query;
    }

    query.class = {
        $in: context.classIds.map((id) => new mongoose.Types.ObjectId(id)),
    };
    return query;
};

const canAccessLesson = (lesson, context) => {
    if (!lesson || !context?.role) return false;

    if (context.role === 'teacher') {
        return (
            context.teacherId &&
            String(lesson.teacher?._id || lesson.teacher) ===
                String(context.teacherId)
        );
    }

    const classId = String(lesson.class?._id || lesson.class || '');
    return context.classIds.includes(classId);
};

const getAccessibleCourses = async (context) => {
    const courseMap = new Map();
    const classIds = (context.classIds || []).filter((id) => mongoose.Types.ObjectId.isValid(id));

    if (classIds.length) {
        const [classes, courses] = await Promise.all([
            ClassModel.find({ _id: { $in: classIds }, isActive: true })
                .select('className classCode')
                .lean(),
            CourseModel.find({ courseStatus: 'Active' })
                .select('courseName courseCode courseType courseStudents')
                .sort({ courseName: 1 })
                .lean(),
        ]);
        const studentIds = new Set((context.studentIds || (context.studentId ? [context.studentId] : []))
            .map((id) => String(id)));
        for (const classItem of classes) {
            for (const course of courses) {
                const isElective = String(course.courseType || 'Core') !== 'Core';
                if (isElective && ['student', 'guardian'].includes(context.role)) {
                    const enrolled = (course.courseStudents || []).some((id) => studentIds.has(String(id)));
                    if (!enrolled) continue;
                }
                const id = String(course._id);
                if (courseMap.has(id)) continue;
                courseMap.set(id, {
                    id,
                    _id: course._id,
                    courseName: course.courseName,
                    courseCode: course.courseCode,
                    courseType: course.courseType,
                    classId: classItem._id,
                    className: classItem.className,
                    classCode: classItem.classCode,
                });
            }
        }
    }

    if (context.teacherId) {
        const teacherCourses = await CourseModel.find({
            courseTeachers: context.teacherId,
            courseStatus: 'Active',
        })
            .select('courseName courseCode courseType courseStatus courseClass')
            .populate('courseClass', 'className classCode')
            .lean();

        for (const course of teacherCourses) {
            const id = String(course._id);
            if (courseMap.has(id)) continue;
            const classItem = course.courseClass && typeof course.courseClass === 'object'
                ? course.courseClass
                : null;
            courseMap.set(id, {
                id,
                _id: course._id,
                courseName: course.courseName,
                courseCode: course.courseCode,
                courseType: course.courseType,
                classId: classItem?._id || course.courseClass || null,
                className: classItem?.className || '',
                classCode: classItem?.classCode || '',
            });
        }
    }

    return [...courseMap.values()].sort((a, b) => a.courseName.localeCompare(b.courseName));
};

module.exports = {
    lessonPopulate,
    assertValidObjectId,
    isAssignedClass,
    resolveAccessContext,
    serializeLesson,
    buildLessonVisibilityQuery,
    canAccessLesson,
    getAccessibleCourses,
};

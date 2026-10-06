const mongoose = require('mongoose');
const {assertValidObjectId, isAssignedClass, resolveAccessContext, getAccessibleCourses} = require('./lessonAccess.js');

const homeworkPopulate = [
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

const getTeacherName = (homework) => {
    const user = homework?.teacher?.user;
    if (!user || typeof user !== 'object') return '';
    return `${user.firstName || ''} ${user.lastName || ''}`.trim();
};

const serializeHomework = (homework) => {
    if (!homework) return null;

    const classItem =
        homework.class && typeof homework.class === 'object'
            ? homework.class
            : null;
    const courseDoc =
        homework.course && typeof homework.course === 'object'
            ? homework.course
            : null;
    const teacherDoc =
        homework.teacher && typeof homework.teacher === 'object'
            ? homework.teacher
            : null;

    return {
        ...homework,
        id: String(homework._id),
        className: classItem?.className || '',
        classCode: classItem?.classCode || '',
        courseId: courseDoc?._id || homework.course || null,
        courseName: courseDoc?.courseName || homework.subject || '',
        courseCode: courseDoc?.courseCode || '',
        subject: courseDoc?.courseName || homework.subject || '',
        teacherId: teacherDoc?._id || homework.teacher || null,
        teacher: getTeacherName(homework),
    };
};

const buildHomeworkVisibilityQuery = (context) => {
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

const canAccessHomework = (homework, context) => {
    if (!homework || !context?.role) return false;

    if (context.role === 'teacher') {
        return (
            context.teacherId &&
            String(homework.teacher?._id || homework.teacher) ===
                String(context.teacherId)
        );
    }

    const classId = String(homework.class?._id || homework.class || '');
    return context.classIds.includes(classId);
};

module.exports = {
    homeworkPopulate,
    assertValidObjectId,
    isAssignedClass,
    resolveAccessContext,
    serializeHomework,
    buildHomeworkVisibilityQuery,
    canAccessHomework,
    getAccessibleCourses,
};

const mongoose = require('mongoose');

const StudentModel = require('../models/student.model.js');
const GuardianModel = require('../models/guardian.model.js');
const {assertValidObjectId, resolveAccessContext, canAccessLesson, serializeLesson, lessonPopulate} = require('./lessonAccess.js');
const { ATTENDANCE_STATUSES } = require('../models/attendance.model.js');

const uniqueIds = (ids = []) => [
    ...new Set(ids.filter(Boolean).map((id) => id.toString())),
];

const getStudentName = (student) => {
    const user = student?.user;
    if (!user || typeof user !== 'object') return 'Student';
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Student';
};

const resolveAttendanceContext = async (user) => {
    const base = await resolveAccessContext(user);

    if (base.role === 'student') {
        return {
            ...base,
            studentIds: base.studentId ? [base.studentId.toString()] : [],
        };
    }

    if (base.role === 'guardian') {
        const guardian = await GuardianModel.findOne({ user: user._id })
            .select('_id students')
            .lean();

        const wardIds = uniqueIds(guardian?.students || []);
        const wards = wardIds.length
            ? await StudentModel.find({ _id: { $in: wardIds } })
                  .select('_id class user')
                  .populate({
                      path: 'user',
                      select: 'firstName lastName photo isDeleted isActive',
                  })
                  .lean()
            : [];

        const activeWards = wards.filter(
            (ward) => ward?.user && !ward.user.isDeleted
        );

        return {
            ...base,
            guardianId: guardian?._id || base.guardianId,
            studentIds: activeWards.map((ward) => ward._id.toString()),
            wards: activeWards.map((ward) => ({
                id: String(ward._id),
                _id: ward._id,
                firstName: ward.user?.firstName || '',
                lastName: ward.user?.lastName || '',
                photo: ward.user?.photo || '',
                classId: ward.class || null,
                name: getStudentName(ward),
            })),
        };
    }

    if (base.role === 'teacher') {
        return {
            ...base,
            studentIds: [],
        };
    }

    return {
        ...base,
        studentIds: [],
    };
};

const serializeAttendance = (record) => {
    if (!record) return null;

    const studentDoc =
        record.student && typeof record.student === 'object'
            ? record.student
            : null;
    const classDoc =
        record.class && typeof record.class === 'object' ? record.class : null;
    const lessonDoc =
        record.lesson && typeof record.lesson === 'object'
            ? record.lesson
            : null;
    const teacherDoc =
        record.teacher && typeof record.teacher === 'object'
            ? record.teacher
            : null;

    const studentUser =
        studentDoc?.user && typeof studentDoc.user === 'object'
            ? studentDoc.user
            : null;

    return {
        id: String(record._id),
        _id: record._id,
        status: record.status,
        note: record.note || '',
        date: record.date,
        markedAt: record.markedAt,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        studentId: String(studentDoc?._id || record.student || ''),
        studentName: studentUser
            ? `${studentUser.firstName || ''} ${studentUser.lastName || ''}`.trim()
            : '',
        studentPhoto: studentUser?.photo || '',
        classId: String(classDoc?._id || record.class || ''),
        className: classDoc?.className || '',
        classCode: classDoc?.classCode || '',
        lessonId: String(lessonDoc?._id || record.lesson || ''),
        lessonTitle: lessonDoc?.title || '',
        subject: lessonDoc?.subject || '',
        scheduledAt: lessonDoc?.scheduledAt || record.date,
        teacherId: String(teacherDoc?._id || record.teacher || ''),
        teacher:
            teacherDoc?.user && typeof teacherDoc.user === 'object'
                ? `${teacherDoc.user.firstName || ''} ${teacherDoc.user.lastName || ''}`.trim()
                : '',
    };
};

const attendancePopulate = [
    {
        path: 'student',
        select: 'user class',
        populate: {
            path: 'user',
            select: 'firstName lastName photo isDeleted isActive',
        },
    },
    {
        path: 'class',
        select: 'className classCode',
    },
    {
        path: 'lesson',
        select: 'title subject scheduledAt durationMinutes course class teacher isActive',
    },
    {
        path: 'teacher',
        select: 'user',
        populate: {
            path: 'user',
            select: 'firstName lastName photo',
        },
    },
];

const parseDateBound = (value, endOfDay = false) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        const error = new Error('Invalid date filter');
        error.statusCode = 400;
        throw error;
    }
    if (endOfDay) {
        date.setHours(23, 59, 59, 999);
    } else {
        date.setHours(0, 0, 0, 0);
    }
    return date;
};

const buildAttendanceVisibilityQuery = (context, { from, to, studentId, lessonId, status } = {}) => {
    const query = {};

    if (context.role === 'teacher') {
        if (!context.teacherId) {
            query._id = null;
            return query;
        }
        query.teacher = context.teacherId;
    } else if (context.role === 'student') {
        if (!context.studentId) {
            query._id = null;
            return query;
        }
        query.student = context.studentId;
    } else if (context.role === 'guardian') {
        if (!context.studentIds?.length) {
            query._id = null;
            return query;
        }
        if (studentId) {
            assertValidObjectId(studentId, 'student ID');
            if (!context.studentIds.includes(String(studentId))) {
                const error = new Error(
                    'Access denied. This student is not linked to your account.'
                );
                error.statusCode = 403;
                throw error;
            }
            query.student = studentId;
        } else {
            query.student = {
                $in: context.studentIds.map(
                    (id) => new mongoose.Types.ObjectId(id)
                ),
            };
        }
    } else {
        query._id = null;
        return query;
    }

    if (lessonId) {
        assertValidObjectId(lessonId, 'lesson ID');
        query.lesson = lessonId;
    }

    if (status) {
        if (!ATTENDANCE_STATUSES.includes(status)) {
            const error = new Error('Invalid attendance status filter');
            error.statusCode = 400;
            throw error;
        }
        query.status = status;
    }

    const fromDate = parseDateBound(from, false);
    const toDate = parseDateBound(to, true);
    if (fromDate || toDate) {
        query.date = {};
        if (fromDate) query.date.$gte = fromDate;
        if (toDate) query.date.$lte = toDate;
    }

    return query;
};

const summarizeRecords = (records = []) => {
    const counts = {
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
    };

    for (const record of records) {
        if (counts[record.status] != null) {
            counts[record.status] += 1;
        }
    }

    const total =
        counts.present + counts.absent + counts.late + counts.excused;
    const attended = counts.present + counts.late;
    const presentRate = total ? Math.round((attended / total) * 100) : 0;

    return {
        total,
        ...counts,
        presentRate,
    };
};

/** Accurate status totals for one student (all records, no populate/limit skew). */
const summarizeStudentAttendance = async (studentId) => {
    if (!studentId || !mongoose.Types.ObjectId.isValid(String(studentId))) {
        return summarizeRecords([]);
    }

    const AttendanceModel = require('../models/attendance.model.js');
    const rows = await AttendanceModel.aggregate([
        {
            $match: {
                student: new mongoose.Types.ObjectId(String(studentId)),
            },
        },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
            },
        },
    ]);

    const counts = {
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
    };

    for (const row of rows) {
        if (counts[row._id] != null) {
            counts[row._id] = row.count;
        }
    }

    const total =
        counts.present + counts.absent + counts.late + counts.excused;
    const attended = counts.present + counts.late;

    return {
        total,
        ...counts,
        presentRate: total ? Math.round((attended / total) * 100) : 0,
    };
};

const canViewLessonAttendance = (lesson, context) => {
    if (!lesson || !context?.role) return false;
    return canAccessLesson(lesson, context);
};

module.exports = {
    ATTENDANCE_STATUSES,
    assertValidObjectId,
    resolveAttendanceContext,
    serializeAttendance,
    serializeLesson,
    lessonPopulate,
    attendancePopulate,
    buildAttendanceVisibilityQuery,
    summarizeRecords,
    summarizeStudentAttendance,
    canViewLessonAttendance,
    getStudentName,
};

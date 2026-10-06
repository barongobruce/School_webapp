const AttendanceModel = require('../../models/attendance.model.js');
const LessonModel = require('../../models/lesson.model.js');
const StudentModel = require('../../models/student.model.js');
const {
    resolveAttendanceContext,
    serializeAttendance,
    serializeLesson,
    lessonPopulate,
    attendancePopulate,
    buildAttendanceVisibilityQuery,
    summarizeRecords,
    canViewLessonAttendance,
    assertValidObjectId,
    getStudentName,
} = require('../../utils/attendanceAccess.js');

const getMyAttendance = async (req, res, next) => {
    try {
        const context = await resolveAttendanceContext(req.user);
        const query = buildAttendanceVisibilityQuery(context, req.query);

        if (query._id === null) {
            return res.json({
                count: 0,
                records: [],
                wards: context.wards || [],
            });
        }

        const records = await AttendanceModel.find(query)
            .populate(attendancePopulate)
            .sort({ date: -1, createdAt: -1 })
            .lean();

        const visible = records.filter((record) => {
            const studentUser = record.student?.user;
            return studentUser && !studentUser.isDeleted;
        });

        res.json({
            count: visible.length,
            records: visible.map(serializeAttendance),
            wards: context.wards || [],
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        next(error);
    }
};

const getMyAttendanceSummary = async (req, res, next) => {
    try {
        const context = await resolveAttendanceContext(req.user);
        const query = buildAttendanceVisibilityQuery(context, req.query);

        if (query._id === null) {
            return res.json({
                summary: summarizeRecords([]),
                byStatus: [],
                recent: [],
                wards: context.wards || [],
            });
        }

        const records = await AttendanceModel.find(query)
            .populate(attendancePopulate)
            .sort({ date: -1 })
            .lean();

        const visible = records.filter((record) => {
            const studentUser = record.student?.user;
            return studentUser && !studentUser.isDeleted;
        });

        const summary = summarizeRecords(visible);
        const byStatus = [
            { status: 'present', count: summary.present },
            { status: 'absent', count: summary.absent },
            { status: 'late', count: summary.late },
            { status: 'excused', count: summary.excused },
        ];

        const byDayMap = new Map();
        for (const record of visible) {
            const day = new Date(record.date).toISOString().slice(0, 10);
            if (!byDayMap.has(day)) {
                byDayMap.set(day, {
                    date: day,
                    present: 0,
                    absent: 0,
                    late: 0,
                    excused: 0,
                    total: 0,
                });
            }
            const bucket = byDayMap.get(day);
            bucket.total += 1;
            if (bucket[record.status] != null) bucket[record.status] += 1;
        }

        const byDay = [...byDayMap.values()].sort((a, b) =>
            a.date.localeCompare(b.date)
        );

        res.json({
            summary,
            byStatus,
            byDay,
            recent: visible.slice(0, 12).map(serializeAttendance),
            wards: context.wards || [],
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        next(error);
    }
};

const getMyLessonAttendance = async (req, res, next) => {
    try {
        const { lessonId } = req.params;
        assertValidObjectId(lessonId, 'lesson ID');

        const context = await resolveAttendanceContext(req.user);
        const lesson = await LessonModel.findOne({
            _id: lessonId,
            isActive: true,
        })
            .populate(lessonPopulate)
            .lean();

        if (!lesson || !canViewLessonAttendance(lesson, context)) {
            return res.status(404).json({ message: 'Lesson not found' });
        }

        const query = { lesson: lesson._id };

        if (context.role === 'student') {
            query.student = context.studentId;
        } else if (context.role === 'guardian') {
            if (!context.studentIds?.length) {
                return res.json({
                    lesson: serializeLesson(lesson),
                    records: [],
                    summary: summarizeRecords([]),
                });
            }
            query.student = { $in: context.studentIds };
        } else if (context.role === 'teacher') {
            if (
                String(lesson.teacher?._id || lesson.teacher) !==
                String(context.teacherId)
            ) {
                return res.status(404).json({ message: 'Lesson not found' });
            }
        }

        const records = await AttendanceModel.find(query)
            .populate(attendancePopulate)
            .sort({ 'student.user.lastName': 1 })
            .lean();

        const serialized = records
            .filter((record) => record.student?.user && !record.student.user.isDeleted)
            .map(serializeAttendance)
            .sort((a, b) =>
                (a.studentName || '').localeCompare(b.studentName || '', undefined, {
                    sensitivity: 'base',
                })
            );

        res.json({
            lesson: serializeLesson(lesson),
            records: serialized,
            summary: summarizeRecords(serialized),
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        next(error);
    }
};

const getMyAttendanceWards = async (req, res, next) => {
    try {
        const context = await resolveAttendanceContext(req.user);

        if (context.role === 'student' && context.studentId) {
            const student = await StudentModel.findById(context.studentId)
                .select('user class')
                .populate({
                    path: 'user',
                    select: 'firstName lastName photo isDeleted',
                })
                .lean();

            if (!student?.user || student.user.isDeleted) {
                return res.json({ wards: [] });
            }

            return res.json({
                wards: [
                    {
                        id: String(student._id),
                        name: getStudentName(student),
                        firstName: student.user.firstName || '',
                        lastName: student.user.lastName || '',
                        photo: student.user.photo || '',
                        classId: student.class || null,
                    },
                ],
            });
        }

        res.json({ wards: context.wards || [] });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMyAttendance,
    getMyAttendanceSummary,
    getMyLessonAttendance,
    getMyAttendanceWards,
};

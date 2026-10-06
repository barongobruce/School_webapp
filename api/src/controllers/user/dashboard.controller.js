const mongoose = require('mongoose');
const LessonModel = require('../../models/lesson.model.js');
const HomeworkModel = require('../../models/homework.model.js');
const AttendanceModel = require('../../models/attendance.model.js');
const ComplaintModel = require('../../models/complaint.model.js');
const StudentModel = require('../../models/student.model.js');
const GuardianModel = require('../../models/guardian.model.js');
const ClassModel = require('../../models/class.model.js');
const TeacherModel = require('../../models/teacher.model.js');
const {
    resolveAccessContext,
    serializeLesson,
    lessonPopulate,
    getAccessibleCourses,
} = require('../../utils/lessonAccess.js');
const {
    serializeHomework,
    homeworkPopulate,
    buildHomeworkVisibilityQuery,
} = require('../../utils/homeworkAccess.js');
const {
    serializeAttendance,
    attendancePopulate,
    summarizeRecords,
    summarizeStudentAttendance,
    resolveAttendanceContext,
} = require('../../utils/attendanceAccess.js');
const {
    listAnnouncementsForRole,
} = require('./announcement.controller.js');

const startOfDay = (date = new Date()) => {
    const next = new Date(date);
    next.setHours(0, 0, 0, 0);
    return next;
};

const addDays = (date, days) => {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
};

/** Monday 00:00 of the week containing `date` (local). */
const startOfWeekMonday = (date = new Date()) => {
    const day = startOfDay(date);
    const weekday = day.getDay();
    const diff = weekday === 0 ? -6 : 1 - weekday;
    return addDays(day, diff);
};

/** Current Mon → end of next work week (enough for week nav on the home timetable). */
const getScheduleWindow = (date = new Date()) => {
    const weekStart = startOfWeekMonday(date);
    return {
        weekStart,
        scheduleEnd: addDays(weekStart, 12), // Friday of next week
    };
};

const personName = (user) => {
    if (!user || typeof user !== 'object') return '';
    return `${user.firstName || ''} ${user.lastName || ''}`.trim();
};

const isOpenComplaint = (complaint) => {
    const statuses = Array.isArray(complaint.status)
        ? complaint.status
        : [complaint.status];
    return !statuses.includes('resolved');
};

const loadStudentProfile = async (userId) => {
    const student = await StudentModel.findOne({ user: userId })
        .select('class guardian emergencyContact')
        .populate({
            path: 'class',
            select: 'className classCode grade academicYear isActive teachers',
            populate: {
                path: 'teachers',
                select: 'user',
                populate: {
                    path: 'user',
                    select: 'firstName lastName photo isDeleted',
                },
            },
        })
        .populate({
            path: 'guardian',
            select: 'user',
            populate: {
                path: 'user',
                select: 'firstName lastName email photo contactInfo isDeleted',
            },
        })
        .lean();

    if (!student) return null;

    const guardianUser =
        student.guardian?.user && !student.guardian.user.isDeleted
            ? student.guardian.user
            : null;

    const classItem =
        student.class && typeof student.class === 'object'
            ? student.class
            : null;

    const teachers = (classItem?.teachers || [])
        .filter((teacher) => teacher?.user && !teacher.user.isDeleted)
        .map((teacher) => ({
            id: String(teacher._id),
            name: personName(teacher.user),
            photo: teacher.user.photo || '',
        }));

    return {
        studentId: String(student._id),
        classId: classItem?._id ? String(classItem._id) : null,
        className: classItem?.className || '',
        classCode: classItem?.classCode || '',
        grade: classItem?.grade ?? null,
        academicYear: classItem?.academicYear || '',
        emergencyContact: student.emergencyContact || '',
        guardian: guardianUser
            ? {
                  id: String(student.guardian._id),
                  name: personName(guardianUser),
                  email: guardianUser.email || '',
                  photo: guardianUser.photo || '',
                  phone: guardianUser.contactInfo?.phone || '',
              }
            : null,
        teachers,
    };
};

const getStudentDashboard = async (req, res) => {
    const user = req.user;
    const context = await resolveAccessContext(user);
    const today = startOfDay();
    const horizon = addDays(today, 14);
    const overdueFloor = addDays(today, -14);
    const { weekStart, scheduleEnd } = getScheduleWindow(today);

    const classFilter = context.classIds.length
        ? {
              $in: context.classIds.map(
                  (id) => new mongoose.Types.ObjectId(id)
              ),
          }
        : null;

    const lessonQuery = {
        isActive: true,
        scheduledAt: { $gte: today, $lte: horizon },
    };
    const scheduleQuery = {
        isActive: true,
        scheduledAt: { $gte: weekStart, $lte: scheduleEnd },
    };
    if (classFilter) {
        lessonQuery.class = classFilter;
        scheduleQuery.class = classFilter;
    } else {
        lessonQuery._id = null;
        scheduleQuery._id = null;
    }

    const homeworkQuery = buildHomeworkVisibilityQuery(context);
    if (homeworkQuery._id !== null) {
        homeworkQuery.dueDate = { $gte: overdueFloor, $lte: horizon };
    }

    const profilePromise = loadStudentProfile(user._id);
    const coursesPromise = getAccessibleCourses(context);

    const lessonsListPromise =
        lessonQuery._id === null
            ? Promise.resolve([])
            : LessonModel.find(lessonQuery)
                  .populate(lessonPopulate)
                  .sort({ scheduledAt: 1 })
                  .limit(5)
                  .lean();

    const scheduleLessonsPromise =
        scheduleQuery._id === null
            ? Promise.resolve([])
            : LessonModel.find(scheduleQuery)
                  .populate(lessonPopulate)
                  .sort({ scheduledAt: 1 })
                  .limit(80)
                  .lean();

    const lessonsCountPromise =
        lessonQuery._id === null
            ? Promise.resolve(0)
            : LessonModel.countDocuments(lessonQuery);

    const homeworksListPromise =
        homeworkQuery._id === null
            ? Promise.resolve([])
            : HomeworkModel.find(homeworkQuery)
                  .populate(homeworkPopulate)
                  .sort({ dueDate: 1 })
                  .limit(8)
                  .lean();

    const homeworksAllPromise =
        homeworkQuery._id === null
            ? Promise.resolve([])
            : HomeworkModel.find(homeworkQuery)
                  .select('dueDate')
                  .lean();

    const attendanceRecentPromise = context.studentId
        ? AttendanceModel.find({ student: context.studentId })
              .populate(attendancePopulate)
              .sort({ date: -1, createdAt: -1 })
              .limit(8)
              .lean()
        : Promise.resolve([]);

    const attendanceSummaryPromise = context.studentId
        ? summarizeStudentAttendance(context.studentId)
        : Promise.resolve(summarizeRecords([]));

    const announcementsPromise = listAnnouncementsForRole('student', 5);

    const complaintsPromise = (async () => {
        const student = await StudentModel.findOne({ user: user._id })
            .select('_id')
            .lean();
        const profileId = student?._id;
        const userComplaintIds = (user.complaints || []).map(String);
        const orFilters = [];
        if (userComplaintIds.length) {
            orFilters.push({ _id: { $in: userComplaintIds } });
        }
        if (profileId) {
            orFilters.push({ reporter: profileId });
        }
        if (!orFilters.length) return [];
        return ComplaintModel.find({ $or: orFilters })
            .select('status title dateFiled')
            .sort({ dateFiled: -1 })
            .lean();
    })();

    const [
        profile,
        courses,
        lessons,
        scheduleLessons,
        upcomingLessonsCount,
        homeworks,
        homeworkDates,
        attendanceRecords,
        attendanceSummary,
        announcements,
        complaints,
    ] = await Promise.all([
        profilePromise,
        coursesPromise,
        lessonsListPromise,
        scheduleLessonsPromise,
        lessonsCountPromise,
        homeworksListPromise,
        homeworksAllPromise,
        attendanceRecentPromise,
        attendanceSummaryPromise,
        announcementsPromise,
        complaintsPromise,
    ]);

    const serializedLessons = lessons.map(serializeLesson);
    const serializedScheduleLessons = scheduleLessons.map(serializeLesson);
    const serializedHomeworks = homeworks.map(serializeHomework).map((item) => {
        const due = new Date(item.dueDate);
        const overdue = !Number.isNaN(due.getTime()) && due < today;
        const dueSoon =
            !overdue &&
            !Number.isNaN(due.getTime()) &&
            due <= addDays(today, 3);
        return {
            ...item,
            overdue,
            dueSoon,
        };
    });

    let overdueHomeworkCount = 0;
    let dueHomeworkCount = 0;
    for (const item of homeworkDates) {
        const due = new Date(item.dueDate);
        if (Number.isNaN(due.getTime())) continue;
        if (due < today) overdueHomeworkCount += 1;
        else dueHomeworkCount += 1;
    }

    const recentAttendance = attendanceRecords
        .filter(
            (record) =>
                !record.student?.user || !record.student.user.isDeleted
        )
        .slice(0, 5)
        .map(serializeAttendance);

    const openComplaints = complaints.filter(isOpenComplaint);
    const overdueHomeworks = serializedHomeworks.filter((item) => item.overdue);
    const upcomingHomeworks = serializedHomeworks.filter((item) => !item.overdue);

    res.json({
        role: 'student',
        supported: true,
        user: {
            id: String(user._id),
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            photo: user.photo || '',
        },
        profile,
        stats: {
            courses: courses.length,
            upcomingLessons: upcomingLessonsCount,
            dueHomeworks: dueHomeworkCount,
            overdueHomeworks: overdueHomeworkCount,
            presentRate: attendanceSummary.presentRate,
            attendanceTotal: attendanceSummary.total,
            openComplaints: openComplaints.length,
        },
        upcomingLessons: serializedLessons,
        scheduleLessons: serializedScheduleLessons,
        dueHomeworks: [...overdueHomeworks, ...upcomingHomeworks].slice(0, 5),
        attendanceSummary,
        attendanceByStatus: [
            { status: 'present', count: attendanceSummary.present },
            { status: 'absent', count: attendanceSummary.absent },
            { status: 'late', count: attendanceSummary.late },
            { status: 'excused', count: attendanceSummary.excused },
        ],
        recentAttendance,
        announcements,
        courses: courses.slice(0, 6),
        openComplaints: openComplaints.slice(0, 3).map((item) => ({
            id: String(item._id),
            title: item.title,
            status: Array.isArray(item.status)
                ? item.status[0] || 'pending'
                : item.status || 'pending',
            dateFiled: item.dateFiled,
        })),
    });
};

const buildAttendanceByDay = (records = [], days = 14) => {
    const today = startOfDay();
    const start = addDays(today, -(days - 1));
    const map = new Map();

    for (let i = 0; i < days; i += 1) {
        const day = addDays(start, i);
        const key = day.toISOString().slice(0, 10);
        map.set(key, {
            date: key,
            present: 0,
            absent: 0,
            late: 0,
            excused: 0,
            total: 0,
        });
    }

    for (const record of records) {
        const key = new Date(record.date).toISOString().slice(0, 10);
        if (!map.has(key)) continue;
        const bucket = map.get(key);
        bucket.total += 1;
        if (bucket[record.status] != null) bucket[record.status] += 1;
    }

    return [...map.values()];
};

const getGuardianDashboard = async (req, res) => {
    const user = req.user;
    const context = await resolveAccessContext(user);
    const attendanceContext = await resolveAttendanceContext(user);
    const today = startOfDay();
    const horizon = addDays(today, 14);
    const overdueFloor = addDays(today, -14);
    const attendanceFloor = addDays(today, -45);
    const { weekStart, scheduleEnd } = getScheduleWindow(today);

    const wards = await StudentModel.find({
        _id: { $in: attendanceContext.studentIds || [] },
    })
        .select('user class')
        .populate({
            path: 'user',
            select: 'firstName lastName photo isDeleted isActive',
        })
        .populate({
            path: 'class',
            select: 'className classCode grade academicYear',
        })
        .lean();

    const activeWards = wards
        .filter((ward) => ward?.user && !ward.user.isDeleted)
        .map((ward) => ({
            id: String(ward._id),
            firstName: ward.user.firstName || '',
            lastName: ward.user.lastName || '',
            name: personName(ward.user) || 'Student',
            photo: ward.user.photo || '',
            classId: ward.class?._id ? String(ward.class._id) : null,
            className: ward.class?.className || '',
            classCode: ward.class?.classCode || '',
            grade: ward.class?.grade ?? null,
            academicYear: ward.class?.academicYear || '',
        }));

    const wardIds = activeWards.map((ward) => ward.id);
    const classIds = context.classIds || [];

    const lessonQuery = {
        isActive: true,
        scheduledAt: { $gte: today, $lte: horizon },
    };
    const scheduleQuery = {
        isActive: true,
        scheduledAt: { $gte: weekStart, $lte: scheduleEnd },
    };
    if (classIds.length) {
        const classFilter = {
            $in: classIds.map((id) => new mongoose.Types.ObjectId(id)),
        };
        lessonQuery.class = classFilter;
        scheduleQuery.class = classFilter;
    } else {
        lessonQuery._id = null;
        scheduleQuery._id = null;
    }

    const homeworkQuery = buildHomeworkVisibilityQuery(context);
    if (homeworkQuery._id !== null) {
        homeworkQuery.dueDate = { $gte: overdueFloor, $lte: horizon };
    }

    const coursesPromise = getAccessibleCourses(context);

    const lessonsListPromise =
        lessonQuery._id === null
            ? Promise.resolve([])
            : LessonModel.find(lessonQuery)
                  .populate(lessonPopulate)
                  .sort({ scheduledAt: 1 })
                  .limit(6)
                  .lean();

    const scheduleLessonsPromise =
        scheduleQuery._id === null
            ? Promise.resolve([])
            : LessonModel.find(scheduleQuery)
                  .populate(lessonPopulate)
                  .sort({ scheduledAt: 1 })
                  .limit(80)
                  .lean();

    const lessonsCountPromise =
        lessonQuery._id === null
            ? Promise.resolve(0)
            : LessonModel.countDocuments(lessonQuery);

    const homeworksListPromise =
        homeworkQuery._id === null
            ? Promise.resolve([])
            : HomeworkModel.find(homeworkQuery)
                  .populate(homeworkPopulate)
                  .sort({ dueDate: 1 })
                  .limit(8)
                  .lean();

    const homeworksAllPromise =
        homeworkQuery._id === null
            ? Promise.resolve([])
            : HomeworkModel.find(homeworkQuery)
                  .select('dueDate')
                  .lean();

    const attendancePromise = wardIds.length
        ? AttendanceModel.find({
              student: { $in: wardIds },
              date: { $gte: attendanceFloor },
          })
              .populate(attendancePopulate)
              .sort({ date: -1 })
              .lean()
        : Promise.resolve([]);

    const announcementsPromise = listAnnouncementsForRole('guardian', 6);

    const complaintsPromise = (async () => {
        const guardian = await GuardianModel.findOne({ user: user._id })
            .select('_id')
            .lean();
        const profileId = guardian?._id;
        const userComplaintIds = (user.complaints || []).map(String);
        const orFilters = [];
        if (userComplaintIds.length) {
            orFilters.push({ _id: { $in: userComplaintIds } });
        }
        if (profileId) {
            orFilters.push({ reporter: profileId });
        }
        if (!orFilters.length) return [];
        return ComplaintModel.find({ $or: orFilters })
            .select('status title dateFiled')
            .sort({ dateFiled: -1 })
            .lean();
    })();

    const [
        courses,
        lessons,
        scheduleLessons,
        upcomingLessonsCount,
        homeworks,
        homeworkDates,
        attendanceRecords,
        announcements,
        complaints,
    ] = await Promise.all([
        coursesPromise,
        lessonsListPromise,
        scheduleLessonsPromise,
        lessonsCountPromise,
        homeworksListPromise,
        homeworksAllPromise,
        attendancePromise,
        announcementsPromise,
        complaintsPromise,
    ]);

    const serializedLessons = lessons.map(serializeLesson);
    const serializedScheduleLessons = scheduleLessons.map(serializeLesson);
    const serializedHomeworks = homeworks.map(serializeHomework).map((item) => {
        const due = new Date(item.dueDate);
        const overdue = !Number.isNaN(due.getTime()) && due < today;
        const dueSoon =
            !overdue &&
            !Number.isNaN(due.getTime()) &&
            due <= addDays(today, 3);
        return { ...item, overdue, dueSoon };
    });

    let overdueHomeworkCount = 0;
    let dueHomeworkCount = 0;
    for (const item of homeworkDates) {
        const due = new Date(item.dueDate);
        if (Number.isNaN(due.getTime())) continue;
        if (due < today) overdueHomeworkCount += 1;
        else dueHomeworkCount += 1;
    }

    const visibleAttendance = attendanceRecords.filter(
        (record) => record.student?.user && !record.student.user.isDeleted
    );
    const attendanceSummary = summarizeRecords(visibleAttendance);
    const recentAttendance = visibleAttendance
        .slice(0, 6)
        .map(serializeAttendance);

    // Per-ward rates from full history (not just the 45-day dashboard window)
    const wardSummaries = await Promise.all(
        activeWards.map(async (ward) => {
            const summary = await summarizeStudentAttendance(ward.id);
            return { studentId: ward.id, ...summary };
        })
    );

    const attendanceByWard = wardSummaries.map((item) => ({
        studentId: item.studentId,
        name:
            activeWards.find((ward) => ward.id === item.studentId)?.name ||
            'Student',
        present: item.present,
        absent: item.absent,
        late: item.late,
        excused: item.excused,
        total: item.total,
        presentRate: item.presentRate,
    }));

    const wardsWithStats = activeWards.map((ward) => {
        const stats =
            attendanceByWard.find((item) => item.studentId === ward.id) || {};
        return {
            ...ward,
            presentRate: stats.presentRate || 0,
            attendanceTotal: stats.total || 0,
            attendanceSummary: {
                present: stats.present || 0,
                absent: stats.absent || 0,
                late: stats.late || 0,
                excused: stats.excused || 0,
                total: stats.total || 0,
                presentRate: stats.presentRate || 0,
            },
        };
    });

    const openComplaints = complaints.filter(isOpenComplaint);
    const overdueHomeworks = serializedHomeworks.filter((item) => item.overdue);
    const upcomingHomeworks = serializedHomeworks.filter((item) => !item.overdue);

    res.json({
        role: 'guardian',
        supported: true,
        user: {
            id: String(user._id),
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            photo: user.photo || '',
        },
        wards: wardsWithStats,
        stats: {
            wards: wardsWithStats.length,
            courses: courses.length,
            upcomingLessons: upcomingLessonsCount,
            dueHomeworks: dueHomeworkCount,
            overdueHomeworks: overdueHomeworkCount,
            presentRate: attendanceSummary.presentRate,
            attendanceTotal: attendanceSummary.total,
            openComplaints: openComplaints.length,
        },
        attendanceSummary,
        attendanceByStatus: [
            { status: 'present', count: attendanceSummary.present },
            { status: 'absent', count: attendanceSummary.absent },
            { status: 'late', count: attendanceSummary.late },
            { status: 'excused', count: attendanceSummary.excused },
        ],
        attendanceByWard,
        attendanceByDay: buildAttendanceByDay(visibleAttendance, 14),
        upcomingLessons: serializedLessons,
        scheduleLessons: serializedScheduleLessons,
        dueHomeworks: [...overdueHomeworks, ...upcomingHomeworks].slice(0, 5),
        recentAttendance,
        announcements,
        openComplaints: openComplaints.slice(0, 3).map((item) => ({
            id: String(item._id),
            title: item.title,
            status: Array.isArray(item.status)
                ? item.status[0] || 'pending'
                : item.status || 'pending',
            dateFiled: item.dateFiled,
        })),
    });
};

const getTeacherDashboard = async (req, res) => {
    const user = req.user;
    const context = await resolveAccessContext(user);
    const today = startOfDay();
    const horizon = addDays(today, 14);
    const overdueFloor = addDays(today, -7);
    const attendanceFloor = addDays(today, -45);
    const { weekStart, scheduleEnd } = getScheduleWindow(today);
    const teacherId = context.teacherId;

    if (!teacherId) {
        return res.json({
            role: 'teacher',
            supported: true,
            user: {
                id: String(user._id),
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                photo: user.photo || '',
            },
            classes: [],
            stats: {
                classes: 0,
                students: 0,
                upcomingLessons: 0,
                needsAttendance: 0,
                dueHomeworks: 0,
                presentRate: 0,
                attendanceTotal: 0,
                openComplaints: 0,
            },
            attendanceSummary: summarizeRecords([]),
            attendanceByStatus: [
                { status: 'present', count: 0 },
                { status: 'absent', count: 0 },
                { status: 'late', count: 0 },
                { status: 'excused', count: 0 },
            ],
            attendanceByClass: [],
            attendanceByDay: buildAttendanceByDay([], 14),
            upcomingLessons: [],
            scheduleLessons: [],
            needsAttendance: [],
            dueHomeworks: [],
            recentAttendance: [],
            openComplaints: [],
        });
    }

    const classIds = context.classIds || [];
    const teacherObjectId = new mongoose.Types.ObjectId(teacherId);

    const classesPromise = classIds.length
        ? ClassModel.find({ _id: { $in: classIds }, isActive: true })
              .select('className classCode grade academicYear students coverImage')
              .sort({ className: 1 })
              .lean()
        : Promise.resolve([]);

    const coursesPromise = getAccessibleCourses(context);

    const upcomingLessonsPromise = LessonModel.find({
        teacher: teacherObjectId,
        isActive: true,
        scheduledAt: { $gte: today, $lte: horizon },
    })
        .populate(lessonPopulate)
        .sort({ scheduledAt: 1 })
        .limit(6)
        .lean();

    const scheduleLessonsPromise = LessonModel.find({
        teacher: teacherObjectId,
        isActive: true,
        scheduledAt: { $gte: weekStart, $lte: scheduleEnd },
    })
        .populate(lessonPopulate)
        .sort({ scheduledAt: 1 })
        .limit(80)
        .lean();

    const upcomingLessonsCountPromise = LessonModel.countDocuments({
        teacher: teacherObjectId,
        isActive: true,
        scheduledAt: { $gte: today, $lte: horizon },
    });

    const recentLessonsPromise = LessonModel.find({
        teacher: teacherObjectId,
        isActive: true,
        scheduledAt: { $gte: addDays(today, -14), $lte: addDays(today, 1) },
    })
        .populate(lessonPopulate)
        .sort({ scheduledAt: -1 })
        .lean();

    const homeworksPromise = HomeworkModel.find({
        teacher: teacherObjectId,
        isActive: true,
        dueDate: { $gte: overdueFloor, $lte: horizon },
    })
        .populate(homeworkPopulate)
        .sort({ dueDate: 1 })
        .limit(8)
        .lean();

    const homeworksCountPromise = HomeworkModel.find({
        teacher: teacherObjectId,
        isActive: true,
        dueDate: { $gte: overdueFloor, $lte: horizon },
    })
        .select('dueDate')
        .lean();

    const attendancePromise = AttendanceModel.find({
        teacher: teacherObjectId,
        date: { $gte: attendanceFloor },
    })
        .populate(attendancePopulate)
        .sort({ date: -1 })
        .lean();

    const complaintsPromise = (async () => {
        const teacher = await TeacherModel.findById(teacherId).select('_id').lean();
        const profileId = teacher?._id;
        const userComplaintIds = (user.complaints || []).map(String);
        const orFilters = [];
        if (userComplaintIds.length) {
            orFilters.push({ _id: { $in: userComplaintIds } });
        }
        if (profileId) {
            orFilters.push({ reporter: profileId });
        }
        if (!orFilters.length) return [];
        return ComplaintModel.find({ $or: orFilters })
            .select('status title dateFiled')
            .sort({ dateFiled: -1 })
            .lean();
    })();

    const [
        classes,
        courses,
        upcomingLessons,
        scheduleLessons,
        upcomingLessonsCount,
        recentLessons,
        homeworks,
        homeworkDates,
        attendanceRecords,
        complaints,
    ] = await Promise.all([
        classesPromise,
        coursesPromise,
        upcomingLessonsPromise,
        scheduleLessonsPromise,
        upcomingLessonsCountPromise,
        recentLessonsPromise,
        homeworksPromise,
        homeworksCountPromise,
        attendancePromise,
        complaintsPromise,
    ]);

    const studentCount = classes.reduce(
        (sum, classItem) => sum + (classItem.students || []).length,
        0
    );

    const rosterSizeByClass = new Map(
        classes.map((classItem) => [
            String(classItem._id),
            (classItem.students || []).length,
        ])
    );

    const lessonIds = recentLessons.map((lesson) => lesson._id);
    const attendanceByLesson = lessonIds.length
        ? await AttendanceModel.aggregate([
              { $match: { lesson: { $in: lessonIds } } },
              {
                  $group: {
                      _id: '$lesson',
                      total: { $sum: 1 },
                  },
              },
          ])
        : [];

    const markedByLesson = new Map(
        attendanceByLesson.map((item) => [String(item._id), item.total || 0])
    );

    const needsAttendanceAll = recentLessons
        .filter((lesson) => {
            const scheduled = new Date(lesson.scheduledAt);
            if (Number.isNaN(scheduled.getTime()) || scheduled > addDays(today, 1)) {
                return false;
            }
            const rosterSize =
                rosterSizeByClass.get(String(lesson.class?._id || lesson.class || '')) ||
                0;
            const marked = markedByLesson.get(String(lesson._id)) || 0;
            return rosterSize === 0 ? marked === 0 : marked < rosterSize;
        })
        .map((lesson) => {
            const serialized = serializeLesson(lesson);
            const rosterSize =
                rosterSizeByClass.get(String(lesson.class?._id || lesson.class || '')) ||
                0;
            const markedCount = markedByLesson.get(String(lesson._id)) || 0;
            return {
                ...serialized,
                attendance: {
                    rosterSize,
                    markedCount,
                    unmarkedCount: Math.max(rosterSize - markedCount, 0),
                    isComplete: rosterSize > 0 && markedCount >= rosterSize,
                    isMarked: markedCount > 0,
                },
            };
        });
    const needsAttendance = needsAttendanceAll.slice(0, 5);

    const serializedHomeworks = homeworks.map(serializeHomework).map((item) => {
        const due = new Date(item.dueDate);
        const overdue = !Number.isNaN(due.getTime()) && due < today;
        const dueSoon =
            !overdue &&
            !Number.isNaN(due.getTime()) &&
            due <= addDays(today, 3);
        return { ...item, overdue, dueSoon };
    });

    let overdueHomeworkCount = 0;
    let dueHomeworkCount = 0;
    for (const item of homeworkDates) {
        const due = new Date(item.dueDate);
        if (Number.isNaN(due.getTime())) continue;
        if (due < today) overdueHomeworkCount += 1;
        else dueHomeworkCount += 1;
    }

    const visibleAttendance = attendanceRecords.filter(
        (record) => record.student?.user && !record.student.user.isDeleted
    );
    const attendanceSummary = summarizeRecords(visibleAttendance);
    const recentAttendance = visibleAttendance
        .slice(0, 6)
        .map(serializeAttendance);

    const attendanceByClassMap = new Map(
        classes.map((classItem) => [
            String(classItem._id),
            {
                classId: String(classItem._id),
                className: classItem.className,
                classCode: classItem.classCode || '',
                present: 0,
                absent: 0,
                late: 0,
                excused: 0,
                total: 0,
            },
        ])
    );

    for (const record of visibleAttendance) {
        const classId = String(record.class?._id || record.class || '');
        if (!attendanceByClassMap.has(classId)) continue;
        const bucket = attendanceByClassMap.get(classId);
        bucket.total += 1;
        if (bucket[record.status] != null) bucket[record.status] += 1;
    }

    const attendanceByClass = [...attendanceByClassMap.values()].map((item) => {
        const attended = item.present + item.late;
        return {
            ...item,
            presentRate: item.total
                ? Math.round((attended / item.total) * 100)
                : 0,
        };
    });

    const classCards = classes.map((classItem) => {
        const id = String(classItem._id);
        const attendance =
            attendanceByClass.find((item) => item.classId === id) || {};
        return {
            id,
            className: classItem.className,
            classCode: classItem.classCode || '',
            grade: classItem.grade ?? null,
            academicYear: classItem.academicYear || '',
            coverImage: classItem.coverImage || '',
            studentCount: (classItem.students || []).length,
            presentRate: attendance.presentRate || 0,
            attendanceTotal: attendance.total || 0,
        };
    });

    const openComplaints = complaints.filter(isOpenComplaint);
    const overdueHomeworks = serializedHomeworks.filter((item) => item.overdue);
    const upcomingHomeworks = serializedHomeworks.filter((item) => !item.overdue);

    res.json({
        role: 'teacher',
        supported: true,
        user: {
            id: String(user._id),
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            photo: user.photo || '',
        },
        classes: classCards,
        stats: {
            classes: classCards.length,
            students: studentCount,
            courses: courses.length,
            upcomingLessons: upcomingLessonsCount,
            needsAttendance: needsAttendanceAll.length,
            dueHomeworks: dueHomeworkCount,
            overdueHomeworks: overdueHomeworkCount,
            presentRate: attendanceSummary.presentRate,
            attendanceTotal: attendanceSummary.total,
            openComplaints: openComplaints.length,
        },
        attendanceSummary,
        attendanceByStatus: [
            { status: 'present', count: attendanceSummary.present },
            { status: 'absent', count: attendanceSummary.absent },
            { status: 'late', count: attendanceSummary.late },
            { status: 'excused', count: attendanceSummary.excused },
        ],
        attendanceByClass,
        attendanceByDay: buildAttendanceByDay(visibleAttendance, 14),
        upcomingLessons: upcomingLessons.map(serializeLesson),
        scheduleLessons: scheduleLessons.map(serializeLesson),
        needsAttendance,
        dueHomeworks: [...overdueHomeworks, ...upcomingHomeworks].slice(0, 5),
        recentAttendance,
        openComplaints: openComplaints.slice(0, 3).map((item) => ({
            id: String(item._id),
            title: item.title,
            status: Array.isArray(item.status)
                ? item.status[0] || 'pending'
                : item.status || 'pending',
            dateFiled: item.dateFiled,
        })),
    });
};

const getMyDashboard = async (req, res, next) => {
    try {
        if (req.user.role === 'student') {
            return getStudentDashboard(req, res);
        }

        if (req.user.role === 'guardian') {
            return getGuardianDashboard(req, res);
        }

        if (req.user.role === 'teacher') {
            return getTeacherDashboard(req, res);
        }

        res.json({
            role: req.user.role,
            supported: false,
            user: {
                id: String(req.user._id),
                firstName: req.user.firstName || '',
                lastName: req.user.lastName || '',
                email: req.user.email || '',
                photo: req.user.photo || '',
            },
            message:
                'A tailored home dashboard for this role is not available yet. Use the sidebar to continue.',
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMyDashboard,
};

const StudentModel = require('../../models/student.model.js');
const TeacherModel = require('../../models/teacher.model.js');
const GuardianModel = require('../../models/guardian.model.js');
const ClassModel = require('../../models/class.model.js');
const CourseModel = require('../../models/course.model.js');
const ComplaintModel = require('../../models/complaint.model.js');
const AnnouncementModel = require('../../models/announcement.model.js');
const { UserModel } = require('../../models/user.model.js');
const LessonModel = require('../../models/lesson.model.js');
const HomeworkModel = require('../../models/homework.model.js');
const AttendanceModel = require('../../models/attendance.model.js');

const firstEnum = (value) => {
    if (Array.isArray(value)) return value[0] || '';
    return value || '';
};

const personName = (user) => {
    if (!user || typeof user !== 'object') return '';
    return `${user.firstName || ''} ${user.lastName || ''}`.trim();
};

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

const monthLabel = (year, month) => {
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
};

const buildEnrollmentBuckets = (months = 6) => {
    const now = new Date();
    const buckets = [];

    for (let i = months - 1; i >= 0; i -= 1) {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        const year = start.getFullYear();
        const month = start.getMonth() + 1;
        const key = `${year}-${String(month).padStart(2, '0')}`;

        buckets.push({
            key,
            year,
            month,
            label: monthLabel(year, month),
            start,
            end,
        });
    }

    return buckets;
};

const countMapFromAggregate = (rows = [], keyField = '_id') => {
    const map = new Map();
    for (const row of rows) {
        const key = String(row[keyField] || '')
            .trim()
            .toLowerCase();
        if (!key) continue;
        map.set(key, row.count || 0);
    }
    return map;
};

const getAdminDashboard = async (req, res, next) => {
    try {
        const today = startOfDay();
        const weekAhead = addDays(today, 7);
        const weekBehind = addDays(today, -7);
        const enrollmentBuckets = buildEnrollmentBuckets(6);
        const enrollmentStart = enrollmentBuckets[0].start;

        const [
            studentsCount,
            teachersCount,
            guardiansCount,
            classesCount,
            coursesCount,
            activeCourses,
            announcementsCount,
            complaintsCount,
            activeUsers,
            inactiveUsers,
            roleBreakdown,
            openComplaintsCount,
            inProgressComplaintsCount,
            resolvedComplaintsCount,
            lessonsThisWeek,
            homeworksDueSoon,
            attendanceWeek,
            recentStudents,
            recentTeachers,
            recentComplaints,
            recentAnnouncements,
            classSizeDocs,
            enrollmentRows,
            statusRows,
            severityRows,
        ] = await Promise.all([
            StudentModel.countDocuments(),
            TeacherModel.countDocuments(),
            GuardianModel.countDocuments(),
            ClassModel.countDocuments({ isActive: true }),
            CourseModel.countDocuments(),
            CourseModel.countDocuments({ courseStatus: 'Active' }),
            AnnouncementModel.countDocuments(),
            ComplaintModel.countDocuments(),
            UserModel.countDocuments({ isDeleted: { $ne: true }, isActive: true }),
            UserModel.countDocuments({ isDeleted: { $ne: true }, isActive: false }),
            UserModel.aggregate([
                { $match: { isDeleted: { $ne: true } } },
                { $group: { _id: '$role', count: { $sum: 1 } } },
            ]),
            ComplaintModel.countDocuments({ status: 'pending' }),
            ComplaintModel.countDocuments({ status: 'in_progress' }),
            ComplaintModel.countDocuments({ status: 'resolved' }),
            LessonModel.countDocuments({
                isActive: true,
                scheduledAt: { $gte: today, $lte: weekAhead },
            }),
            HomeworkModel.countDocuments({
                isActive: true,
                dueDate: { $gte: today, $lte: weekAhead },
            }),
            AttendanceModel.countDocuments({
                date: { $gte: weekBehind, $lte: addDays(today, 1) },
            }),
            StudentModel.find()
                .select('user class createdAt')
                .populate({
                    path: 'user',
                    select: 'firstName lastName photo email isActive isDeleted',
                })
                .populate({ path: 'class', select: 'className classCode' })
                .sort({ createdAt: -1 })
                .limit(5)
                .lean(),
            TeacherModel.find()
                .select('user classes createdAt')
                .populate({
                    path: 'user',
                    select: 'firstName lastName photo email isActive isDeleted',
                })
                .sort({ createdAt: -1 })
                .limit(5)
                .lean(),
            ComplaintModel.find()
                .select('title status severity category dateFiled createdAt')
                .sort({ dateFiled: -1, createdAt: -1 })
                .limit(6)
                .lean(),
            AnnouncementModel.find()
                .select('title category severity targetAudience createdAt')
                .sort({ createdAt: -1 })
                .limit(5)
                .lean(),
            ClassModel.find({ isActive: true })
                .select('className classCode students')
                .lean(),
            StudentModel.aggregate([
                { $match: { createdAt: { $gte: enrollmentStart } } },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' },
                        },
                        count: { $sum: 1 },
                    },
                },
            ]),
            ComplaintModel.aggregate([
                { $unwind: { path: '$status', preserveNullAndEmptyArrays: true } },
                {
                    $group: {
                        _id: { $toLower: { $ifNull: ['$status', 'pending'] } },
                        count: { $sum: 1 },
                    },
                },
            ]),
            ComplaintModel.aggregate([
                { $unwind: { path: '$severity', preserveNullAndEmptyArrays: true } },
                {
                    $group: {
                        _id: { $toLower: { $ifNull: ['$severity', 'low'] } },
                        count: { $sum: 1 },
                    },
                },
            ]),
        ]);

        const population = ['student', 'teacher', 'guardian'].map((role) => {
            const match = roleBreakdown.find((item) => item._id === role);
            return {
                role,
                name:
                    role === 'student'
                        ? 'Students'
                        : role === 'teacher'
                          ? 'Teachers'
                          : 'Guardians',
                count: match?.count || 0,
            };
        });

        const statusMap = countMapFromAggregate(statusRows);
        const severityMap = countMapFromAggregate(severityRows);

        const complaintsByStatus = [
            {
                status: 'pending',
                label: 'Open',
                count: Math.max(openComplaintsCount, statusMap.get('pending') || 0),
            },
            {
                status: 'in_progress',
                label: 'Under review',
                count: Math.max(
                    inProgressComplaintsCount,
                    statusMap.get('in_progress') || 0
                ),
            },
            {
                status: 'resolved',
                label: 'Resolved',
                count: Math.max(resolvedComplaintsCount, statusMap.get('resolved') || 0),
            },
        ];

        const complaintsBySeverity = [
            {
                severity: 'low',
                label: 'Low',
                count: severityMap.get('low') || 0,
                color: '#3d76c6',
            },
            {
                severity: 'medium',
                label: 'Medium',
                count: severityMap.get('medium') || 0,
                color: '#f4ae17',
            },
            {
                severity: 'high',
                label: 'High',
                count: severityMap.get('high') || 0,
                color: '#f43f5e',
            },
        ];

        const enrollmentCountMap = new Map(
            enrollmentRows.map((row) => [
                `${row._id.year}-${String(row._id.month).padStart(2, '0')}`,
                row.count || 0,
            ])
        );

        const enrollmentTrend = enrollmentBuckets.map((bucket) => ({
            month: bucket.key,
            label: bucket.label,
            count: enrollmentCountMap.get(bucket.key) || 0,
        }));

        const classSizes = classSizeDocs
            .map((classItem) => ({
                id: String(classItem._id),
                name: classItem.className,
                code: classItem.classCode || '',
                students: (classItem.students || []).length,
            }))
            .sort((a, b) => b.students - a.students)
            .slice(0, 8);

        const serializeRecentStudent = (student) => {
            const user = student.user && !student.user.isDeleted ? student.user : null;
            return {
                id: String(student._id),
                name: personName(user) || 'Student',
                photo: user?.photo || '',
                email: user?.email || '',
                isActive: user?.isActive !== false,
                className: student.class?.className || '',
                classCode: student.class?.classCode || '',
                createdAt: student.createdAt,
            };
        };

        const serializeRecentTeacher = (teacher) => {
            const user = teacher.user && !teacher.user.isDeleted ? teacher.user : null;
            return {
                id: String(teacher._id),
                name: personName(user) || 'Teacher',
                photo: user?.photo || '',
                email: user?.email || '',
                isActive: user?.isActive !== false,
                classCount: (teacher.classes || []).length,
                createdAt: teacher.createdAt,
            };
        };

        const openComplaints =
            complaintsByStatus[0].count + complaintsByStatus[1].count;

        const admin = req.admin;

        res.json({
            admin: {
                id: String(admin._id),
                firstName: admin.firstName || '',
                lastName: admin.lastName || '',
                email: admin.email || '',
                photo: admin.photo || '',
                role: admin.role || 'admin',
            },
            stats: {
                students: studentsCount,
                teachers: teachersCount,
                guardians: guardiansCount,
                classes: classesCount,
                courses: coursesCount,
                activeCourses,
                announcements: announcementsCount,
                complaints: complaintsCount,
                openComplaints,
                activeUsers,
                inactiveUsers,
                lessonsThisWeek,
                homeworksDueSoon,
                attendanceWeek,
            },
            population,
            complaintsByStatus,
            complaintsBySeverity,
            classSizes,
            enrollmentTrend,
            recentStudents: recentStudents
                .filter((item) => item.user && !item.user.isDeleted)
                .map(serializeRecentStudent),
            recentTeachers: recentTeachers
                .filter((item) => item.user && !item.user.isDeleted)
                .map(serializeRecentTeacher),
            recentComplaints: recentComplaints.map((item) => ({
                id: String(item._id),
                title: item.title,
                status: String(firstEnum(item.status) || 'pending').toLowerCase(),
                severity: String(firstEnum(item.severity) || 'low').toLowerCase(),
                category: String(firstEnum(item.category) || 'other').toLowerCase(),
                dateFiled: item.dateFiled || item.createdAt,
            })),
            recentAnnouncements: recentAnnouncements.map((item) => ({
                id: String(item._id),
                title: item.title,
                category: String(firstEnum(item.category) || 'general').toLowerCase(),
                severity: String(firstEnum(item.severity) || 'low').toLowerCase(),
                createdAt: item.createdAt,
            })),
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAdminDashboard,
};

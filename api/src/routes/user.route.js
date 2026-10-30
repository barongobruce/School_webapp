const { Router } = require('express');
const {loginUser, getMe, changePassword} = require('../controllers/user.controller');
const { protectUser } = require('../middleware/user.middleware');
const { handleComplaintUpload } = require('../middleware/multer.middleware');
const {makeComplaint, updateComplaint, getComplaints, getComplaintById} = require('../controllers/user/user.controller');
const {getMyCourses, getMyLessons, getMyLessonById} = require('../controllers/user/lesson.controller');
const {getMyHomeworks, getMyHomeworkById} = require('../controllers/user/homework.controller');
const {getMyExams, getMyExamById} = require('../controllers/user/exam.controller');
const {getMyAttendance, getMyAttendanceSummary, getMyLessonAttendance, getMyAttendanceWards} = require('../controllers/user/attendance.controller');
const { getMyDashboard } = require('../controllers/user/dashboard.controller');
const {getMyPayments, getMyPaymentById, checkoutPayment, confirmCheckoutSession} = require('../controllers/user/payment.controller');
const {getMyStudents, getMyStudentById} = require('../controllers/user/student.controller');
const {
    getMyAnnouncements,
    getMyAnnouncementById,
} = require('../controllers/user/announcement.controller');
const { getMyTimetables } = require('../controllers/user/timetable.controller');
const {
    chatWithAiTutor,
    getAiTutorHistory,
    generateAiLearningTool,
    getAiTutorPreferences,
    updateAiTutorPreferences,
    getAiTutorActivityHistory,
    getAiTutorActivity,
    submitAiTutorQuizScore,
} = require('../controllers/user/aiTutor.controller');

const router = Router();

router.post('/login', loginUser);
router.get('/me', protectUser, getMe);
router.get('/ai/chat', protectUser, getAiTutorHistory);
router.post('/ai/chat', protectUser, chatWithAiTutor);
router.get('/ai/preferences', protectUser, getAiTutorPreferences);
router.patch('/ai/preferences', protectUser, updateAiTutorPreferences);
router.get('/ai/tools/:kind', protectUser, getAiTutorActivityHistory);
router.post('/ai/tools/:kind', protectUser, generateAiLearningTool);
router.get('/ai/activities/:id', protectUser, getAiTutorActivity);
router.post('/ai/activities/:id/score', protectUser, submitAiTutorQuizScore);
router.get('/dashboard', protectUser, getMyDashboard);
router.get('/timetables', protectUser, getMyTimetables);
router.patch('/change-password', protectUser, changePassword);
router.get('/complaints', protectUser, getComplaints);
router.get('/complaint/:id', protectUser, getComplaintById);
router.post('/complaint', protectUser, handleComplaintUpload, makeComplaint);
router.patch(
    '/complaint/:id',
    protectUser,
    handleComplaintUpload,
    updateComplaint,
);

router.get('/courses', protectUser, getMyCourses);
router.get('/lessons', protectUser, getMyLessons);
router.get('/lessons/:id', protectUser, getMyLessonById);
router.get('/homeworks', protectUser, getMyHomeworks);
router.get('/homeworks/:id', protectUser, getMyHomeworkById);
router.get('/exams', protectUser, getMyExams);
router.get('/exams/:id', protectUser, getMyExamById);

router.get('/attendance', protectUser, getMyAttendance);
router.get('/attendance/summary', protectUser, getMyAttendanceSummary);
router.get('/attendance/wards', protectUser, getMyAttendanceWards);
router.get('/attendance/lessons/:lessonId', protectUser, getMyLessonAttendance);

router.get('/students', protectUser, getMyStudents);
router.get('/students/:id', protectUser, getMyStudentById);

router.get('/announcements', protectUser, getMyAnnouncements);
router.get('/announcements/:id', protectUser, getMyAnnouncementById);

router.get('/payments', protectUser, getMyPayments);
router.get(
    '/payments/checkout-session/:sessionId',
    protectUser,
    confirmCheckoutSession,
);
router.get('/payments/:id', protectUser, getMyPaymentById);
router.post('/payments/:id/checkout', protectUser, checkoutPayment);

module.exports = router;

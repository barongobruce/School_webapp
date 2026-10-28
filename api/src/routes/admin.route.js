const { Router } = require('express');
const { adminProtector } = require('../middleware/admin.middleware.js');
const {handleTeacherUpload, handleClassUpload, handleStudentUpload, handleGuardianUpload, handleUserPhotoUpload} = require('../middleware/multer.middleware.js');
const {loginAdmin, getMe, changePassword, updateMyPhoto} = require('../controllers/admin/admin.controller.js');
const {addTeacher, getTeachers, getTeacherById, updateTeacher, setTeacherStatus} = require('../controllers/admin/teacher.controller.js');
const {addClass, getClasses, getClassById, updateClass} = require('../controllers/admin/class.controller.js');
const {addCourse, getCourses, getCourseById, updateCourse} = require('../controllers/admin/course.controller.js');
const {addStudent, getStudents, getStudentById, updateStudent, setStudentStatus} = require('../controllers/admin/student.controller.js');
const {addAnnouncement, getAnnouncements, getAnnouncementById, updateAnnouncement} = require('../controllers/admin/announcement.controller.js');
const {getGuardians, getGuardianById, addGuardian, updateGuardian, setGuardianStatus} = require('../controllers/admin/guardian.controller.js');
const {getComplaints, getComplaintById} = require('../controllers/admin/complaint.controller.js');
const {getAdminDashboard} = require('../controllers/admin/dashboard.controller.js');
const {getAdminTimetables} = require('../controllers/admin/timetable.controller.js');
const {createInvoice, getPayments, getPaymentById, updatePayment, cancelPayment, resendInvoice} = require('../controllers/admin/payment.controller.js');
const router = Router();

// Public
router.post('/login', loginAdmin);

// Protected — all routes below require a valid admin JWT
router.use(adminProtector);

// Current admin profile
router.get('/me', getMe);
router.patch('/me/password', changePassword);
router.get('/dashboard', getAdminDashboard);
router.get('/timetables', getAdminTimetables);
router.patch('/me/photo', handleUserPhotoUpload, updateMyPhoto);

// TEACHER ROUTES for admin
router.post('/teachers', handleTeacherUpload, addTeacher);
router.get('/teachers', getTeachers);
router.get('/teachers/:id', getTeacherById);
router.patch('/teachers/:id/status', setTeacherStatus);
router.put('/teachers/:id', handleTeacherUpload, updateTeacher);

// CLASS ROUTES for admin
router.post('/classes', handleClassUpload, addClass);
router.get('/classes', getClasses);
router.get('/classes/:id', getClassById);
router.patch('/classes/:id', handleClassUpload, updateClass);

// COURSE ROUTES for admin
router.post('/courses', addCourse);
router.get('/courses', getCourses);
router.get('/courses/:id', getCourseById);
router.patch('/courses/:id', updateCourse);

// STUDENTS ROUTES for admin
router.post('/students', handleStudentUpload, addStudent);
router.get('/students', getStudents);
router.get('/students/:id', getStudentById);
router.patch('/students/:id/status', setStudentStatus);
router.patch('/students/:id', handleStudentUpload, updateStudent);

// ANNOUNCEMENTS ROUTES for admin
router.post('/announcements', addAnnouncement);
router.get('/announcements', getAnnouncements);
router.get('/announcements/:id', getAnnouncementById);
router.patch('/announcements/:id', updateAnnouncement);

// GUARDIANS ROUTES for admin
router.post('/guardians', handleGuardianUpload, addGuardian);
router.get('/guardians', getGuardians);
router.get('/guardians/:id', getGuardianById);
router.patch('/guardians/:id/status', setGuardianStatus);
router.patch('/guardians/:id', handleGuardianUpload, updateGuardian);

// COMPLAINTS ROUTES for admin
router.get('/complaints', getComplaints);
router.get('/complaints/:id', getComplaintById);

// PAYMENTS / INVOICES for admin
router.get('/payments', getPayments);
router.post('/payments', createInvoice);
router.get('/payments/:id', getPaymentById);
router.patch('/payments/:id', updatePayment);
router.post('/payments/:id/resend', resendInvoice);
router.post('/payments/:id/cancel', cancelPayment);

module.exports = router;


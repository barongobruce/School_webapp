const { Router } = require('express');
const {
    getTeacherClasses,
    getTeacherClassById,
    getTeacherGuardians,
    getTeacherGuardianById,
} = require('../controllers/teacher/teacher.controller');
const {
    createLesson,
    updateLesson,
    getTeacherLessons,
    getTeacherLessonById,
} = require('../controllers/teacher/lesson.controller');
const {
    createHomework,
    updateHomework,
    getTeacherHomeworks,
    getTeacherHomeworkById,
} = require('../controllers/teacher/homework.controller');
const {
    createExam,
    updateExam,
    getTeacherExams,
    getTeacherExamById,
    saveExamResults,
} = require('../controllers/teacher/exam.controller');
const {
    getLessonAttendance,
    saveLessonAttendance,
    getTeacherAttendanceLessons,
} = require('../controllers/teacher/attendance.controller');
const { protectTeacher } = require('../middleware/teacher.middleware');
const {
    handleLessonUpload,
    handleHomeworkUpload,
} = require('../middleware/multer.middleware');

const router = Router();

router.use(protectTeacher);

router.get('/classes', getTeacherClasses);
router.get('/classes/:id', getTeacherClassById);
router.get('/guardians', getTeacherGuardians);
router.get('/guardians/:id', getTeacherGuardianById);

router.get('/lessons', getTeacherLessons);
router.post('/lessons', handleLessonUpload, createLesson);
router.get('/lessons/:id', getTeacherLessonById);
router.patch('/lessons/:id', handleLessonUpload, updateLesson);

router.get('/homeworks', getTeacherHomeworks);
router.post('/homeworks', handleHomeworkUpload, createHomework);
router.get('/homeworks/:id', getTeacherHomeworkById);
router.patch('/homeworks/:id', handleHomeworkUpload, updateHomework);

router.get('/exams', getTeacherExams);
router.post('/exams', createExam);
router.get('/exams/:id', getTeacherExamById);
router.patch('/exams/:id', updateExam);
router.put('/exams/:id/results', saveExamResults);

router.get('/attendance/lessons', getTeacherAttendanceLessons);
router.get('/attendance/lessons/:lessonId', getLessonAttendance);
router.put('/attendance/lessons/:lessonId', saveLessonAttendance);

module.exports = router;

const ExamModel = require('../../models/exam.model.js');
const ClassModel = require('../../models/class.model.js');
const CourseModel = require('../../models/course.model.js');
const {
    EXAM_TYPES,
    EXAM_STATUSES,
    assertValidObjectId,
    isAssignedClass,
    serializeExam,
    examPopulate,
    loadClassStudents,
    buildResultsRoster,
    summarizeResults,
    gradeFromPercent,
} = require('../../utils/examAccess.js');

const TITLE_MAX = 100;
const DESCRIPTION_MAX = 500;
const SUBJECT_MAX = 100;
const VENUE_MAX = 120;
const INSTRUCTIONS_MAX = 5000;

const toBoundedText = (value, maxLength) => {
    const raw = Array.isArray(value) ? value[value.length - 1] : value;
    return String(raw ?? '')
        .trim()
        .slice(0, maxLength);
};

const parseTimeToMinutes = (value) => {
    const text = String(value || '').trim();
    const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(text);
    if (!match) return null;
    return Number(match[1]) * 60 + Number(match[2]);
};

const getAssignedClassOrThrow = async (classId, teacher) => {
    assertValidObjectId(classId, 'class ID');

    const classItem = await ClassModel.findById(classId)
        .select(
            'className classCode grade academicYear isActive teachers courses students exams'
        )
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

const parseExamInput = async (body, teacher) => {
    const {
        title,
        description,
        course: courseId,
        subject,
        examType,
        class: classId,
        examDate,
        startTime,
        endTime,
        duration,
        venue,
        totalMarks,
        passingMarks,
        instructions,
        status,
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
    if (!examDate) {
        const error = new Error('Exam date is required');
        error.statusCode = 400;
        throw error;
    }
    if (!startTime || !String(startTime).trim()) {
        const error = new Error('Start time is required');
        error.statusCode = 400;
        throw error;
    }
    if (!endTime || !String(endTime).trim()) {
        const error = new Error('End time is required');
        error.statusCode = 400;
        throw error;
    }

    const date = new Date(examDate);
    if (Number.isNaN(date.getTime())) {
        const error = new Error('Invalid exam date');
        error.statusCode = 400;
        throw error;
    }

    const start = String(startTime).trim();
    const end = String(endTime).trim();
    const startMinutes = parseTimeToMinutes(start);
    const endMinutes = parseTimeToMinutes(end);

    if (startMinutes == null || endMinutes == null) {
        const error = new Error('Times must use HH:MM format (24-hour)');
        error.statusCode = 400;
        throw error;
    }

    if (endMinutes <= startMinutes) {
        const error = new Error('End time must be after start time');
        error.statusCode = 400;
        throw error;
    }

    let durationMinutes = Number(duration);
    if (!Number.isFinite(durationMinutes) || durationMinutes < 1) {
        durationMinutes = endMinutes - startMinutes;
    }
    durationMinutes = Math.min(Math.round(durationMinutes), 600);

    const total = Number(totalMarks);
    if (!Number.isFinite(total) || total < 0) {
        const error = new Error('Total marks must be a non-negative number');
        error.statusCode = 400;
        throw error;
    }

    const passing = Number(passingMarks);
    if (!Number.isFinite(passing) || passing < 0) {
        const error = new Error('Passing marks must be a non-negative number');
        error.statusCode = 400;
        throw error;
    }

    if (passing > total) {
        const error = new Error('Passing marks cannot exceed total marks');
        error.statusCode = 400;
        throw error;
    }

    const type = String(examType || 'other').trim();
    if (!EXAM_TYPES.includes(type)) {
        const error = new Error('Invalid exam type');
        error.statusCode = 400;
        throw error;
    }

    const nextStatus = String(status || 'scheduled').trim();
    if (!EXAM_STATUSES.includes(nextStatus)) {
        const error = new Error('Invalid exam status');
        error.statusCode = 400;
        throw error;
    }

    const classItem = await getAssignedClassOrThrow(classId, teacher);

    let course = null;
    let subjectName = toBoundedText(subject, SUBJECT_MAX);

    if (courseId) {
        course = await resolveCourseForClass(courseId, classItem, teacher._id);
        subjectName = course.courseName;
    }

    if (!subjectName) {
        const error = new Error('Subject / course is required');
        error.statusCode = 400;
        throw error;
    }

    return {
        title: toBoundedText(title, TITLE_MAX),
        description: toBoundedText(description, DESCRIPTION_MAX),
        subject: subjectName,
        examType: type,
        class: classId,
        classItem,
        examDate: date,
        startTime: start,
        endTime: end,
        duration: durationMinutes,
        venue: toBoundedText(venue, VENUE_MAX),
        totalMarks: Math.round(total),
        passingMarks: Math.round(passing),
        instructions: toBoundedText(instructions, INSTRUCTIONS_MAX),
        status: nextStatus,
        students: (classItem.students || []).map((id) => id),
    };
};

const createExam = async (req, res, next) => {
    try {
        const payload = await parseExamInput(req.body, req.teacher);

        const exam = await ExamModel.create({
            title: payload.title,
            description: payload.description,
            subject: payload.subject,
            examType: payload.examType,
            class: payload.class,
            teacher: req.teacher._id,
            students: payload.students,
            examDate: payload.examDate,
            startTime: payload.startTime,
            endTime: payload.endTime,
            duration: payload.duration,
            venue: payload.venue,
            totalMarks: payload.totalMarks,
            passingMarks: payload.passingMarks,
            instructions: payload.instructions,
            status: payload.status,
        });

        await ClassModel.updateOne(
            { _id: payload.class },
            { $addToSet: { exams: exam._id } }
        );

        const populated = await ExamModel.findById(exam._id)
            .populate(examPopulate)
            .lean();

        res.status(201).json({
            message: 'Exam created successfully',
            exam: serializeExam(populated),
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        next(error);
    }
};

const updateExam = async (req, res, next) => {
    try {
        const { id } = req.params;
        assertValidObjectId(id, 'exam ID');

        const existing = await ExamModel.findOne({
            _id: id,
            teacher: req.teacher._id,
            isActive: true,
        });

        if (!existing) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        const previousClassId = String(existing.class);
        const payload = await parseExamInput(req.body, req.teacher);

        existing.title = payload.title;
        existing.description = payload.description;
        existing.subject = payload.subject;
        existing.examType = payload.examType;
        existing.class = payload.class;
        existing.students = payload.students;
        existing.examDate = payload.examDate;
        existing.startTime = payload.startTime;
        existing.endTime = payload.endTime;
        existing.duration = payload.duration;
        existing.venue = payload.venue;
        existing.totalMarks = payload.totalMarks;
        existing.passingMarks = payload.passingMarks;
        existing.instructions = payload.instructions;
        existing.status = payload.status;

        await existing.save();

        if (previousClassId !== String(payload.class)) {
            await ClassModel.updateOne(
                { _id: previousClassId },
                { $pull: { exams: existing._id } }
            );
            await ClassModel.updateOne(
                { _id: payload.class },
                { $addToSet: { exams: existing._id } }
            );
        }

        const populated = await ExamModel.findById(existing._id)
            .populate(examPopulate)
            .lean();

        res.json({
            message: 'Exam updated successfully',
            exam: serializeExam(populated),
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        next(error);
    }
};

const getTeacherExams = async (req, res, next) => {
    try {
        const exams = await ExamModel.find({
            teacher: req.teacher._id,
            isActive: true,
        })
            .populate(examPopulate)
            .sort({ examDate: 1, startTime: 1 })
            .lean();

        const serialized = exams.map((exam) => {
            const item = serializeExam(exam);
            delete item.results;
            return item;
        });

        res.json({
            count: serialized.length,
            exams: serialized,
        });
    } catch (error) {
        next(error);
    }
};

const getTeacherExamById = async (req, res, next) => {
    try {
        const { id } = req.params;
        assertValidObjectId(id, 'exam ID');

        const exam = await ExamModel.findOne({
            _id: id,
            teacher: req.teacher._id,
            isActive: true,
        })
            .populate(examPopulate)
            .lean();

        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        const classId = exam.class?._id || exam.class;
        const students = await loadClassStudents(classId);
        const results = buildResultsRoster(exam, students);

        const serialized = serializeExam(exam);
        delete serialized.results;
        delete serialized.students;

        res.json({
            exam: serialized,
            results,
            resultsSummary: summarizeResults(results),
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        next(error);
    }
};

const saveExamResults = async (req, res, next) => {
    try {
        const { id } = req.params;
        assertValidObjectId(id, 'exam ID');

        const exam = await ExamModel.findOne({
            _id: id,
            teacher: req.teacher._id,
            isActive: true,
        });

        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        const classId = exam.class;
        const students = await loadClassStudents(classId);
        const allowedIds = new Set(students.map((student) => String(student._id)));

        const incoming = Array.isArray(req.body?.results) ? req.body.results : null;
        if (!incoming) {
            return res.status(400).json({ message: 'Results array is required' });
        }

        const totalMarks = Number(exam.totalMarks) || 0;
        const nextResults = [];

        for (const item of incoming) {
            const studentId = String(item.studentId || item.student || '');
            if (!studentId || !allowedIds.has(studentId)) {
                const error = new Error(
                    'One or more students are not in this exam’s class roster.'
                );
                error.statusCode = 400;
                throw error;
            }

            const isAbsent = Boolean(item.isAbsent);
            let marksObtained = 0;

            if (!isAbsent) {
                marksObtained = Number(item.marksObtained);
                if (!Number.isFinite(marksObtained) || marksObtained < 0) {
                    const error = new Error(
                        'Each present student needs a valid marks value.'
                    );
                    error.statusCode = 400;
                    throw error;
                }
                if (marksObtained > totalMarks) {
                    const error = new Error(
                        `Marks cannot exceed the exam total (${totalMarks}).`
                    );
                    error.statusCode = 400;
                    throw error;
                }
                marksObtained = Math.round(marksObtained * 10) / 10;
            }

            const percentage =
                !isAbsent && totalMarks > 0
                    ? (marksObtained / totalMarks) * 100
                    : null;
            const grade =
                String(item.grade || '').trim() ||
                (percentage != null ? gradeFromPercent(percentage) : '');

            nextResults.push({
                student: studentId,
                marksObtained: isAbsent ? 0 : marksObtained,
                grade,
                remarks: String(item.remarks || '')
                    .trim()
                    .slice(0, 500),
                isAbsent,
            });
        }

        exam.results = nextResults;
        if (
            nextResults.length > 0 &&
            exam.status === 'scheduled'
        ) {
            exam.status = 'completed';
        }
        await exam.save();

        const populated = await ExamModel.findById(exam._id)
            .populate(examPopulate)
            .lean();

        const rosterStudents = await loadClassStudents(classId);
        const results = buildResultsRoster(populated, rosterStudents);
        const serialized = serializeExam(populated);
        delete serialized.results;
        delete serialized.students;

        res.json({
            message: 'Exam results saved successfully',
            exam: serialized,
            results,
            resultsSummary: summarizeResults(results),
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        next(error);
    }
};

module.exports = {
    createExam,
    updateExam,
    getTeacherExams,
    getTeacherExamById,
    saveExamResults,
};

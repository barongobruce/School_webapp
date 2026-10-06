const mongoose = require('mongoose');
const StudentModel = require('../models/student.model.js');
const ClassModel = require('../models/class.model.js');
const GuardianModel = require('../models/guardian.model.js');
const {assertValidObjectId, isAssignedClass, resolveAccessContext, getAccessibleCourses} = require('./lessonAccess.js');

const EXAM_TYPES = ['midterm', 'final', 'quiz', 'unit_test', 'other'];
const EXAM_STATUSES = ['scheduled', 'ongoing', 'completed', 'cancelled'];

const EXAM_TYPE_LABELS = {
    midterm: 'Mid-term',
    final: 'Final',
    quiz: 'Quiz',
    unit_test: 'Unit test',
    other: 'Other',
};

const EXAM_STATUS_LABELS = {
    scheduled: 'Scheduled',
    ongoing: 'Ongoing',
    completed: 'Completed',
    cancelled: 'Cancelled',
};

const examPopulate = [
    {
        path: 'class',
        select: 'className classCode grade academicYear isActive teachers students',
    },
    {
        path: 'teacher',
        select: 'user',
        populate: {
            path: 'user',
            select: 'firstName lastName email photo',
        },
    },
    {
        path: 'results.student',
        select: 'user class',
        populate: {
            path: 'user',
            select: 'firstName lastName photo isDeleted isActive',
        },
    },
];

const uniqueIds = (ids = []) => [
    ...new Set(ids.filter(Boolean).map((id) => String(id))),
];

const getTeacherName = (exam) => {
    const user = exam?.teacher?.user;
    if (!user || typeof user !== 'object') return '';
    return `${user.firstName || ''} ${user.lastName || ''}`.trim();
};

const getStudentName = (student) => {
    const user = student?.user;
    if (!user || typeof user !== 'object') return 'Student';
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Student';
};

const gradeFromPercent = (percent) => {
    if (percent == null || Number.isNaN(percent)) return '';
    if (percent >= 80) return 'A';
    if (percent >= 70) return 'B';
    if (percent >= 60) return 'C';
    if (percent >= 50) return 'D';
    return 'E';
};

const serializeResultRow = (student, result, totalMarks = 0, passingMarks = 0) => {
    const studentId = String(student._id || student.id);
    const marks =
        result && !result.isAbsent && Number.isFinite(Number(result.marksObtained))
            ? Number(result.marksObtained)
            : null;
    const isAbsent = Boolean(result?.isAbsent);
    const hasResult = Boolean(result);
    const percentage =
        !isAbsent && marks != null && totalMarks > 0
            ? Math.round((marks / totalMarks) * 1000) / 10
            : null;
    const passed =
        isAbsent || marks == null
            ? null
            : marks >= Number(passingMarks || 0);

    return {
        studentId,
        firstName: student.user?.firstName || '',
        lastName: student.user?.lastName || '',
        name: getStudentName(student),
        photo: student.user?.photo || '',
        marksObtained: isAbsent ? null : marks,
        grade:
            result?.grade ||
            (percentage != null ? gradeFromPercent(percentage) : ''),
        remarks: result?.remarks || '',
        isAbsent,
        hasResult,
        percentage,
        passed,
    };
};

const loadClassStudents = async (classId) => {
    if (!classId) return [];

    const classItem = await ClassModel.findById(classId)
        .select('students')
        .lean();

    const studentIds = uniqueIds([
        ...(classItem?.students || []),
    ]);

    if (!studentIds.length) return [];

    const students = await StudentModel.find({
        _id: { $in: studentIds },
    })
        .select('user class')
        .populate({
            path: 'user',
            select: 'firstName lastName photo isDeleted isActive',
        })
        .lean();

    return students
        .filter((student) => student?.user && !student.user.isDeleted)
        .sort((a, b) =>
            getStudentName(a).localeCompare(getStudentName(b), undefined, {
                sensitivity: 'base',
            })
        );
};

const buildResultsRoster = (exam, students = []) => {
    const totalMarks = Number(exam.totalMarks) || 0;
    const passingMarks = Number(exam.passingMarks) || 0;

    const resultByStudent = new Map();
    for (const result of exam.results || []) {
        const studentDoc =
            result.student && typeof result.student === 'object'
                ? result.student
                : null;
        const studentId = String(studentDoc?._id || result.student || '');
        if (!studentId) continue;
        resultByStudent.set(studentId, result);
    }

    return students.map((student) =>
        serializeResultRow(
            student,
            resultByStudent.get(String(student._id)),
            totalMarks,
            passingMarks
        )
    );
};

const summarizeResults = (roster = []) => {
    const recorded = roster.filter((row) => row.hasResult);
    const present = recorded.filter((row) => !row.isAbsent);
    const absent = recorded.filter((row) => row.isAbsent);
    const passed = present.filter((row) => row.passed);
    const markValues = present
        .map((row) => row.marksObtained)
        .filter((value) => value != null);

    const average =
        markValues.length > 0
            ? Math.round(
                  (markValues.reduce((sum, value) => sum + value, 0) /
                      markValues.length) *
                      10
              ) / 10
            : null;

    return {
        rosterSize: roster.length,
        recordedCount: recorded.length,
        presentCount: present.length,
        absentCount: absent.length,
        passedCount: passed.length,
        average,
        passRate:
            present.length > 0
                ? Math.round((passed.length / present.length) * 100)
                : null,
    };
};

const resolveExamStudentScope = async (user, context) => {
    if (context.role === 'teacher') {
        return { mode: 'all', studentIds: null };
    }

    if (context.role === 'student') {
        return {
            mode: 'self',
            studentIds: context.studentId
                ? [String(context.studentId)]
                : [],
        };
    }

    if (context.role === 'guardian' || context.role === 'parent') {
        const guardian = await GuardianModel.findOne({ user: user._id })
            .select('students')
            .lean();
        return {
            mode: 'wards',
            studentIds: uniqueIds(guardian?.students || []),
        };
    }

    return { mode: 'none', studentIds: [] };
};

const filterRosterByScope = (roster, scope) => {
    if (scope.mode === 'all') return roster;
    if (!scope.studentIds?.length) return [];
    const allowed = new Set(scope.studentIds.map(String));
    return roster.filter((row) => allowed.has(String(row.studentId)));
};

const serializeExam = (exam) => {
    if (!exam) return null;

    const classItem =
        exam.class && typeof exam.class === 'object' ? exam.class : null;
    const teacherDoc =
        exam.teacher && typeof exam.teacher === 'object' ? exam.teacher : null;

    const examType = exam.examType || 'other';
    const status = exam.status || 'scheduled';

    return {
        ...exam,
        id: String(exam._id),
        classId: classItem?._id || exam.class || null,
        className: classItem?.className || '',
        classCode: classItem?.classCode || '',
        subject: exam.subject || '',
        teacherId: teacherDoc?._id || exam.teacher || null,
        teacher: getTeacherName(exam),
        examType,
        examTypeLabel: EXAM_TYPE_LABELS[examType] || examType,
        status,
        statusLabel: EXAM_STATUS_LABELS[status] || status,
        resultsCount: Array.isArray(exam.results)
            ? exam.results.length
            : 0,
    };
};

const buildExamVisibilityQuery = (context) => {
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

const canAccessExam = (exam, context) => {
    if (!exam || !context?.role) return false;

    if (context.role === 'teacher') {
        return (
            context.teacherId &&
            String(exam.teacher?._id || exam.teacher) ===
                String(context.teacherId)
        );
    }

    const classId = String(exam.class?._id || exam.class || '');
    return context.classIds.includes(classId);
};

module.exports = {
    EXAM_TYPES,
    EXAM_STATUSES,
    EXAM_TYPE_LABELS,
    EXAM_STATUS_LABELS,
    examPopulate,
    assertValidObjectId,
    isAssignedClass,
    resolveAccessContext,
    serializeExam,
    buildExamVisibilityQuery,
    canAccessExam,
    getAccessibleCourses,
    getStudentName,
    gradeFromPercent,
    loadClassStudents,
    buildResultsRoster,
    summarizeResults,
    resolveExamStudentScope,
    filterRosterByScope,
};

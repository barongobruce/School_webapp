const mongoose = require('mongoose');
const ClassModel = require('../models/class.model.js');
const CourseModel = require('../models/course.model.js');
const TeacherModel = require('../models/teacher.model.js');
const TimetableModel = require('../models/timetable.model.js');

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
const TIME_RE = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

const makeError = (message, statusCode = 400) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const idOf = (value) => {
    if (value == null) return '';
    if (typeof value === 'string') return value;
    if (typeof value.toHexString === 'function') return value.toHexString();
    if (value._id != null) return idOf(value._id);
    return String(value);
};

const minutesOf = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

const overlaps = (a, b) =>
    minutesOf(a.startTime) < minutesOf(b.endTime) &&
    minutesOf(b.startTime) < minutesOf(a.endTime);

const hasId = (list = [], id) => list.some((item) => idOf(item) === String(id));

const normalizeIdentity = ({ academicYear, term }) => {
    const year = String(academicYear || '').trim();
    const normalizedTerm = String(term || '').trim().toLowerCase();
    if (!year || year.length > 20) {
        throw makeError('Academic year is required and must be at most 20 characters');
    }
    if (!normalizedTerm || normalizedTerm.length > 50) {
        throw makeError('Term is required and must be at most 50 characters');
    }
    return { academicYear: year, term: normalizedTerm };
};

const assertTeacherAssignedToClass = (classItem, teacher) => {
    const classId = idOf(classItem);
    const teacherId = idOf(teacher);
    const assigned =
        hasId(classItem.teachers, teacherId) ||
        hasId(teacher.classes, classId);
    if (!assigned) {
        throw makeError('Access denied. This class is not assigned to you.', 403);
    }
};

const assertDesignatedClassTeacher = (classItem, teacher) => {
    if (!classItem.classTeacher || idOf(classItem.classTeacher) !== idOf(teacher)) {
        throw makeError(
            'You are not the designated class teacher for this class. Contact the school administrator.',
            403,
        );
    }
};

const loadClassForTeacher = async (classId, teacher, session = null) => {
    if (!mongoose.Types.ObjectId.isValid(classId)) {
        throw makeError('Invalid class ID');
    }
    let query = ClassModel.findById(classId);
    if (session) query = query.session(session);
    const classItem = await query.lean();
    if (!classItem) throw makeError('Class not found', 404);
    assertTeacherAssignedToClass(classItem, teacher);
    return classItem;
};

const attachSession = (query, session) => (session ? query.session(session) : query);

const getTeacherConflicts = async ({
    entries,
    classItem,
    academicYear,
    term,
    session = null,
}) => {
    const teacherIds = [...new Set(
        entries
            .filter((entry) => entry.slotType === 'lesson')
            .map((entry) => entry.teacherId),
    )];
    if (!teacherIds.length) return [];

    // Exclude this class; its draft is the candidate being validated.
    // Include both published snapshots and other classes' drafts.
    const query = TimetableModel.find({
        class: { $ne: classItem._id },
        academicYear,
        term,
        $or: [
            { publishedEntries: { $elemMatch: { slotType: 'lesson', teacher: { $in: teacherIds } } } },
            { draftEntries: { $elemMatch: { slotType: 'lesson', teacher: { $in: teacherIds } } } },
        ],
    })
        .select('class publishedEntries draftEntries')
        .populate('class', 'className classCode')
        .lean();

    const others = await attachSession(query, session);
    const conflicts = [];
    for (const proposed of entries.filter((entry) => entry.slotType === 'lesson')) {
        for (const timetable of others) {
            const className = timetable.class?.className || 'another class';
            for (const [source, list] of [
                ['published', timetable.publishedEntries || []],
                ['draft', timetable.draftEntries || []],
            ]) {
                for (const existing of list) {
                    if (
                        existing.slotType === 'lesson' &&
                        idOf(existing.teacher) === proposed.teacherId &&
                        existing.dayOfWeek === proposed.dayOfWeek &&
                        overlaps(existing, proposed)
                    ) {
                        conflicts.push({
                            className,
                            source,
                            dayOfWeek: proposed.dayOfWeek,
                            startTime: existing.startTime,
                            endTime: existing.endTime,
                        });
                    }
                }
            }
        }
    }
    return conflicts;
};

const validateEntries = async ({
    entries,
    classItem,
    academicYear,
    term,
    session = null,
    allowEmpty = true,
    rejectTeacherConflicts = false,
}) => {
    if (!Array.isArray(entries)) throw makeError('Timetable entries must be an array');
    if (entries.length > 100) throw makeError('A timetable cannot contain more than 100 entries');

    const cleaned = entries.map((entry, index) => {
        if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
            throw makeError(`Entry ${index + 1} is invalid`);
        }
        const dayOfWeek = String(entry.dayOfWeek || '').trim().toLowerCase();
        const startTime = String(entry.startTime || '').trim();
        const endTime = String(entry.endTime || '').trim();
        const slotType = String(entry.slotType || 'lesson').trim().toLowerCase();
        const label = String(entry.label || '').trim();
        const room = String(entry.room || '').trim();
        const courseId = entry.courseId || entry.course || null;
        const teacherId = entry.teacherId || entry.teacher || null;

        if (!DAYS.includes(dayOfWeek)) throw makeError(`Entry ${index + 1} must be on Monday to Friday`);
        if (!TIME_RE.test(startTime) || !TIME_RE.test(endTime)) {
            throw makeError(`Entry ${index + 1} must use 24-hour HH:mm times`);
        }
        if (minutesOf(endTime) <= minutesOf(startTime)) {
            throw makeError(`Entry ${index + 1} must end after it starts`);
        }
        if (minutesOf(endTime) - minutesOf(startTime) > 480) {
            throw makeError(`Entry ${index + 1} cannot exceed 8 hours`);
        }
        if (!['lesson', 'break', 'lunch'].includes(slotType)) {
            throw makeError(`Entry ${index + 1} has an unsupported slot type`);
        }
        if (label.length > 100 || room.length > 100) {
            throw makeError(`Entry ${index + 1} label or room is too long`);
        }
        if (slotType === 'lesson') {
            if (!mongoose.Types.ObjectId.isValid(courseId)) {
                throw makeError(`Lesson entry ${index + 1} needs a valid course ID`);
            }
            if (!mongoose.Types.ObjectId.isValid(teacherId)) {
                throw makeError(`Lesson entry ${index + 1} needs a valid teacher ID`);
            }
        } else if (courseId || teacherId) {
            throw makeError(`Break/lunch entry ${index + 1} cannot have a course or teacher`);
        }
        return {
            dayOfWeek, startTime, endTime, slotType, label, room,
            courseId: slotType === 'lesson' ? String(courseId) : null,
            teacherId: slotType === 'lesson' ? String(teacherId) : null,
        };
    });

    if (!allowEmpty && !cleaned.some((entry) => entry.slotType === 'lesson')) {
        throw makeError('Publish at least one lesson before publishing');
    }

    for (let i = 0; i < cleaned.length; i += 1) {
        for (let j = i + 1; j < cleaned.length; j += 1) {
            if (cleaned[i].dayOfWeek === cleaned[j].dayOfWeek && overlaps(cleaned[i], cleaned[j])) {
                throw makeError(
                    `Class timetable entries overlap on ${cleaned[i].dayOfWeek}: ${cleaned[i].startTime}–${cleaned[i].endTime} and ${cleaned[j].startTime}–${cleaned[j].endTime}`,
                );
            }
        }
    }

    const lessons = cleaned.filter((entry) => entry.slotType === 'lesson');
    const courseIds = [...new Set(lessons.map((entry) => entry.courseId))];
    const teacherIds = [...new Set(lessons.map((entry) => entry.teacherId))];
    let courseQuery = CourseModel.find({ _id: { $in: courseIds } })
        .select('_id courseName courseClass courseTeachers courseStatus');
    let teacherQuery = TeacherModel.find({ _id: { $in: teacherIds } })
        .select('_id classes user')
        .populate({ path: 'user', select: 'isActive isDeleted' });
    if (session) {
        courseQuery = courseQuery.session(session);
        teacherQuery = teacherQuery.session(session);
    }
    const [courses, teachers] = await Promise.all([
        courseIds.length ? courseQuery.lean() : [],
        teacherIds.length ? teacherQuery.lean() : [],
    ]);
    const courseById = new Map(courses.map((item) => [idOf(item), item]));
    const teacherById = new Map(teachers.map((item) => [idOf(item), item]));
    const classCourseIds = (classItem.courses || []).map(idOf);

    for (const entry of lessons) {
        const course = courseById.get(entry.courseId);
        if (!course || course.courseStatus === 'Inactive') {
            throw makeError('A selected course was not found or is inactive');
        }
        // Both relationships are present in the source model/workflow; either
        // side can validly establish class membership.
        if (
            idOf(course.courseClass) !== idOf(classItem) &&
            !classCourseIds.includes(entry.courseId)
        ) {
            throw makeError('A selected course is not assigned to this class');
        }

        const teacher = teacherById.get(entry.teacherId);
        if (!teacher || !teacher.user || teacher.user.isDeleted || teacher.user.isActive === false) {
            throw makeError('A selected teacher account was not found or is inactive');
        }
        const teacherOnCourse = hasId(course.courseTeachers, entry.teacherId);
        const teacherOnClass =
            hasId(classItem.teachers, entry.teacherId) ||
            hasId(teacher.classes, idOf(classItem));
        if (!teacherOnCourse || !teacherOnClass) {
            throw makeError('Each lesson teacher must be assigned to the course and the class');
        }
    }

    const normalizedEntries = cleaned.map((entry) => ({
        dayOfWeek: entry.dayOfWeek,
        startTime: entry.startTime,
        endTime: entry.endTime,
        slotType: entry.slotType,
        label: entry.label,
        room: entry.room,
        course: entry.courseId,
        teacher: entry.teacherId,
    }));

    const conflicts = await getTeacherConflicts({
        entries: cleaned, classItem, academicYear, term, session,
    });
    if (rejectTeacherConflicts && conflicts.length) {
        const first = conflicts[0];
        throw makeError(
            `Teacher conflict with ${first.className} (${first.source} schedule) on ${first.dayOfWeek}, ${first.startTime}–${first.endTime}`,
            409,
        );
    }
    return { entries: normalizedEntries, conflicts };
};

const timetablePopulate = [
    {
        path: 'class',
        select: 'className classCode academicYear classTeacher teachers students courses',
        populate: [
            {
                path: 'classTeacher',
                select: 'user',
                populate: { path: 'user', select: 'firstName lastName photo isActive' },
            },
            { path: 'courses', select: 'courseName courseCode courseType courseStatus' },
        ],
    },
    { path: 'draftEntries.course', select: 'courseName courseCode' },
    {
        path: 'draftEntries.teacher',
        select: 'user',
        populate: { path: 'user', select: 'firstName lastName photo isActive' },
    },
    { path: 'publishedEntries.course', select: 'courseName courseCode' },
    {
        path: 'publishedEntries.teacher',
        select: 'user',
        populate: { path: 'user', select: 'firstName lastName photo isActive' },
    },
];

const serializeEntry = (entry) => {
    const course = entry.course && typeof entry.course === 'object' ? entry.course : null;
    const teacher = entry.teacher && typeof entry.teacher === 'object' ? entry.teacher : null;
    const user = teacher?.user && typeof teacher.user === 'object' ? teacher.user : null;
    return {
        id: idOf(entry),
        dayOfWeek: entry.dayOfWeek,
        startTime: entry.startTime,
        endTime: entry.endTime,
        slotType: entry.slotType,
        label: entry.label || '',
        room: entry.room || '',
        courseId: course ? idOf(course) : idOf(entry.course) || null,
        courseName: course?.courseName || '',
        courseCode: course?.courseCode || '',
        teacherId: teacher ? idOf(teacher) : idOf(entry.teacher) || null,
        teacherName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
    };
};

const serializeTimetable = (timetable) => {
    const classItem = timetable.class && typeof timetable.class === 'object' ? timetable.class : null;
    const classTeacher = classItem?.classTeacher;
    const teacherUser = classTeacher?.user;
    return {
        id: idOf(timetable),
        classId: classItem ? idOf(classItem) : idOf(timetable.class),
        className: classItem?.className || '',
        classCode: classItem?.classCode || '',
        studentCount: classItem?.students?.length || 0,
        classTeacherId: classTeacher ? idOf(classTeacher) : null,
        classTeacherName: teacherUser
            ? `${teacherUser.firstName || ''} ${teacherUser.lastName || ''}`.trim()
            : '',
        classCourses: (classItem?.courses || []).map((course) => ({
            id: idOf(course), courseName: course.courseName || '', courseCode: course.courseCode || '',
        })),
        academicYear: timetable.academicYear,
        term: timetable.term,
        publishedAt: timetable.publishedAt || null,
        isPublished: Boolean(timetable.publishedAt),
        hasUnpublishedChanges: Boolean(timetable.hasUnpublishedChanges),
        draftEntries: (timetable.draftEntries || []).map(serializeEntry),
        publishedEntries: (timetable.publishedEntries || []).map(serializeEntry),
    };
};

module.exports = {
    makeError,
    normalizeIdentity,
    loadClassForTeacher,
    assertDesignatedClassTeacher,
    validateEntries,
    timetablePopulate,
    serializeTimetable,
};
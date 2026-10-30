const mongoose = require('mongoose');
const TimetableModel = require('../../models/timetable.model.js');
const CourseModel = require('../../models/course.model.js');
const TimetableTeacherSlotModel = require('../../models/timetableTeacherSlot.model.js');
const {
    makeError,
    normalizeIdentity,
    loadClassForTeacher,
    assertDesignatedClassTeacher,
    validateEntries,
    getTeacherWorkloadSummary,
    timetablePopulate,
    serializeTimetable,
} = require('../../utils/timetableAccess.js');

const getIdentity = (classItem, body = {}, query = {}) =>
    normalizeIdentity({
        academicYear: body.academicYear || query.academicYear || classItem.academicYear,
        term: body.term || query.term,
    });

const getTeacherTimetableForEditing = async (req, res, next) => {
    try {
        const classItem = await loadClassForTeacher(req.params.classId, req.teacher);
        assertDesignatedClassTeacher(classItem, req.teacher);

        // The course catalogue is shared by every class. Eligibility still
        // requires the selected teacher to be assigned to this class.
        const classCourses = await CourseModel.find({ courseStatus: 'Active' })
            .select('_id courseName courseCode courseTeachers')
            .populate({
                path: 'courseTeachers',
                select: 'user classes',
                populate: {
                    path: 'user',
                    select: 'firstName lastName isActive isDeleted',
                },
            })
            .lean();

        const availableCourses = classCourses.map((course) => ({
            id: String(course._id),
            courseName: course.courseName || '',
            courseCode: course.courseCode || '',
            teachers: (course.courseTeachers || [])
                .filter((teacher) =>
                    teacher.user &&
                    teacher.user.isActive === true &&
                    teacher.user.isDeleted !== true,
                )
                .map((teacher) => ({
                    id: String(teacher._id),
                    name: `${teacher.user.firstName || ''} ${teacher.user.lastName || ''}`.trim(),
                })),
        }));

        const { academicYear, term } = getIdentity(classItem, {}, req.query);
        const timetable = await TimetableModel.findOne({
            class: classItem._id, academicYear, term,
        }).populate(timetablePopulate).lean();

        const teacherWorkload = await getTeacherWorkloadSummary({
            classId: classItem._id,
            academicYear,
            term,
            entries: timetable?.draftEntries?.length
                ? timetable.draftEntries
                : timetable?.publishedEntries || [],
        });
        res.json({
            timetable: timetable ? serializeTimetable(timetable) : null,
            teacherWorkload,
            class: {
                id: String(classItem._id),
                className: classItem.className,
                classCode: classItem.classCode,
                academicYear: classItem.academicYear || '',
                teacherId: String(req.teacher._id),
                studentCount: (classItem.students || []).length,
                availableCourses,
            },
        });
    } catch (error) {
        next(error);
    }
};

const saveTimetableDraft = async (req, res, next) => {
    try {
        if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
            throw makeError('A JSON request body is required');
        }
        const classItem = await loadClassForTeacher(req.params.classId, req.teacher);
        assertDesignatedClassTeacher(classItem, req.teacher);
        const { academicYear, term } = getIdentity(classItem, req.body);
        const { entries, conflicts } = await validateEntries({
            entries: req.body.entries,
            classItem,
            academicYear,
            term,
            allowEmpty: true,
            rejectTeacherConflicts: true,
        });

        const timetable = await TimetableModel.findOneAndUpdate(
            { class: classItem._id, academicYear, term },
            {
                $set: { draftEntries: entries, hasUnpublishedChanges: true },
                $setOnInsert: {
                    class: classItem._id,
                    academicYear,
                    term,
                    publishedEntries: [],
                    publishedAt: null,
                },
            },
            { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
        ).populate(timetablePopulate).lean();

        const teacherWorkload = await getTeacherWorkloadSummary({
            classId: classItem._id,
            academicYear,
            term,
            entries,
        });
        res.json({
            message: 'Draft saved. Students and guardians still see only the last published timetable.',
            teacherConflictWarnings: conflicts,
            teacherWorkload,
            timetable: serializeTimetable(timetable),
        });
    } catch (error) {
        if (error.code === 11000) {
            return next(makeError(
                'A timetable already exists for this class, academic year, and term. Reload before saving.',
                409,
            ));
        }
        next(error);
    }
};

const occupiedMinutes = (entry) => {
    const [startHour, startMinute] = entry.startTime.split(':').map(Number);
    const [endHour, endMinute] = entry.endTime.split(':').map(Number);
    const start = startHour * 60 + startMinute;
    const end = endHour * 60 + endMinute;
    const minutes = [];
    for (let minute = start; minute < end; minute += 1) minutes.push(minute);
    return minutes;
};

const publishTimetable = async (req, res, next) => {
    let session;
    try {
        if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
            throw makeError('A JSON request body is required');
        }
        if (!mongoose.Types.ObjectId.isValid(req.params.classId)) {
            throw makeError('Invalid class ID');
        }

        // Transactions are required: the slot unique index is the race-safe
        // backstop if two different class timetables publish simultaneously.
        session = await mongoose.startSession();
        let publishedTimetableId = null;

        await session.withTransaction(async () => {
            const classItem = await loadClassForTeacher(
                req.params.classId,
                req.teacher,
                session,
            );
            assertDesignatedClassTeacher(classItem, req.teacher);
            const { academicYear, term } = getIdentity(classItem, req.body);
            const timetable = await TimetableModel.findOne({
                class: classItem._id, academicYear, term,
            }).session(session);

            if (!timetable) throw makeError('Save a draft before publishing', 404);

            // Revalidate all content and cross-class conflicts immediately before
            // changing the published snapshot.
            const { entries } = await validateEntries({
                entries: timetable.draftEntries,
                classItem,
                academicYear,
                term,
                session,
                allowEmpty: false,
                rejectTeacherConflicts: true,
            });

            await TimetableTeacherSlotModel.deleteMany(
                { timetable: timetable._id },
                { session },
            );

            const locks = [];
            for (const entry of entries) {
                if (entry.slotType !== 'lesson') continue;
                for (const minute of occupiedMinutes(entry)) {
                    locks.push({
                        timetable: timetable._id,
                        class: classItem._id,
                        academicYear,
                        term,
                        teacher: entry.teacher,
                        dayOfWeek: entry.dayOfWeek,
                        minute,
                    });
                }
            }
            if (locks.length) {
                await TimetableTeacherSlotModel.insertMany(locks, {
                    session,
                    ordered: true,
                });
            }

            timetable.publishedEntries = entries;
            timetable.publishedAt = new Date();
            timetable.hasUnpublishedChanges = false;
            await timetable.save({ session });
            publishedTimetableId = timetable._id;
        });

        const populated = await TimetableModel.findById(publishedTimetableId)
            .populate(timetablePopulate)
            .lean();
        res.json({
            message: 'Timetable published successfully.',
            timetable: serializeTimetable(populated),
        });
    } catch (error) {
        if (
            error.code === 20 ||
            error.codeName === 'IllegalOperation' ||
            /transaction numbers are only allowed|transactions are not supported/i.test(error.message || '')
        ) {
            return next(makeError(
                'Publishing requires MongoDB transaction support (replica set or sharded cluster). The previous published timetable was not changed.',
                503,
            ));
        }
        if (error.code === 11000) {
            return next(makeError(
                'This publication conflicts with another timetable published at the same time. Reload and resolve the conflict.',
                409,
            ));
        }
        next(error);
    } finally {
        if (session) await session.endSession();
    }
};

module.exports = {
    getTeacherTimetableForEditing,
    saveTimetableDraft,
    publishTimetable,
};

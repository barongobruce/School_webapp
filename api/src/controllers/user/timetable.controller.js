const mongoose = require('mongoose');
const TimetableModel = require('../../models/timetable.model.js');
const { resolveAccessContext } = require('../../utils/lessonAccess.js');
const { timetablePopulate, serializeTimetable } = require('../../utils/timetableAccess.js');

const getMyTimetables = async (req, res, next) => {
    try {
        const role = req.user?.role;
        if (!['student', 'guardian', 'teacher'].includes(role)) {
            return res.status(403).json({ message: 'This account does not have timetable access.' });
        }

        const context = await resolveAccessContext(req.user);
        const classIds = [...new Set(context.classIds || [])]
            .filter((id) => mongoose.Types.ObjectId.isValid(id));
        if (!classIds.length) return res.json({ timetables: [] });

        const records = await TimetableModel.find({
            class: { $in: classIds },
            publishedAt: { $ne: null },
        })
            .populate(timetablePopulate)
            .sort({ academicYear: -1, term: 1 })
            .lean();

        const timetables = records.map((record) => {
            const item = serializeTimetable(record);
            const entries = role === 'teacher'
                ? item.publishedEntries.filter(
                    (entry) => entry.teacherId === String(context.teacherId),
                )
                : item.publishedEntries;

            return {
                id: item.id,
                classId: item.classId,
                className: item.className,
                classCode: item.classCode,
                studentCount: item.studentCount,
                classTeacherId: item.classTeacherId,
                classTeacherName: item.classTeacherName,
                classCourses: item.classCourses,
                academicYear: item.academicYear,
                term: item.term,
                publishedAt: item.publishedAt,
                entries,
            };
        });

        res.json({
            timetables: role === 'teacher'
                ? timetables.filter((item) => item.entries.length > 0)
                : timetables,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getMyTimetables };

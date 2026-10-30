const mongoose = require('mongoose');
const TimetableModel = require('../../models/timetable.model.js');
const StudentModel = require('../../models/student.model.js');
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

        let visibleStudentIds = [];
        if (role === 'student' && context.studentId) {
            visibleStudentIds = [String(context.studentId)];
        } else if (role === 'guardian' && context.guardianId) {
            const wards = await StudentModel.find({
                guardian: context.guardianId,
                class: { $in: classIds },
            }).select('_id').lean();
            visibleStudentIds = wards.map((ward) => String(ward._id));
        }
        const visibleStudentIdSet = new Set(visibleStudentIds);

        const timetables = records.map((record) => {
            const publishedEntries = (record.publishedEntries || []).filter((entry) => {
                if (role === 'teacher' || entry.slotType !== 'lesson') return true;
                const course = entry.course;
                if (!course || String(course.courseType || 'Core') === 'Core') return true;
                return (course.courseStudents || []).some((student) =>
                    visibleStudentIdSet.has(String(student._id || student)),
                );
            });
            const item = serializeTimetable({ ...record, publishedEntries });
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

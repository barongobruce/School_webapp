const mongoose = require('mongoose');
const TimetableModel = require('../../models/timetable.model.js');
const { timetablePopulate, serializeTimetable } = require('../../utils/timetableAccess.js');

const getAdminTimetables = async (req, res, next) => {
    try {
        const { classId, teacherId, academicYear, term } = req.query;
        const filter = {};

        if (classId) {
            if (!mongoose.Types.ObjectId.isValid(classId)) {
                return res.status(400).json({ message: 'Invalid class ID' });
            }
            filter.class = classId;
        }
        if (academicYear !== undefined) {
            const value = String(academicYear).trim();
            if (!value || value.length > 20) {
                return res.status(400).json({ message: 'Academic year must be 1–20 characters' });
            }
            filter.academicYear = value;
        }
        if (term !== undefined) {
            const value = String(term).trim().toLowerCase();
            if (!value || value.length > 50) {
                return res.status(400).json({ message: 'Term must be 1–50 characters' });
            }
            filter.term = value;
        }

        const records = await TimetableModel.find(filter)
            .populate(timetablePopulate)
            .sort({ academicYear: -1, term: 1 })
            .lean();
        let timetables = records.map(serializeTimetable);

        if (teacherId) {
            if (!mongoose.Types.ObjectId.isValid(teacherId)) {
                return res.status(400).json({ message: 'Invalid teacher ID' });
            }
            // Derived solely from published entries in class timetable records.
            timetables = timetables
                .map((item) => ({
                    ...item,
                    draftEntries: [],
                    publishedEntries: item.publishedEntries.filter(
                        (entry) => entry.teacherId === String(teacherId),
                    ),
                }))
                .filter((item) => item.publishedEntries.length > 0);
        }

        res.json({ timetables });
    } catch (error) {
        next(error);
    }
};

module.exports = { getAdminTimetables };
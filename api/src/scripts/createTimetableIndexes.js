const mongoose = require('mongoose');
const connectDB = require('../config/database.js');
const TimetableModel = require('../models/timetable.model.js');
const TimetableTeacherSlotModel = require('../models/timetableTeacherSlot.model.js');

const createTimetableIndexes = async () => {
    try {
        await connectDB();
        await TimetableModel.createIndexes();
        await TimetableTeacherSlotModel.createIndexes();
        console.log('Timetable unique indexes created or already present.');
    } catch (error) {
        console.error('Failed to create timetable indexes:', error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
};

createTimetableIndexes();

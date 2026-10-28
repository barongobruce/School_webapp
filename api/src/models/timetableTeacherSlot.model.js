const { Schema, model } = require('mongoose');

const timetableTeacherSlotSchema = new Schema(
    {
        timetable: { type: Schema.Types.ObjectId, ref: 'Timetable', required: true },
        class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
        academicYear: { type: String, required: true, maxlength: 20 },
        term: { type: String, required: true, maxlength: 50 },
        teacher: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
        dayOfWeek: {
            type: String,
            required: true,
            enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        },
        // One lock per occupied minute. End minute is excluded.
        minute: { type: Number, required: true, min: 0, max: 1439 },
    },
    { timestamps: true },
);

timetableTeacherSlotSchema.index(
    { academicYear: 1, term: 1, teacher: 1, dayOfWeek: 1, minute: 1 },
    { unique: true },
);
timetableTeacherSlotSchema.index({ timetable: 1 });

module.exports = model('TimetableTeacherSlot', timetableTeacherSlotSchema);

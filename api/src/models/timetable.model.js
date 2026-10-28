const { Schema, model } = require('mongoose');

const timetableEntrySchema = new Schema(
    {
        dayOfWeek: {
            type: String,
            required: true,
            enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        },
        startTime: {
            type: String,
            required: true,
            match: [/^(?:[01]\d|2[0-3]):[0-5]\d$/, 'Start time must use HH:mm'],
        },
        endTime: {
            type: String,
            required: true,
            match: [/^(?:[01]\d|2[0-3]):[0-5]\d$/, 'End time must use HH:mm'],
        },
        slotType: {
            type: String,
            required: true,
            enum: ['lesson', 'break', 'lunch'],
            default: 'lesson',
        },
        label: { type: String, trim: true, default: '', maxlength: 100 },
        course: { type: Schema.Types.ObjectId, ref: 'Course', default: null },
        teacher: { type: Schema.Types.ObjectId, ref: 'Teacher', default: null },
        room: { type: String, trim: true, default: '', maxlength: 100 },
    },
    { _id: true },
);

const timetableSchema = new Schema(
    {
        class: {
            type: Schema.Types.ObjectId,
            ref: 'Class',
            required: true,
            index: true,
        },
        academicYear: {
            type: String,
            required: true,
            trim: true,
            maxlength: 20,
        },
        // A label because the existing application has no Term model/catalogue.
        term: { type: String, required: true, trim: true, maxlength: 50 },
        // Editable work in progress. Never returned to student/guardian viewers.
        draftEntries: { type: [timetableEntrySchema], default: [] },
        // Last successfully published snapshot.
        publishedEntries: { type: [timetableEntrySchema], default: [] },
        publishedAt: { type: Date, default: null },
        hasUnpublishedChanges: { type: Boolean, default: true },
    },
    { timestamps: true },
);

timetableSchema.index(
    { class: 1, academicYear: 1, term: 1 },
    { unique: true },
);

module.exports = model('Timetable', timetableSchema);
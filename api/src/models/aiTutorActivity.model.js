const { Schema, model } = require('mongoose');

const scoreSchema = new Schema(
    {
        correct: { type: Number, min: 0, required: true },
        total: { type: Number, min: 1, required: true },
        percentage: { type: Number, min: 0, max: 100, required: true },
        submittedAt: { type: Date, default: Date.now },
    },
    { _id: false },
);

const aiTutorActivitySchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        kind: {
            type: String,
            enum: ['quiz', 'lesson', 'flashcards', 'study-plan'],
            required: true,
        },
        topic: { type: String, required: true, trim: true, maxlength: 160 },
        difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
        result: { type: Schema.Types.Mixed, required: true },
        answers: { type: [String], default: [] },
        score: { type: scoreSchema, default: null },
    },
    { timestamps: true },
);

aiTutorActivitySchema.index({ user: 1, kind: 1, createdAt: -1 });

module.exports = model('AiTutorActivity', aiTutorActivitySchema);

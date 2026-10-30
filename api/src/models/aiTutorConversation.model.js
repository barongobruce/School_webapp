const { Schema, model } = require('mongoose');

const messageSchema = new Schema(
    {
        role: {
            type: String,
            enum: ['user', 'assistant'],
            required: true,
        },
        content: {
            type: String,
            required: true,
            maxlength: [30000, 'Message is too long'],
        },
        createdAt: { type: Date, default: Date.now },
    },
    { _id: false },
);

const aiTutorConversationSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        messages: {
            type: [messageSchema],
            default: [],
        },
    },
    { timestamps: true },
);

module.exports = model('AiTutorConversation', aiTutorConversationSchema);

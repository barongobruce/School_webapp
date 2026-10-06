const {Schema, model} = require('mongoose');


const studentSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true},
    idType: {type: String, required: true, enum: ['National ID', 'Passport', 'Driver\'s License', 'Other'], default: 'National ID'},
    // Legacy single-document field; prefer identification.front/back
    idPhoto: {type: String, default: '', maxlength: [500, 'ID photo must be less than 500 characters']},
    identification: {
        front: {type: String, default: '', maxlength: [500, 'ID front must be less than 500 characters']},
        back: {type: String, default: '', maxlength: [500, 'ID back must be less than 500 characters']},
    },
    class: {type: Schema.Types.ObjectId, ref: 'Class'},
    guardian: {type: Schema.Types.ObjectId, ref: 'Guardian'},
    emergencyContact: {type: String, required: true, trim: true, maxlength: [20, 'Emergency contact must be less than 20 characters']},
    assignments: [{type: Schema.Types.ObjectId, ref: 'Assignment'}],
    announcements: [{type: Schema.Types.ObjectId, ref: 'Announcement'}],
    events: [{type: Schema.Types.ObjectId, ref: 'Event'}],
    resources: [{type: Schema.Types.ObjectId, ref: 'Resource'}],
    exams: [{type: Schema.Types.ObjectId, ref: 'Exam'}],
    quizzes: [{type: Schema.Types.ObjectId, ref: 'Quiz'}],
}, {timestamps: true})


const StudentModel = model('Student', studentSchema);
module.exports = StudentModel;

const {Schema, model} = require('mongoose');


const guardianSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true},
    students: [{type: Schema.Types.ObjectId, ref: 'Student'}],
    idType: {type: String, required: true, enum: ['National ID', 'Passport', 'Driver\'s License', 'Other'], default: 'National ID'},
    idPhoto: {type: String, default: '', maxlength: [500, 'ID photo must be less than 500 characters']},
    identification: {
        front: {type: String, default: ''},
        back: {type: String, default: ''},
    },
    stripeCustomerId: {type: String, trim: true, default: ''},
}, {timestamps: true})


const GuardianModel = model('Guardian', guardianSchema);
module.exports = GuardianModel;

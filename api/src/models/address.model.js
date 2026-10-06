const {Schema, model} = require('mongoose');


const addressSchema = new Schema({
    street: {type: String, required: true, trim: true, maxlength: [100, 'Street must be less than 100 characters']},
    city: {type: String, required: true, trim: true, maxlength: [50, 'City must be less than 50 characters']},
    region: {type: String, required: true, trim: true, maxlength: [50, 'State must be less than 50 characters']},
    postalCode: {type: String, required: true, trim: true, maxlength: [10, 'Postal code must be less than 10 characters']},
    country: {type: String, required: true, trim: true, maxlength: [50, 'Country must be less than 50 characters']},
    isActive: {type: Boolean, default: true},
}, {timestamps: true});


const AddressModel = model('Address', addressSchema);
module.exports = AddressModel;
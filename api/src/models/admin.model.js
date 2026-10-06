const { Schema, model } = require('mongoose');
// const bcrypt = require('bcryptjs');

const adminSchema = new Schema(
    {
        firstName: {
            type: String,
            required: [true, 'First name is required'],
            trim: true,
            maxlength: [50, 'First name cannot exceed 50 characters'],
        },
        lastName: {
            type: String,
            required: [true, 'Last name is required'],
            trim: true,
            maxlength: [50, 'Last name cannot exceed 50 characters'],
        },
        photo: {type: String, default: '', maxlength: [500, 'Photo must be less than 200 characters']},
        email: {
            type: String,
            required: [true, 'Email is required'],
            trim: true,
            unique: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters'],
            select: false,
        },
        phone: {type: String, default: '', maxlength: [30, 'Phone must be less than 30 characters']},
        role: {
            type: String,
            required: true,
            enum: {
                values: ['admin', 'superadmin'],
                message: 'Role must be either admin or superadmin',
            },
            default: 'admin',
        },
        isActive: {
            type: Boolean,
            default: true,
        }
    },
    {timestamps: true}
);


const AdminModel = model('Admin', adminSchema);

module.exports = AdminModel;

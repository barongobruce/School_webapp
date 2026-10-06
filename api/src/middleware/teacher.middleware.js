const jwt = require('jsonwebtoken');

const { UserModel } = require('../models/user.model.js');
const TeacherModel = require('../models/teacher.model.js');
const ENV = require('../config/env.js');

const protectTeacher = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Not authorized. No token provided.' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Not authorized. No token provided.' });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, ENV.JWT_SECRET);
        } catch {
            return res.status(401).json({ message: 'Not authorized. Invalid or expired token.' });
        }

        const user = await UserModel.findById(decoded.id);
        if (!user || user.isDeleted) {
            return res.status(401).json({ message: 'Not authorized. User not found.' });
        }

        if (!user.isActive) {
            return res.status(403).json({
                message: 'Account is banned. Contact the school administration.',
            });
        }

        if (user.role !== 'teacher') {
            return res.status(403).json({ message: 'Access denied. Teachers only.' });
        }

        const teacher = await TeacherModel.findOne({ user: user._id });
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher profile not found' });
        }

        req.user = user;
        req.teacher = teacher;
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = { protectTeacher };

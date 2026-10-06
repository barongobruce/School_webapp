const jwt = require('jsonwebtoken');

const AdminModel = require('../models/admin.model.js');
const ENV = require('../config/env.js');

const adminProtector = async (req, res, next) => {
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
        } catch (error) {
            return res.status(401).json({ message: 'Not authorized. Invalid or expired token.' });
        }

        const admin = await AdminModel.findById(decoded.id);
        if (!admin) {
            return res.status(401).json({ message: 'Not authorized. Admin not found.' });
        }

        if (!admin.isActive) {
            return res.status(403).json({ message: 'Account is deactivated. Contact support.' });
        }

        req.admin = admin;
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = { adminProtector };

const bcrypt = require('bcryptjs');
const AdminModel = require('../models/admin.model.js');

const DEFAULT_ADMIN = {
    firstName: 'Barongo',
    lastName: 'Bruce',
    email: 'brosnanbarongo@gmail.com',
    password: 'bruce123',
    role: 'admin',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
};

const seedAdmin = async () => {
    try {
        const existingAdmin = await AdminModel.findOne({ email: DEFAULT_ADMIN.email });

        if (existingAdmin) {
    existingAdmin.firstName = DEFAULT_ADMIN.firstName;
    existingAdmin.lastName = DEFAULT_ADMIN.lastName;
    await existingAdmin.save();

    console.log(
        `👤 Updated admin name: ${existingAdmin.firstName} ${existingAdmin.lastName}`
    );
    return existingAdmin;
}


        const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, 10);

        const admin = await AdminModel.create({
            ...DEFAULT_ADMIN,
            password: hashedPassword,
        });

        console.log(`🌱 Admin seeded successfully: ${admin.email}`);
        return admin;
    } catch (error) {
        console.error('💥 Failed to seed admin:', error.message);
        throw error;
    }
};

module.exports = seedAdmin;

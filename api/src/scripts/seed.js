/**
 * CLI entry for demo data seeding.
 *
 *   npm run seed
 *   npm run seed -- --force
 */

const connectDB = require('../config/database.js');
const seedAdmin = require('../config/seedAdmin.js');
const seedDemo = require('../config/seedDemo.js');

const force = process.argv.includes('--force');

const run = async () => {
    try {
        await connectDB();
        await seedAdmin();
        await seedDemo({ force });
        process.exit(0);
    } catch (error) {
        console.error('💥 Seed failed:', error.message);
        console.error(error);
        process.exit(1);
    }
};

run();

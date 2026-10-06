const {connect, connection} = require('mongoose');
const ENV = require('./env.js');

const connectDB = async () => {
    try {
        await connect(ENV.MONGO_URI);
        console.log(`✅ Connected to MONGODB: ${connection.host}`);
        return connection;
    } catch (error) {
        console.error('💥 MONGODB connection error:', error.message);
        throw error;
    }
};

module.exports = connectDB;
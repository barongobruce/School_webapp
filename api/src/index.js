const express = require('express');
const cors = require('cors');

const ENV = require('./config/env.js');
const connectDB = require('./config/database.js');
const seedAdmin = require('./config/seedAdmin.js');
const {notFound, errorHandler} = require('./middleware/error.middleware.js');
const adminRoutes = require('./routes/admin.route.js');
const userRoutes = require('./routes/user.route.js');
const teacherRoutes = require('./routes/teacher.route.js');
const mountWebhooks = require('./webhooks');
const app = express();

app.use(cors({
    origin: [ENV.FRONTEND_URL, ENV.ADMIN_URL],
    credentials: true,
}));

// Webhooks (raw body) must be mounted before express.json().
mountWebhooks(app);

app.use(express.json());




// API HEALTH CHECK   
app.use('/api/health', (req, res) => {
    res.status(200).json({
        message: 'API is running',
        version: '1.0.0',
        uptime: process.uptime(),
        timestamp: Date.now(),
        status: 'ok',
    });
});


// API ROUTES
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/teacher', teacherRoutes);




// ERROR ROUTES
app.use(notFound);
app.use(errorHandler);



// Connect to Database and Start Server if DB connected successfully
const startServer = async () => {
    try {
        const conn = await connectDB();
        if (conn.readyState === 1) {
            console.log('✅ Connected to MONGODB');
            // create default admin if not exists
            await seedAdmin();
            // start server
            app.listen(ENV.PORT, () => {
                console.log(`Server is running on port ${ENV.PORT}`);
            });
        } else {
            console.error('💥 Failed to connect to the Database');
            process.exit(1);
        }
    } catch (error) {
        console.error('💥 Failed to start the server');
        process.exit(1);
    }
};

startServer();

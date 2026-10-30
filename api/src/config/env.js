const dns = require('dns');
const dotenv = require('dotenv');

dotenv.config();

// Windows/local DNS often fails mongodb+srv SRV lookups (querySrv ECONNREFUSED)
dns.setServers(['8.8.8.8', '1.1.1.1']);

const ENV = {
    PORT: process.env.PORT,
    MONGO_URI: process.env.MONGO_URI,
    NODE_ENV: process.env.NODE_ENV,
    FRONTEND_URL: process.env.FRONTEND_URL,
    ADMIN_URL: process.env.ADMIN_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    MAILTRAP_HOST: process.env.MAILTRAP_HOST,
    MAILTRAP_USERNAME: process.env.MAILTRAP_USERNAME,
    MAILTRAP_PASSWORD: process.env.MAILTRAP_PASSWORD,
    MAILTRAP_TOKEN: process.env.MAILTRAP_TOKEN,
    MAILTRAP_PORT: process.env.MAILTRAP_PORT,
    DEMO_ACCOUNT_CREATION_ENABLED: process.env.DEMO_ACCOUNT_CREATION_ENABLED,
    DEMO_DEFAULT_PASSWORD: process.env.DEMO_DEFAULT_PASSWORD,
    STRIPE_API_KEY: process.env.STRIPE_API_KEY,
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    AI_TUTOR_SERVICE_URL: process.env.AI_TUTOR_SERVICE_URL,
    AI_TUTOR_SERVICE_TOKEN: process.env.AI_TUTOR_SERVICE_TOKEN,
};

module.exports = ENV;

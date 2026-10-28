const nodemailer = require('nodemailer');
const {
    MAILTRAP_HOST,
    MAILTRAP_USERNAME,
    MAILTRAP_PASSWORD,
    MAILTRAP_PORT,
} = require('../config/env');

class EmailSender {
    transporter = null;

    getTransporter() {
        const host = MAILTRAP_HOST?.trim();
        const username = MAILTRAP_USERNAME?.trim();
        const password = MAILTRAP_PASSWORD;
        const port = Number(MAILTRAP_PORT || 2525);

        if (!host || !username || !password) {
            throw new Error(
                'Mailtrap Sandbox SMTP is not configured (set MAILTRAP_HOST, MAILTRAP_PORT, MAILTRAP_USERNAME, and MAILTRAP_PASSWORD)'
            );
        }

        if (!Number.isInteger(port) || port < 1 || port > 65535) {
            throw new Error('MAILTRAP_PORT must be a valid port number');
        }

        if (!this.transporter) {
            this.transporter = nodemailer.createTransport({
                host,
                port,
                secure: port === 465,
                requireTLS: port !== 465,
                auth: {
                    user: username,
                    pass: password,
                },
                connectionTimeout: 15000,
                greetingTimeout: 15000,
                socketTimeout: 15000,
            });
        }

        return this.transporter;
    }

    async sendEmail({ to, subject, html, text }) {
        if (!to || !subject || (!html && !text)) {
            throw new Error('to, subject, and html or text are required');
        }

        const transporter = this.getTransporter();
        const info = await transporter.sendMail({
            from: {
                name: 'School Web App',
                address: 'noreply@example.com',
            },
            to,
            subject,
            ...(text && { text }),
            ...(html && { html }),
        });

        return {
            messageId: info.messageId,
            accepted: info.accepted,
            rejected: info.rejected,
            response: info.response,
        };
    }
}

module.exports = new EmailSender();
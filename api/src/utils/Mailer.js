const {
    MAILTRAP_TOKEN,
    MAILTRAP_PASSWORD,
} = require('../config/env');

const MAILTRAP_SEND_URL = 'https://send.api.mailtrap.io/api/send';
const SEND_TIMEOUT_MS = 15000;

class EmailSender {
    getToken() {
        return MAILTRAP_TOKEN || MAILTRAP_PASSWORD;
    }

    async sendEmail({ to, subject, html, text }) {
        if (!to || !subject || (!html && !text)) {
            throw new Error('to, subject, and html or text are required');
        }

        const token = this.getToken();
        if (!token) {
            throw new Error(
                'Mailtrap is not configured (set MAILTRAP_TOKEN or MAILTRAP_PASSWORD)'
            );
        }

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), SEND_TIMEOUT_MS);

        try {
            const response = await fetch(MAILTRAP_SEND_URL, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'User-Agent': 'school-webapp-api',
                },
                body: JSON.stringify({
                    from: {
                        email: 'noreply@dummyegator.com',
                        name: 'School Web App',
                    },
                    to: [{ email: to }],
                    subject,
                    ...(text && { text }),
                    ...(html && { html }),
                }),
                signal: controller.signal,
            });

            const body = await response.json().catch(() => ({}));

            if (!response.ok) {
                const detail =
                    body?.errors?.join?.(', ') ||
                    body?.message ||
                    JSON.stringify(body) ||
                    response.statusText;
                throw new Error(`Mailtrap API ${response.status}: ${detail}`);
            }

            return body;
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error(`Mailtrap API timed out after ${SEND_TIMEOUT_MS}ms`);
            }
            throw error;
        } finally {
            clearTimeout(timer);
        }
    }
}

module.exports = new EmailSender();

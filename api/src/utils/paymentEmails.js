const PaymentModel = require('../models/payment.model.js');
const mailer = require('./Mailer.js');
const { paymentReceiptEmail } = require('./emailTemplates.js');
const ENV = require('../config/env.js');
const {
    PURPOSE_LABELS,
    METHOD_LABELS,
    personName,
    paymentPopulate,
} = require('./payment.helpers.js');

const formatMoney = (amount, currency = 'USD') => {
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: (currency || 'USD').toUpperCase(),
            maximumFractionDigits: 2,
        }).format(Number(amount) || 0);
    } catch {
        return `${currency} ${Number(amount) || 0}`;
    }
};

const formatDateLabel = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

/**
 * Email a payment receipt to the guardian once the invoice is paid.
 * Idempotent across webhook + success-page confirm races.
 */
const sendPaymentReceiptEmail = async (paymentInput) => {
    if (!paymentInput?._id || paymentInput.status !== 'paid') return false;

    // Atomically claim the send so webhook + confirm only email once.
    const claimed = await PaymentModel.findOneAndUpdate(
        {
            _id: paymentInput._id,
            status: 'paid',
            receiptEmailSentAt: null,
        },
        { $set: { receiptEmailSentAt: new Date() } },
    );

    if (!claimed) return false;

    try {
        const payment = await PaymentModel.findById(paymentInput._id).populate(
            paymentPopulate,
        );

        const guardianUser = payment?.guardian?.user;
        if (!guardianUser?.email) {
            await PaymentModel.findByIdAndUpdate(paymentInput._id, {
                $set: { receiptEmailSentAt: null },
            });
            return false;
        }

        const dashboardUrl = ENV.FRONTEND_URL
            ? `${ENV.FRONTEND_URL.replace(/\/$/, '')}/dashboard/payments`
            : '';
        const receiptPdfUrl =
            payment.stripeInvoicePdf || payment.receiptUrl || '';

        const template = paymentReceiptEmail({
            firstName: guardianUser.firstName,
            studentName: personName(payment.student) || 'your student',
            title: payment.title,
            feeType: PURPOSE_LABELS[payment.purpose] || payment.purpose,
            amountLabel: formatMoney(
                payment.amountPaid || payment.amount,
                payment.currency,
            ),
            paidDateLabel: formatDateLabel(payment.paidDate || new Date()),
            receiptNumber:
                payment.transactionId ||
                payment.stripePaymentIntentId ||
                String(payment._id).slice(-8).toUpperCase(),
            paymentMethod: METHOD_LABELS[payment.method] || payment.method || 'Card',
            term: payment.term || '',
            academicYear: payment.academicYear || '',
            receiptPdfUrl,
            dashboardUrl,
        });

        await mailer.sendEmail({
            to: guardianUser.email,
            subject: template.subject,
            html: template.html,
            text: template.text,
        });

        return true;
    } catch (error) {
        // Allow a later settle path to retry if Mailtrap/network failed.
        await PaymentModel.findByIdAndUpdate(paymentInput._id, {
            $set: { receiptEmailSentAt: null },
        });
        console.warn('Payment receipt email failed:', error.message);
        return false;
    }
};

module.exports = {
    sendPaymentReceiptEmail,
    formatMoney,
    formatDateLabel,
};

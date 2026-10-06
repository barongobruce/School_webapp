const stripe = require('../config/stripe.js');
const ENV = require('../config/env.js');
const GuardianModel = require('../models/guardian.model.js');
const { toStripeAmount, PURPOSE_LABELS } = require('../utils/payment.helpers.js');

const frontendBaseUrl = () =>
    (ENV.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');

/**
 * Get or create a Stripe Customer for a guardian and persist the id.
 */
const getOrCreateCustomer = async ({ guardian, guardianUser }) => {
    if (!guardian || !guardianUser?.email) {
        throw Object.assign(new Error('Guardian email is required for Stripe'), {
            statusCode: 400,
        });
    }

    if (guardian.stripeCustomerId) {
        try {
            const existing = await stripe.customers.retrieve(
                guardian.stripeCustomerId,
            );
            if (!existing.deleted) return existing;
        } catch {
            // Customer missing remotely — create a fresh one below.
        }
    }

    const customer = await stripe.customers.create({
        email: guardianUser.email,
        name: `${guardianUser.firstName || ''} ${guardianUser.lastName || ''}`.trim(),
        metadata: {
            guardianId: String(guardian._id),
            userId: String(guardianUser._id),
        },
    });

    await GuardianModel.findByIdAndUpdate(guardian._id, {
        stripeCustomerId: customer.id,
    });

    guardian.stripeCustomerId = customer.id;
    return customer;
};

/**
 * Create, finalize, and return a Stripe Invoice for a school payment.
 */
const createAndFinalizeInvoice = async ({
    customerId,
    payment,
    studentName,
}) => {
    const currency = (payment.currency || 'USD').toLowerCase();
    const unitAmount = toStripeAmount(payment.amount);

    if (!Number.isFinite(unitAmount) || unitAmount < 1) {
        throw Object.assign(new Error('Amount must be at least 0.01'), {
            statusCode: 400,
        });
    }

    let daysUntilDue = 7;
    if (payment.dueDate) {
        const due = new Date(payment.dueDate);
        const now = new Date();
        const diffMs = due.setHours(23, 59, 59, 999) - now.getTime();
        daysUntilDue = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    }

    const purposeLabel =
        PURPOSE_LABELS[payment.purpose] || payment.purpose || 'Fee';
    const description =
        payment.description ||
        `${payment.title} — ${studentName} (${purposeLabel})`;

    // Attach a pending line item, then include it on the draft invoice.
    await stripe.invoiceItems.create({
        customer: customerId,
        currency,
        amount: unitAmount,
        description,
        metadata: {
            paymentId: String(payment._id),
        },
    });

    const invoice = await stripe.invoices.create({
        customer: customerId,
        collection_method: 'send_invoice',
        days_until_due: daysUntilDue,
        currency,
        pending_invoice_items_behavior: 'include',
        metadata: {
            paymentId: String(payment._id),
            studentId: String(payment.student),
            guardianId: String(payment.guardian),
            purpose: payment.purpose || '',
        },
        custom_fields: studentName
            ? [{ name: 'Student', value: studentName.slice(0, 30) }]
            : undefined,
        footer: 'Thank you for supporting your child’s education.',
        description: `Invoice for ${studentName}`,
    });

    const finalized = await stripe.invoices.finalizeInvoice(invoice.id, {
        expand: ['payment_intent'],
    });

    return finalized;
};

/**
 * Retrieve a Stripe invoice and normalize useful fields.
 */
const retrieveInvoice = async (stripeInvoiceId) => {
    if (!stripeInvoiceId) return null;
    return stripe.invoices.retrieve(stripeInvoiceId, {
        expand: ['payment_intent'],
    });
};

/**
 * Create a Checkout Session so guardians return to our success/failure pages.
 * The existing Stripe Invoice stays for records; we settle it out-of-band after pay.
 */
const createCheckoutSession = async ({ payment, customerId, studentName }) => {
    const currency = (payment.currency || 'USD').toLowerCase();
    const unitAmount = toStripeAmount(payment.amount);

    if (!Number.isFinite(unitAmount) || unitAmount < 1) {
        throw Object.assign(new Error('Amount must be at least 0.01'), {
            statusCode: 400,
        });
    }

    const purposeLabel =
        PURPOSE_LABELS[payment.purpose] || payment.purpose || 'Fee';
    const productName = payment.title || purposeLabel;
    const productDescription = [studentName, purposeLabel, payment.term]
        .filter(Boolean)
        .join(' · ')
        .slice(0, 500);

    const paymentId = String(payment._id);
    const base = frontendBaseUrl();

    return stripe.checkout.sessions.create({
        mode: 'payment',
        customer: customerId,
        client_reference_id: paymentId,
        metadata: {
            paymentId,
            studentId: String(payment.student?._id || payment.student || ''),
            guardianId: String(payment.guardian?._id || payment.guardian || ''),
            stripeInvoiceId: payment.stripeInvoiceId || '',
        },
        line_items: [
            {
                quantity: 1,
                price_data: {
                    currency,
                    unit_amount: unitAmount,
                    product_data: {
                        name: productName,
                        description: productDescription || undefined,
                    },
                },
            },
        ],
        success_url: `${base}/dashboard/payments/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${base}/dashboard/payments/failed?payment_id=${paymentId}&reason=cancelled`,
    });
};

const retrieveCheckoutSession = async (sessionId) => {
    if (!sessionId) return null;
    return stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['payment_intent'],
    });
};

/**
 * Close the Stripe Invoice without charging again after Checkout succeeds.
 */
const markInvoicePaidOutOfBand = async (stripeInvoiceId) => {
    if (!stripeInvoiceId) return null;

    const invoice = await stripe.invoices.retrieve(stripeInvoiceId);
    if (!invoice || invoice.status === 'paid' || invoice.status === 'void') {
        return invoice;
    }

    if (invoice.status === 'draft') {
        const finalized = await stripe.invoices.finalizeInvoice(invoice.id);
        if (finalized.status === 'paid') return finalized;
    }

    return stripe.invoices.pay(stripeInvoiceId, {
        paid_out_of_band: true,
    });
};

/**
 * Void an open Stripe invoice (used when cancelling a pending payment).
 */
const voidInvoice = async (stripeInvoiceId) => {
    if (!stripeInvoiceId) return null;
    return stripe.invoices.voidInvoice(stripeInvoiceId);
};

/**
 * Apply Stripe invoice state onto a mongoose Payment document (in-memory).
 * Caller is responsible for saving.
 */
const applyInvoiceToPayment = (payment, invoice) => {
    if (!payment || !invoice) return payment;

    payment.stripeInvoiceId = invoice.id || payment.stripeInvoiceId;
    payment.stripeCustomerId =
        typeof invoice.customer === 'string'
            ? invoice.customer
            : invoice.customer?.id || payment.stripeCustomerId;
    payment.stripeHostedInvoiceUrl =
        invoice.hosted_invoice_url || payment.stripeHostedInvoiceUrl;
    payment.stripeInvoicePdf = invoice.invoice_pdf || payment.stripeInvoicePdf;

    const paymentIntent =
        typeof invoice.payment_intent === 'object'
            ? invoice.payment_intent
            : null;
    if (paymentIntent?.id) {
        payment.stripePaymentIntentId = paymentIntent.id;
    } else if (typeof invoice.payment_intent === 'string') {
        payment.stripePaymentIntentId = invoice.payment_intent;
    }

    if (invoice.status === 'paid') {
        payment.status = 'paid';
        payment.amountPaid = payment.amount;
        payment.method = 'stripe';
        payment.paidDate = invoice.status_transitions?.paid_at
            ? new Date(invoice.status_transitions.paid_at * 1000)
            : new Date();
        payment.transactionId =
            payment.stripePaymentIntentId ||
            invoice.charge ||
            invoice.id ||
            payment.transactionId;
        payment.receiptUrl =
            payment.stripeInvoicePdf || payment.receiptUrl || '';
    } else if (invoice.status === 'void') {
        payment.status = 'cancelled';
    } else if (invoice.status === 'uncollectible') {
        payment.status = 'failed';
    } else if (
        invoice.status === 'open' &&
        payment.status !== 'paid' &&
        payment.status !== 'cancelled'
    ) {
        payment.status = 'pending';
        payment.stripeHostedInvoiceUrl =
            invoice.hosted_invoice_url || payment.stripeHostedInvoiceUrl;
    }

    return payment;
};

/**
 * Apply a completed Checkout Session onto a Payment document (in-memory).
 */
const applyCheckoutSessionToPayment = (payment, session) => {
    if (!payment || !session) return payment;

    payment.stripeCheckoutSessionId = session.id || payment.stripeCheckoutSessionId;
    payment.stripeCustomerId =
        typeof session.customer === 'string'
            ? session.customer
            : session.customer?.id || payment.stripeCustomerId;

    const paymentIntent =
        typeof session.payment_intent === 'object'
            ? session.payment_intent
            : null;
    if (paymentIntent?.id) {
        payment.stripePaymentIntentId = paymentIntent.id;
    } else if (typeof session.payment_intent === 'string') {
        payment.stripePaymentIntentId = session.payment_intent;
    }

    if (session.payment_status === 'paid') {
        payment.status = 'paid';
        payment.amountPaid = payment.amount;
        payment.method = 'stripe';
        payment.paidDate = new Date();
        payment.transactionId =
            payment.stripePaymentIntentId || session.id || payment.transactionId;
    } else if (
        session.status === 'expired' &&
        payment.status !== 'paid' &&
        payment.status !== 'cancelled'
    ) {
        // Leave as pending so the guardian can retry.
        payment.status = 'pending';
    }

    return payment;
};

module.exports = {
    getOrCreateCustomer,
    createAndFinalizeInvoice,
    createCheckoutSession,
    retrieveCheckoutSession,
    retrieveInvoice,
    markInvoicePaidOutOfBand,
    voidInvoice,
    applyInvoiceToPayment,
    applyCheckoutSessionToPayment,
};

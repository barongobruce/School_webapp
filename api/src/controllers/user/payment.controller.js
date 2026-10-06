const mongoose = require('mongoose');
const PaymentModel = require('../../models/payment.model.js');
const { resolveAccessContext } = require('../../utils/lessonAccess.js');
const stripeService = require('../../services/stripe.service.js');
const {
    serializePayment,
    paymentPopulate,
    personName,
    resolvePurpose,
} = require('../../utils/payment.helpers.js');
const { sendPaymentReceiptEmail } = require('../../utils/paymentEmails.js');

const buildAccessFilter = async (user) => {
    const access = await resolveAccessContext(user);

    if (access.role === 'guardian' && access.guardianId) {
        return {
            filter: { isActive: true, guardian: access.guardianId },
            access,
            canPay: true,
        };
    }

    if (access.role === 'student' && access.studentId) {
        return {
            filter: { isActive: true, student: access.studentId },
            access,
            canPay: false,
        };
    }

    return { filter: null, access, canPay: false };
};

const settlePaidCheckout = async (payment, session) => {
    stripeService.applyCheckoutSessionToPayment(payment, session);
    await payment.save();

    if (payment.stripeInvoiceId && payment.status === 'paid') {
        try {
            const invoice = await stripeService.markInvoicePaidOutOfBand(
                payment.stripeInvoiceId,
            );
            if (invoice) {
                stripeService.applyInvoiceToPayment(payment, invoice);
                await payment.save();
            }
        } catch (error) {
            // Checkout already succeeded — invoice sync can catch up later.
            console.warn('Invoice out-of-band settle skipped:', error.message);
        }
    }

    if (payment.status === 'paid') {
        // Best-effort; failures are logged and can retry on later settle.
        await sendPaymentReceiptEmail(payment);
    }

    return payment;
};

const syncPaymentWithStripe = async (payment) => {
    if (payment.status === 'paid') return payment;

    if (payment.stripeCheckoutSessionId) {
        try {
            const session = await stripeService.retrieveCheckoutSession(
                payment.stripeCheckoutSessionId,
            );
            if (session?.payment_status === 'paid') {
                return settlePaidCheckout(payment, session);
            }
        } catch (error) {
            console.warn('Checkout session sync skipped:', error.message);
        }
    }

    if (!payment.stripeInvoiceId) return payment;

    try {
        const invoice = await stripeService.retrieveInvoice(
            payment.stripeInvoiceId,
        );
        stripeService.applyInvoiceToPayment(payment, invoice);
        await payment.save();

        if (payment.status === 'paid') {
            await sendPaymentReceiptEmail(payment);
        }
    } catch (error) {
        console.warn('Stripe sync skipped:', error.message);
    }

    return payment;
};

const assertCanAccessPayment = (payment, access) => {
    if (access.role === 'guardian' && access.guardianId) {
        const guardianId = (
            payment.guardian?._id ||
            payment.guardian ||
            ''
        ).toString();
        return guardianId === access.guardianId.toString();
    }

    if (access.role === 'student' && access.studentId) {
        const studentId = (
            payment.student?._id ||
            payment.student ||
            ''
        ).toString();
        return studentId === access.studentId.toString();
    }

    return false;
};

const getMyPayments = async (req, res, next) => {
    try {
        const { search, status, purpose, feeType, kind } = req.query;
        const { filter, access } = await buildAccessFilter(req.user);

        if (!filter) {
            return res.json({
                count: 0,
                stats: {
                    outstanding: 0,
                    paidTotal: 0,
                    invoiceCount: 0,
                    overdueCount: 0,
                    paidCount: 0,
                },
                payments: [],
                message:
                    access.role === 'teacher'
                        ? 'Teachers do not have fee invoices'
                        : 'No payment profile found',
            });
        }

        const resolvedPurpose = resolvePurpose(purpose || feeType);
        if (resolvedPurpose) filter.purpose = resolvedPurpose;

        if (status && status !== 'All' && status !== 'Overdue') {
            filter.status = String(status).toLowerCase();
        }

        let payments = await PaymentModel.find(filter)
            .populate(paymentPopulate)
            .sort({ createdAt: -1 });

        // Best-effort sync for open Stripe invoices so the list stays fresh.
        await Promise.all(
            payments
                .filter(
                    (payment) =>
                        payment.stripeInvoiceId &&
                        ['pending', 'partial', 'failed'].includes(payment.status),
                )
                .slice(0, 10)
                .map((payment) => syncPaymentWithStripe(payment)),
        );

        payments = await PaymentModel.find(filter)
            .populate(paymentPopulate)
            .sort({ createdAt: -1 })
            .lean();

        if (status === 'Overdue') {
            const now = new Date();
            payments = payments.filter((payment) => {
                if (!['pending', 'partial'].includes(payment.status)) {
                    return false;
                }
                if (!payment.dueDate) return false;
                const due = new Date(payment.dueDate);
                due.setHours(23, 59, 59, 999);
                return due < now;
            });
        }

        let serialized = payments.map(serializePayment);

        if (kind === 'Invoices') {
            serialized = serialized.filter((item) => item.kind === 'Invoice');
        } else if (kind === 'Payments') {
            serialized = serialized.filter((item) => item.kind === 'Payment');
        }

        if (search?.trim()) {
            const q = search.trim().toLowerCase();
            serialized = serialized.filter((payment) => {
                const haystack = [
                    payment.id,
                    payment.title,
                    payment.kind,
                    payment.student?.name,
                    payment.guardian?.name,
                    payment.feeType,
                    payment.term,
                    payment.academicYear,
                    payment.status,
                    payment.receiptNumber,
                    payment.notes,
                ]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase();
                return haystack.includes(q);
            });
        }

        const stats = serialized.reduce(
            (acc, payment) => {
                acc.outstanding += payment.balance;
                if (payment.kind === 'Payment') {
                    acc.paidTotal += payment.amountPaid;
                }
                if (payment.kind === 'Invoice') acc.invoiceCount += 1;
                if (payment.status === 'Overdue') acc.overdueCount += 1;
                if (payment.statusKey === 'paid') acc.paidCount += 1;
                return acc;
            },
            {
                outstanding: 0,
                paidTotal: 0,
                invoiceCount: 0,
                overdueCount: 0,
                paidCount: 0,
            },
        );

        res.json({
            count: serialized.length,
            stats,
            payments: serialized,
            canPay: access.role === 'guardian',
        });
    } catch (error) {
        next(error);
    }
};

const getMyPaymentById = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid payment ID' });
        }

        const { access } = await buildAccessFilter(req.user);
        let payment = await PaymentModel.findById(id).populate(paymentPopulate);

        if (!payment || !payment.isActive) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        if (!assertCanAccessPayment(payment, access)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        payment = await syncPaymentWithStripe(payment);
        const populated = await PaymentModel.findById(payment._id).populate(
            paymentPopulate,
        );

        res.json({
            payment: serializePayment(populated),
            canPay:
                access.role === 'guardian' &&
                ['pending', 'partial', 'failed'].includes(populated.status),
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create a Stripe Checkout Session and return its URL.
 * Success/cancel URLs bring the guardian back into the client app.
 */
const checkoutPayment = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid payment ID' });
        }

        const { access } = await buildAccessFilter(req.user);

        if (access.role !== 'guardian' || !access.guardianId) {
            return res.status(403).json({
                message: 'Only guardians can pay invoices',
            });
        }

        let payment = await PaymentModel.findById(id).populate(paymentPopulate);

        if (!payment || !payment.isActive) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        if (!assertCanAccessPayment(payment, access)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        if (payment.status === 'paid') {
            return res.status(400).json({ message: 'This invoice is already paid' });
        }

        if (payment.status === 'cancelled') {
            return res
                .status(400)
                .json({ message: 'This invoice has been cancelled' });
        }

        payment = await syncPaymentWithStripe(payment);

        if (payment.status === 'paid') {
            return res.status(400).json({ message: 'This invoice is already paid' });
        }

        const guardianDoc = payment.guardian;
        const guardianUser = guardianDoc?.user;
        if (!guardianDoc || !guardianUser?.email) {
            return res.status(400).json({
                message: 'Guardian billing details are incomplete',
            });
        }

        const customer = await stripeService.getOrCreateCustomer({
            guardian: guardianDoc,
            guardianUser,
        });

        const session = await stripeService.createCheckoutSession({
            payment,
            customerId: customer.id,
            studentName: personName(payment.student),
        });

        payment.stripeCheckoutSessionId = session.id;
        payment.stripeCustomerId = customer.id;
        await payment.save();

        res.json({
            message: 'Checkout ready',
            url: session.url,
            sessionId: session.id,
            payment: serializePayment(payment),
            studentName: personName(payment.student),
        });
    } catch (error) {
        if (error.statusCode) res.status(error.statusCode);
        next(error);
    }
};

/**
 * Confirm a Checkout Session after Stripe redirects to the success page.
 */
const confirmCheckoutSession = async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        if (!sessionId?.startsWith('cs_')) {
            return res.status(400).json({ message: 'Invalid checkout session' });
        }

        const { access } = await buildAccessFilter(req.user);
        if (access.role !== 'guardian' || !access.guardianId) {
            return res.status(403).json({
                message: 'Only guardians can confirm invoice payments',
            });
        }

        const session = await stripeService.retrieveCheckoutSession(sessionId);
        if (!session) {
            return res.status(404).json({ message: 'Checkout session not found' });
        }

        const paymentId =
            session.metadata?.paymentId || session.client_reference_id;
        if (!paymentId || !mongoose.Types.ObjectId.isValid(paymentId)) {
            return res.status(400).json({
                message: 'Checkout session is not linked to a payment',
            });
        }

        let payment = await PaymentModel.findById(paymentId).populate(
            paymentPopulate,
        );
        if (!payment || !payment.isActive) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        if (!assertCanAccessPayment(payment, access)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        if (session.payment_status === 'paid') {
            payment = await settlePaidCheckout(payment, session);
        } else {
            stripeService.applyCheckoutSessionToPayment(payment, session);
            await payment.save();
        }

        const populated = await PaymentModel.findById(payment._id).populate(
            paymentPopulate,
        );

        res.json({
            message:
                session.payment_status === 'paid'
                    ? 'Payment confirmed'
                    : 'Payment not completed',
            paid: session.payment_status === 'paid',
            sessionStatus: session.status,
            paymentStatus: session.payment_status,
            payment: serializePayment(populated),
        });
    } catch (error) {
        if (error.statusCode) res.status(error.statusCode);
        next(error);
    }
};

module.exports = {
    getMyPayments,
    getMyPaymentById,
    checkoutPayment,
    confirmCheckoutSession,
};

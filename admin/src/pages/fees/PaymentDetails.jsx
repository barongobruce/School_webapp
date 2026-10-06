import React, { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  ExternalLink,
  LoaderCircle,
  Mail,
  Ban,
  Receipt,
  UserRound,
  Users,
  Wallet,
} from 'lucide-react'
import {
  cancelPayment,
  getPaymentById,
  resendInvoice,
  updatePayment,
} from '../../lib/payment.requests'
import useModal from '../../hooks/useModal'
import Button from '../../components/Button'
import EditPayment from './components/EditPayment'

const formatCurrency = (amount, currency = 'USD') => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount || 0)
  } catch {
    return `USD ${new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(amount || 0)}`
  }
}

const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const statusClass = (status) => {
  switch (status) {
    case 'Paid':
      return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/25'
    case 'Partial':
      return 'bg-sky-50 text-sky-700 ring-1 ring-sky-200/80 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/25'
    case 'Pending':
      return 'bg-gray-50 text-gray-600 ring-1 ring-gray-200/80 dark:bg-white/5 dark:text-gray-300 dark:ring-white/10'
    case 'Overdue':
      return 'bg-rose-50 text-rose-700 ring-1 ring-rose-200/80 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/25'
    case 'Cancelled':
      return 'bg-gray-50 text-gray-500 ring-1 ring-gray-200/80 dark:bg-white/5 dark:text-gray-400 dark:ring-white/10'
    default:
      return 'bg-gray-50 text-gray-600 ring-1 ring-gray-200/80 dark:bg-white/5 dark:text-gray-300 dark:ring-white/10'
  }
}

const progressTone = (status) => {
  switch (status) {
    case 'Paid':
      return 'bg-emerald-500 dark:bg-emerald-400'
    case 'Partial':
      return 'bg-[#3d76c6]'
    case 'Overdue':
      return 'bg-rose-500 dark:bg-rose-400'
    default:
      return 'bg-gray-400 dark:bg-gray-500'
  }
}

const chipRadius = { borderRadius: '0.85rem 0.25rem 0.85rem 0.25rem' }
const cardRadius = { borderRadius: '1.5rem 0.5rem 1.5rem 0.5rem' }

const surface =
  'border border-gray-200/70 bg-white dark:border-white/10 dark:bg-[#0c1528]'

const metaChipClass =
  'inline-flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-600 ring-1 ring-gray-200/80 dark:bg-white/5 dark:text-gray-300 dark:ring-white/10'

const DetailRow = ({ label, value }) => (
  <div className='flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4'>
    <dt className='shrink-0 text-[12px] text-gray-500 dark:text-gray-400'>
      {label}
    </dt>
    <dd className='text-[13px] font-medium text-gray-900 sm:text-right dark:text-gray-100'>
      {value ?? '—'}
    </dd>
  </div>
)

const SectionCard = ({ title, children }) => (
  <section className={`${surface} p-5`} style={cardRadius}>
    <h2 className='mb-4 text-[11px] font-semibold tracking-[0.08em] text-gray-500 uppercase dark:text-gray-400'>
      {title}
    </h2>
    <dl className='flex flex-col gap-3.5'>{children}</dl>
  </section>
)

const StatCard = ({ label, value, valueClassName = '' }) => (
  <div className={`${surface} px-4 py-4`} style={cardRadius}>
    <p className='text-[11px] font-medium tracking-[0.06em] text-gray-500 uppercase dark:text-gray-400'>
      {label}
    </p>
    <p
      className={`mt-1.5 text-[17px] font-semibold tracking-tight text-gray-900 dark:text-white ${valueClassName}`}
    >
      {value}
    </p>
  </div>
)

const PaymentDetails = () => {
  const { id } = useParams()
  const { open } = useModal()
  const [payment, setPayment] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [isActing, setIsActing] = useState(false)

  const loadPayment = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await getPaymentById(id)
      setPayment(data.payment)
    } catch (err) {
      setPayment(null)
      setError(err.message || 'Payment not found')
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadPayment()
  }, [loadPayment])

  const handleEditPayment = () => {
    if (!payment) return
    open({
      title: 'Edit Payment',
      description: `Update notes and schedule for ${payment.student?.name || 'this payment'}.`,
      size: '2xl',
      content: (
        <EditPayment
          payment={payment}
          onSuccess={async (payload) => {
            await updatePayment(payment.id, payload)
            await loadPayment()
          }}
        />
      ),
    })
  }

  const handleResend = async () => {
    if (!payment) return
    setIsActing(true)
    setActionError('')
    setActionMessage('')
    try {
      const data = await resendInvoice(payment.id)
      setPayment(data.payment)
      setActionMessage(
        data.emailSent
          ? 'Invoice email resent to the guardian.'
          : 'No guardian email available.',
      )
    } catch (err) {
      setActionError(err.message || 'Failed to resend invoice.')
    } finally {
      setIsActing(false)
    }
  }

  const handleCancel = async () => {
    if (!payment) return
    if (
      !window.confirm(
        'Cancel this invoice? The Stripe invoice will be voided and the guardian will no longer be able to pay it.',
      )
    ) {
      return
    }

    setIsActing(true)
    setActionError('')
    setActionMessage('')
    try {
      const data = await cancelPayment(payment.id)
      setPayment(data.payment)
      setActionMessage('Invoice cancelled.')
    } catch (err) {
      setActionError(err.message || 'Failed to cancel invoice.')
    } finally {
      setIsActing(false)
    }
  }

  if (isLoading) {
    return (
      <section className='flex flex-1 items-center justify-center gap-2 px-3 py-10 text-[13px] text-gray-500 dark:text-gray-400'>
        <LoaderCircle className='size-4 animate-spin' strokeWidth={1.75} />
        Loading payment…
      </section>
    )
  }

  if (!payment) {
    return (
      <section className='flex flex-1 flex-col items-start gap-4 overflow-y-auto px-3 py-5 sm:px-4'>
        <Link
          to='/payments'
          className='inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-500 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'
        >
          <ArrowLeft className='size-3.5' strokeWidth={1.75} />
          Back to payments
        </Link>
        <div
          className={`w-full ${surface} px-6 py-12 text-center`}
          style={cardRadius}
        >
          <h1 className='text-[15px] font-semibold text-gray-900 dark:text-white'>
            Payment not found
          </h1>
          <p className='mt-1 text-[13px] text-gray-500 dark:text-gray-400'>
            {error || (
              <>
                No payment matches the ID{' '}
                <span className='font-medium text-gray-700 dark:text-gray-300'>
                  {id}
                </span>
                .
              </>
            )}
          </p>
        </div>
      </section>
    )
  }

  const paymentPercent =
    payment.amount > 0
      ? Math.min(100, Math.round((payment.amountPaid / payment.amount) * 100))
      : 0
  const canManage =
    payment.statusKey !== 'paid' && payment.statusKey !== 'cancelled'

  return (
    <section className='flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-3 sm:px-4'>
      <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
        <Link
          to='/payments'
          className='inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-500 transition-colors hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:text-gray-400 dark:hover:text-blue-400'
        >
          <ArrowLeft className='size-3.5' strokeWidth={1.75} />
          Back to payments
        </Link>

        <div className='flex flex-wrap items-center gap-2'>
          {payment.stripeHostedInvoiceUrl ? (
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() =>
                window.open(payment.stripeHostedInvoiceUrl, '_blank', 'noopener')
              }
            >
              <ExternalLink className='size-3.5' strokeWidth={1.75} />
              Stripe invoice
            </Button>
          ) : null}
          {canManage ? (
            <>
              <Button
                type='button'
                variant='outline'
                size='sm'
                disabled={isActing}
                onClick={handleResend}
              >
                <Mail className='size-3.5' strokeWidth={1.75} />
                Resend email
              </Button>
              <Button
                type='button'
                variant='outline'
                size='sm'
                disabled={isActing}
                onClick={handleCancel}
              >
                <Ban className='size-3.5' strokeWidth={1.75} />
                Cancel
              </Button>
            </>
          ) : null}
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={handleEditPayment}
          >
            Edit
          </Button>
        </div>
      </div>

      {(actionError || actionMessage) && (
        <p
          className={`mb-3 text-[13px] ${
            actionError
              ? 'text-rose-600 dark:text-rose-400'
              : 'text-emerald-600 dark:text-emerald-400'
          }`}
        >
          {actionError || actionMessage}
        </p>
      )}

      <div className={`mb-4 ${surface} p-5 sm:p-6`} style={cardRadius}>
        <div className='flex flex-wrap items-center gap-2'>
          <span className='font-mono text-[12px] text-gray-400 dark:text-gray-500'>
            {payment.id}
          </span>
          <span
            className={`inline-flex px-2.5 py-1 text-[11px] font-medium ${statusClass(payment.status)}`}
            style={chipRadius}
          >
            {payment.status}
          </span>
          <span className={metaChipClass} style={chipRadius}>
            {payment.feeType}
          </span>
          <span className={metaChipClass} style={chipRadius}>
            {payment.term} · {payment.academicYear}
          </span>
        </div>

        <h1 className='mt-3 text-[22px] font-semibold tracking-tight text-gray-900 dark:text-white sm:text-[26px]'>
          {payment.title || payment.student?.name}
        </h1>
        <p className='mt-1 text-[13px] text-gray-500 dark:text-gray-400'>
          Student: {payment.student?.name || '—'}
        </p>

        <div className='mt-3 flex flex-wrap gap-2'>
          <span className={metaChipClass} style={chipRadius}>
            <Wallet className='size-3' strokeWidth={2} />
            {formatCurrency(payment.amount, payment.currency)}
          </span>
          <span className={metaChipClass} style={chipRadius}>
            <Calendar className='size-3' strokeWidth={2} />
            Due {formatDate(payment.dueDate)}
          </span>
          {payment.receiptNumber ? (
            <span className={metaChipClass} style={chipRadius}>
              <Receipt className='size-3' strokeWidth={2} />
              {payment.receiptNumber}
            </span>
          ) : null}
        </div>

        {payment.notes ? (
          <p className='mt-4 text-[13px] leading-relaxed text-gray-600 dark:text-gray-300'>
            {payment.notes}
          </p>
        ) : null}
      </div>

      <div className='mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3'>
        <StatCard
          label='Total amount'
          value={formatCurrency(payment.amount, payment.currency)}
        />
        <StatCard
          label='Amount paid'
          value={formatCurrency(payment.amountPaid, payment.currency)}
          valueClassName='text-emerald-600 dark:text-emerald-400'
        />
        <StatCard
          label='Balance'
          value={
            payment.balance > 0
              ? formatCurrency(payment.balance, payment.currency)
              : 'Settled'
          }
          valueClassName={
            payment.balance > 0
              ? 'text-rose-600 dark:text-rose-400'
              : 'text-emerald-600 dark:text-emerald-400'
          }
        />
      </div>

      <div className={`mb-4 ${surface} p-5`} style={cardRadius}>
        <div className='mb-2 flex items-center justify-between gap-3'>
          <h2 className='text-[13px] font-semibold text-gray-900 dark:text-white'>
            Payment progress
          </h2>
          <span className='text-[13px] font-medium text-gray-600 tabular-nums dark:text-gray-300'>
            {paymentPercent}%
          </span>
        </div>
        <div
          className='h-2 overflow-hidden bg-gray-100 dark:bg-white/10'
          style={chipRadius}
          role='progressbar'
          aria-valuenow={paymentPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label='Payment progress'
        >
          <div
            className={`h-full transition-[width] duration-500 ${progressTone(payment.status)}`}
            style={{ width: `${paymentPercent}%`, ...chipRadius }}
          />
        </div>
        <p className='mt-2 text-[11px] text-gray-500 tabular-nums dark:text-gray-400'>
          {formatCurrency(payment.amountPaid, payment.currency)} of{' '}
          {formatCurrency(payment.amount, payment.currency)} paid
        </p>
      </div>

      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        <SectionCard title='Student & guardian'>
          <DetailRow
            label='Student'
            value={
              payment.student?.id ? (
                <Link
                  to={`/students/${payment.student.id}`}
                  className='inline-flex items-center gap-1.5 text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
                >
                  <UserRound className='size-3.5' strokeWidth={1.75} />
                  {payment.student.name}
                </Link>
              ) : (
                payment.student?.name
              )
            }
          />
          <DetailRow label='Student ID' value={payment.student?.id} />
          <DetailRow
            label='Guardian'
            value={
              payment.guardian?.id ? (
                <Link
                  to={`/guardians/${payment.guardian.id}`}
                  className='inline-flex items-center gap-1.5 text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
                >
                  <Users className='size-3.5' strokeWidth={1.75} />
                  {payment.guardian.name}
                </Link>
              ) : (
                payment.guardian?.name
              )
            }
          />
          <DetailRow label='Guardian email' value={payment.guardian?.email} />
        </SectionCard>

        <SectionCard title='Payment details'>
          <DetailRow label='Fee type' value={payment.feeType} />
          <DetailRow label='Term' value={payment.term} />
          <DetailRow label='Academic year' value={payment.academicYear} />
          <DetailRow
            label='Payment method'
            value={
              payment.paymentMethod ? (
                <span className='inline-flex items-center gap-1.5'>
                  <CreditCard className='size-3.5' strokeWidth={1.75} />
                  {payment.paymentMethod}
                </span>
              ) : (
                '—'
              )
            }
          />
          <DetailRow label='Receipt / txn' value={payment.receiptNumber} />
          <DetailRow
            label='Paid on'
            value={payment.paidAt ? formatDate(payment.paidAt) : '—'}
          />
        </SectionCard>

        <SectionCard title='Record details'>
          <DetailRow label='Payment ID' value={payment.id} />
          <DetailRow label='Due date' value={formatDate(payment.dueDate)} />
          <DetailRow label='Created' value={formatDate(payment.createdAt)} />
          <DetailRow label='Updated' value={formatDate(payment.updatedAt)} />
        </SectionCard>
      </div>
    </section>
  )
}

export default PaymentDetails

import React, { useState } from 'react'
import { FileText, Receipt } from 'lucide-react'
import Button from '../../../../../components/Button'
import { checkoutPayment } from '../../../../../lib/payment.requests'

const formatCurrency = (amount) =>
  `USD ${new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(amount || 0)}`

const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  })
}

const statusClass = (status) => {
  switch (status) {
    case 'Paid':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
    case 'Partial':
      return 'bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300'
    case 'Pending':
      return 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300'
    case 'Overdue':
      return 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300'
    case 'Cancelled':
      return 'bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400'
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300'
  }
}

const kindClass = (kind) =>
  kind === 'Payment'
    ? 'bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-300'
    : 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'

const chipRadius = { borderRadius: '0.85rem 0.25rem 0.85rem 0.25rem' }
const cardRadius = { borderRadius: '1.5rem 0.5rem 1.5rem 0.5rem' }
const dateRadius = { borderRadius: '0.95rem 0.3rem 0.95rem 0.3rem' }

const DueBadge = ({ dueDate, status }) => {
  const parsed = dueDate ? new Date(dueDate) : null
  const month = parsed
    ? parsed.toLocaleDateString('en-GB', { month: 'short' })
    : '—'
  const day = parsed ? parsed.getDate() : '–'
  const overdue = status === 'Overdue'

  return (
    <div
      className={`grid size-11 shrink-0 place-items-center text-center shadow-[var(--shadow-soft)] sm:size-12 ${
        overdue
          ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
          : 'bg-blue-50 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300'
      }`}
      style={dateRadius}
    >
      <div>
        <p className='text-[9px] font-semibold tracking-[0.06em] uppercase opacity-70'>
          {month}
        </p>
        <p className='text-base font-semibold leading-none tabular-nums sm:text-lg'>
          {day}
        </p>
      </div>
    </div>
  )
}

const PaymentItem = ({ payment, view = 'grid', canPay = false, onPaid }) => {
  const [isPaying, setIsPaying] = useState(false)
  const [payError, setPayError] = useState('')

  const isInvoice = payment.kind === 'Invoice'
  const isPayable =
    canPay &&
    isInvoice &&
    payment.balance > 0 &&
    payment.statusKey !== 'cancelled' &&
    payment.statusKey !== 'paid'

  const KindIcon = payment.kind === 'Payment' ? Receipt : FileText
  const title =
    payment.title ||
    `${payment.feeType}${payment.term ? ` · ${payment.term}` : ''}`
  const amountLabel =
    payment.balance > 0
      ? formatCurrency(payment.balance)
      : formatCurrency(payment.amount)
  const amountCaption = payment.balance > 0 ? 'Balance' : 'Amount'

  const handlePay = async () => {
    setPayError('')
    setIsPaying(true)
    try {
      const data = await checkoutPayment(payment.id)
      if (data.url) {
        window.location.assign(data.url)
        return
      }
      setPayError('Payment link unavailable.')
      onPaid?.()
    } catch (err) {
      setPayError(err.message || 'Could not start payment.')
    } finally {
      setIsPaying(false)
    }
  }

  const payButton = isPayable ? (
    <Button
      type='button'
      variant='primary'
      size='sm'
      className='shrink-0'
      disabled={isPaying}
      onClick={handlePay}
    >
      {isPaying ? 'Opening…' : 'Pay invoice'}
    </Button>
  ) : null

  if (view === 'list') {
    return (
      <article
        className='flex flex-col gap-3 bg-white p-3 shadow-[var(--shadow-soft)] transition-shadow duration-200 hover:shadow-[var(--shadow-lift)] dark:bg-[#152238] sm:flex-row sm:items-center sm:gap-4 sm:px-4'
        style={cardRadius}
      >
        <DueBadge dueDate={payment.dueDate} status={payment.status} />

        <div className='min-w-0 flex-1'>
          <div className='flex flex-wrap items-center gap-1.5'>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium ${kindClass(payment.kind)}`}
              style={chipRadius}
            >
              <KindIcon className='size-3' strokeWidth={1.75} />
              {payment.kind}
            </span>
            <span
              className={`inline-flex px-2 py-0.5 text-[10px] font-medium ${statusClass(payment.status)}`}
              style={chipRadius}
            >
              {payment.status}
            </span>
          </div>
          <h2 className='mt-1.5 truncate text-[13px] font-semibold text-gray-900 dark:text-white'>
            {title}
          </h2>
          <p className='mt-0.5 truncate text-[12px] text-gray-500 dark:text-gray-400'>
            {payment.student?.name}
            <span className='mx-1.5 text-gray-300 dark:text-gray-600'>·</span>
            {payment.feeType}
            <span className='mx-1.5 text-gray-300 dark:text-gray-600'>·</span>
            Due {formatDate(payment.dueDate)}
          </p>
          {payError ? (
            <p className='mt-1 text-[11px] text-rose-600 dark:text-rose-400'>
              {payError}
            </p>
          ) : null}
        </div>

        <div className='shrink-0 text-left sm:text-right'>
          <p className='text-[10px] font-medium tracking-[0.06em] text-gray-400 uppercase dark:text-gray-500'>
            {amountCaption}
          </p>
          <p
            className={`text-[13px] font-semibold tabular-nums ${
              payment.balance > 0
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-gray-900 dark:text-white'
            }`}
          >
            {amountLabel}
          </p>
        </div>

        {payButton}
      </article>
    )
  }

  return (
    <article
      className='flex h-full flex-col bg-white p-4 shadow-[var(--shadow-soft)] transition-shadow duration-200 hover:shadow-[var(--shadow-lift)] dark:bg-[#152238]'
      style={cardRadius}
    >
      <div className='flex items-start gap-3'>
        <DueBadge dueDate={payment.dueDate} status={payment.status} />

        <div className='min-w-0 flex-1'>
          <div className='flex flex-wrap items-center gap-1.5'>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium ${kindClass(payment.kind)}`}
              style={chipRadius}
            >
              <KindIcon className='size-3' strokeWidth={1.75} />
              {payment.kind}
            </span>
            <span
              className={`inline-flex px-2 py-0.5 text-[10px] font-medium ${statusClass(payment.status)}`}
              style={chipRadius}
            >
              {payment.status}
            </span>
          </div>
          <h2 className='mt-1.5 line-clamp-1 text-[14px] font-semibold tracking-tight text-gray-900 dark:text-white'>
            {title}
          </h2>
          <p className='mt-1 text-[12px] text-gray-500 dark:text-gray-400'>
            {payment.student?.name}
            <span className='mx-1.5 text-gray-300 dark:text-gray-600'>·</span>
            {payment.feeType}
          </p>
        </div>
      </div>

      <div className='mt-4 flex items-end justify-between gap-3'>
        <div>
          <p className='text-[10px] font-medium tracking-[0.06em] text-gray-400 uppercase dark:text-gray-500'>
            {amountCaption}
          </p>
          <p
            className={`mt-0.5 text-[16px] font-semibold tabular-nums ${
              payment.balance > 0
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-gray-900 dark:text-white'
            }`}
          >
            {amountLabel}
          </p>
        </div>

        <div className='text-right'>
          <p className='text-[10px] font-medium tracking-[0.06em] text-gray-400 uppercase dark:text-gray-500'>
            {payment.kind === 'Payment' ? 'Paid' : 'Due'}
          </p>
          <p className='mt-0.5 text-[12px] font-medium text-gray-700 dark:text-gray-300'>
            {formatDate(
              payment.kind === 'Payment' && payment.paidAt
                ? payment.paidAt
                : payment.dueDate,
            )}
          </p>
        </div>
      </div>

      <div className='mt-auto flex items-center justify-between gap-3 border-t border-gray-100 pt-3 dark:border-white/8'>
        <p className='min-w-0 truncate text-[11px] text-gray-400 dark:text-gray-500'>
          {payError
            ? payError
            : payment.receiptNumber
              ? `Receipt ${payment.receiptNumber}`
              : payment.id}
        </p>
        {payButton}
      </div>
    </article>
  )
}

export default PaymentItem

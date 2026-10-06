import React from 'react'
import Button from '../../../components/Button'

const formatCurrency = (amount) =>
  `USD ${new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(amount || 0)}`

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  })

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
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300'
  }
}

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

const PaymentItem = ({ payment, view = 'grid' }) => {
  const studentName = payment.student?.name || 'Student'
  const dueDate = payment.dueDate || payment.createdAt

  if (view === 'list') {
    return (
      <article
        className='flex flex-col gap-3 bg-white p-3 shadow-[var(--shadow-soft)] transition-shadow duration-200 hover:shadow-[var(--shadow-lift)] dark:bg-[#152238] sm:flex-row sm:items-center sm:gap-4 sm:px-4'
        style={cardRadius}
      >
        <DueBadge dueDate={dueDate} status={payment.status} />

        <div className='min-w-0 flex-1'>
          <h2 className='truncate text-[13px] font-semibold text-gray-900 dark:text-white'>
            {studentName}
          </h2>
          <p className='mt-0.5 truncate text-[12px] text-gray-500 dark:text-gray-400'>
            {payment.title || payment.feeType}
            <span className='mx-1.5 text-gray-300 dark:text-gray-600'>·</span>
            Due {formatDate(dueDate)}
          </p>
        </div>

        <p className='shrink-0 text-[13px] font-semibold text-gray-900 tabular-nums dark:text-white'>
          {formatCurrency(payment.amount)}
        </p>

        <span
          className={`inline-flex shrink-0 px-2.5 py-1 text-[11px] font-medium ${statusClass(payment.status)}`}
          style={chipRadius}
        >
          {payment.status}
        </span>

        <Button
          to={`/payments/${payment.id}`}
          variant='secondary'
          size='sm'
          className='shrink-0'
        >
          View
        </Button>
      </article>
    )
  }

  return (
    <article
      className='flex h-full flex-col bg-white p-4 shadow-[var(--shadow-soft)] transition-shadow duration-200 hover:shadow-[var(--shadow-lift)] dark:bg-[#152238]'
      style={cardRadius}
    >
      <div className='flex items-start gap-3'>
        <DueBadge dueDate={dueDate} status={payment.status} />

        <div className='min-w-0 flex-1'>
          <h2 className='line-clamp-1 text-[14px] font-semibold tracking-tight text-gray-900 dark:text-white'>
            {studentName}
          </h2>
          <p className='mt-1 text-[12px] text-gray-500 dark:text-gray-400'>
            {payment.title || payment.feeType}
            <span className='mx-1.5 text-gray-300 dark:text-gray-600'>·</span>
            Due {formatDate(dueDate)}
          </p>
        </div>

        <span
          className={`shrink-0 px-2.5 py-1 text-[11px] font-medium ${statusClass(payment.status)}`}
          style={chipRadius}
        >
          {payment.status}
        </span>
      </div>

      <div className='mt-4 flex items-end justify-between gap-3'>
        <div>
          <p className='text-[10px] font-medium tracking-[0.06em] text-gray-400 uppercase dark:text-gray-500'>
            {payment.balance > 0 ? 'Balance' : 'Amount'}
          </p>
          <p
            className={`mt-0.5 text-[16px] font-semibold tabular-nums ${
              payment.balance > 0
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-gray-900 dark:text-white'
            }`}
          >
            {payment.balance > 0
              ? formatCurrency(payment.balance)
              : formatCurrency(payment.amount)}
          </p>
        </div>

        <Button
          to={`/payments/${payment.id}`}
          variant='secondary'
          size='sm'
          className='shrink-0'
        >
          View
        </Button>
      </div>
    </article>
  )
}

export default PaymentItem

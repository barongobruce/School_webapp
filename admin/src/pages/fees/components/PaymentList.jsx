import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  Banknote,
  CheckCircle2,
  LayoutGrid,
  List,
  LoaderCircle,
  SearchX,
  Wallet,
} from 'lucide-react'
import { getPayments } from '../../../lib/payment.requests'
import PaymentItem from './PaymentItem'

const viewToggleBtn =
  'grid size-8 place-items-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500'

const cardRadius = { borderRadius: '1.5rem 0.5rem 1.5rem 0.5rem' }

const formatCurrency = (amount) =>
  `USD ${new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(amount || 0)}`

const StatCard = ({ label, value, icon: Icon, tone }) => {
  const tones = {
    slate:
      'bg-white text-gray-700 shadow-[var(--shadow-soft)] dark:bg-[#152238] dark:text-gray-200',
    amber:
      'bg-amber-50/80 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
    rose: 'bg-rose-50/80 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
    emerald:
      'bg-emerald-50/80 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
    blue: 'bg-blue-50/80 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',
  }

  return (
    <div className={`px-4 py-3.5 ${tones[tone]}`} style={cardRadius}>
      <div className='flex items-center justify-between gap-2'>
        <p className='text-[11px] font-medium tracking-[0.06em] uppercase opacity-80'>
          {label}
        </p>
        <Icon className='size-3.5 shrink-0 opacity-70' strokeWidth={1.75} />
      </div>
      <p className='mt-1.5 text-[20px] font-semibold tracking-tight tabular-nums sm:text-2xl'>
        {value}
      </p>
    </div>
  )
}

const PaymentList = ({
  query = '',
  statusFilter = 'All',
  feeTypeFilter = 'All',
  refreshKey = 0,
}) => {
  const [view, setView] = useState('grid')
  const [payments, setPayments] = useState([])
  const [stats, setStats] = useState({
    totalCollected: 0,
    outstanding: 0,
    overdueCount: 0,
    paidCount: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadPayments = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await getPayments({
        search: query,
        status: statusFilter,
        feeType: feeTypeFilter,
      })
      setPayments(data.payments || [])
      setStats(
        data.stats || {
          totalCollected: 0,
          outstanding: 0,
          overdueCount: 0,
          paidCount: 0,
        },
      )
    } catch (err) {
      setError(err.message || 'Failed to load payments.')
      setPayments([])
    } finally {
      setIsLoading(false)
    }
  }, [query, statusFilter, feeTypeFilter])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPayments()
    }, query ? 250 : 0)
    return () => clearTimeout(timer)
  }, [loadPayments, refreshKey, query])

  const filtered = useMemo(() => payments, [payments])

  return (
    <section className='px-3 pb-4 sm:px-4'>
      <div className='mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4'>
        <StatCard
          label='Total collected'
          value={formatCurrency(stats.totalCollected)}
          icon={Banknote}
          tone='slate'
        />
        <StatCard
          label='Outstanding'
          value={formatCurrency(stats.outstanding)}
          icon={Wallet}
          tone='amber'
        />
        <StatCard
          label='Overdue'
          value={stats.overdueCount}
          icon={AlertCircle}
          tone='rose'
        />
        <StatCard
          label='Paid in full'
          value={stats.paidCount}
          icon={CheckCircle2}
          tone='emerald'
        />
      </div>

      <div className='mb-4 flex items-center justify-between gap-3'>
        <p className='text-[13px] text-gray-500 dark:text-gray-400'>
          Showing{' '}
          <span className='font-semibold text-gray-800 dark:text-gray-200'>
            {filtered.length}
          </span>{' '}
          {filtered.length === 1 ? 'payment' : 'payments'}
          {query ? (
            <span className='text-gray-400 dark:text-gray-500'>
              {' '}
              for “{query}”
            </span>
          ) : null}
          {statusFilter !== 'All' && (
            <span className='text-gray-400 dark:text-gray-500'>
              {' '}
              · {statusFilter}
            </span>
          )}
          {feeTypeFilter !== 'All' && (
            <span className='text-gray-400 dark:text-gray-500'>
              {' '}
              · {feeTypeFilter}
            </span>
          )}
        </p>

        <div
          className='flex items-center gap-0.5 bg-gray-100 p-0.5 shadow-[var(--shadow-soft)] dark:bg-[#152238]'
          style={{ borderRadius: '0.95rem 0.3rem 0.95rem 0.3rem' }}
          role='group'
          aria-label='Change payment list layout'
        >
          <button
            type='button'
            aria-label='Grid view'
            aria-pressed={view === 'grid'}
            onClick={() => setView('grid')}
            className={`${viewToggleBtn} ${
              view === 'grid'
                ? 'brand-gradient text-white shadow-[var(--shadow-brand)]'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200'
            }`}
            style={{ borderRadius: '0.8rem 0.25rem 0.8rem 0.25rem' }}
          >
            <LayoutGrid className='size-3.5' strokeWidth={1.75} />
          </button>
          <button
            type='button'
            aria-label='List view'
            aria-pressed={view === 'list'}
            onClick={() => setView('list')}
            className={`${viewToggleBtn} ${
              view === 'list'
                ? 'brand-gradient text-white shadow-[var(--shadow-brand)]'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200'
            }`}
            style={{ borderRadius: '0.8rem 0.25rem 0.8rem 0.25rem' }}
          >
            <List className='size-3.5' strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div
          className='flex items-center justify-center gap-2 bg-white px-6 py-14 text-[13px] text-gray-500 shadow-[var(--shadow-soft)] dark:bg-[#152238] dark:text-gray-400'
          style={cardRadius}
        >
          <LoaderCircle className='size-4 animate-spin' strokeWidth={1.75} />
          Loading payments…
        </div>
      ) : error ? (
        <div
          className='bg-white px-6 py-14 text-center shadow-[var(--shadow-soft)] dark:bg-[#152238]'
          style={cardRadius}
        >
          <AlertCircle
            className='mx-auto size-8 text-rose-400'
            strokeWidth={1.5}
          />
          <h2 className='mt-3 text-[13px] font-semibold text-gray-900 dark:text-white'>
            Couldn’t load payments
          </h2>
          <p className='mt-1 text-[13px] text-gray-500 dark:text-gray-400'>
            {error}
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div
          className='bg-white px-6 py-14 text-center shadow-[var(--shadow-soft)] dark:bg-[#152238]'
          style={cardRadius}
        >
          <SearchX
            className='mx-auto size-8 text-gray-300 dark:text-gray-600'
            strokeWidth={1.5}
          />
          <h2 className='mt-3 text-[13px] font-semibold text-gray-900 dark:text-white'>
            No payments found
          </h2>
          <p className='mt-1 text-[13px] text-gray-500 dark:text-gray-400'>
            Create an invoice or try a different search, status, or fee type.
          </p>
        </div>
      ) : (
        <ul
          className={
            view === 'grid'
              ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'
              : 'flex flex-col gap-2'
          }
        >
          {filtered.map((payment) => (
            <li key={payment.id}>
              <PaymentItem payment={payment} view={view} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default PaymentList

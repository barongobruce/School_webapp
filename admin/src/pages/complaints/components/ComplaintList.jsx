import React, { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  LayoutGrid,
  List,
  SearchX,
} from 'lucide-react'
import { getComplaints } from '../../../lib/complaint.requests'
import ComplaintItem from './ComplaintItem'
import ComplaintsSkeleton from './ComplaintsSkeleton'

const viewToggleBtn =
  'grid size-8 place-items-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500'

const cardRadius = { borderRadius: '1.5rem 0.5rem 1.5rem 0.5rem' }

const StatCard = ({ label, value, icon: Icon, tone }) => {
  const tones = {
    rose: 'bg-rose-50/80 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
    amber:
      'bg-amber-50/80 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
    emerald:
      'bg-emerald-50/80 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
    slate:
      'bg-white text-gray-700 shadow-[var(--shadow-soft)] dark:bg-[#152238] dark:text-gray-200',
  }

  return (
    <div className={`px-4 py-3.5 ${tones[tone]}`} style={cardRadius}>
      <div className='flex items-center justify-between gap-2'>
        <p className='text-[11px] font-medium tracking-[0.06em] uppercase opacity-80'>
          {label}
        </p>
        <Icon className='size-3.5 shrink-0 opacity-70' strokeWidth={1.75} />
      </div>
      <p className='mt-1.5 text-2xl font-semibold tabular-nums tracking-tight'>
        {value}
      </p>
    </div>
  )
}

const matchesQuery = (complaint, query) => {
  const q = query.trim().toLowerCase()
  if (!q) return true

  const haystack = [
    complaint.id,
    complaint.title,
    complaint.category,
    complaint.priority,
    complaint.status,
    complaint.reporter?.name,
    complaint.reportedParty?.name || complaint.reportedParty,
    complaint.description,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return haystack.includes(q)
}

const ComplaintList = ({
  search = '',
  statusFilter = 'All',
  urgencyFilter = 'All',
}) => {
  const [view, setView] = useState('grid')
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadComplaints = async () => {
      setLoading(true)
      setError('')

      try {
        const data = await getComplaints()
        if (!cancelled) setComplaints(data.complaints || [])
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load complaints.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadComplaints()

    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    return complaints.filter((complaint) => {
      const statusOk =
        statusFilter === 'All' ? true : complaint.status === statusFilter
      const urgencyOk =
        urgencyFilter === 'All' ? true : complaint.priority === urgencyFilter
      return statusOk && urgencyOk && matchesQuery(complaint, search)
    })
  }, [complaints, search, statusFilter, urgencyFilter])

  const stats = useMemo(() => {
    const open = complaints.filter((r) => r.status === 'Open').length
    const underReview = complaints.filter(
      (r) => r.status === 'Under Review',
    ).length
    const urgent = complaints.filter(
      (r) =>
        r.priority === 'High' &&
        (r.status === 'Open' || r.status === 'Under Review'),
    ).length
    const resolved = complaints.filter((r) => r.status === 'Resolved').length

    return { open, underReview, urgent, resolved }
  }, [complaints])

  if (loading) {
    return <ComplaintsSkeleton />
  }

  if (error) {
    return (
      <section className='px-3 pb-4 sm:px-4'>
        <div
          className='bg-red-50 px-4 py-3 text-[13px] text-red-700 shadow-[var(--shadow-soft)] dark:bg-red-500/15 dark:text-red-300'
          style={{ borderRadius: '1.25rem 0.4rem 1.25rem 0.4rem' }}
        >
          {error}
        </div>
      </section>
    )
  }

  return (
    <section className='px-3 pb-4 sm:px-4'>
      <div className='mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4'>
        <StatCard
          label='Open'
          value={stats.open}
          icon={ClipboardList}
          tone='slate'
        />
        <StatCard
          label='Under review'
          value={stats.underReview}
          icon={SearchX}
          tone='amber'
        />
        <StatCard
          label='Urgent active'
          value={stats.urgent}
          icon={AlertTriangle}
          tone='rose'
        />
        <StatCard
          label='Resolved'
          value={stats.resolved}
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
          {filtered.length === 1 ? 'complaint' : 'complaints'}
          {search ? (
            <span className='text-gray-400 dark:text-gray-500'>
              {' '}
              for “{search}”
            </span>
          ) : null}
          {statusFilter !== 'All' && (
            <span className='text-gray-400 dark:text-gray-500'>
              {' '}
              · {statusFilter}
            </span>
          )}
          {urgencyFilter !== 'All' && (
            <span className='text-gray-400 dark:text-gray-500'>
              {' '}
              · {urgencyFilter}
            </span>
          )}
        </p>

        <div
          className='flex items-center gap-0.5 bg-gray-100 p-0.5 shadow-[var(--shadow-soft)] dark:bg-[#152238]'
          style={{ borderRadius: '0.95rem 0.3rem 0.95rem 0.3rem' }}
          role='group'
          aria-label='Change complaint list layout'
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

      {filtered.length === 0 ? (
        <div
          className='bg-white px-6 py-12 text-center shadow-[var(--shadow-soft)] dark:bg-[#152238]'
          style={{ borderRadius: '1.6rem 0.55rem 1.6rem 0.55rem' }}
        >
          <p className='text-[13px] font-semibold text-gray-900 dark:text-gray-100'>
            {search || statusFilter !== 'All' || urgencyFilter !== 'All'
              ? 'No matching complaints'
              : 'No complaints yet'}
          </p>
          <p className='mt-1 text-[13px] text-gray-500 dark:text-gray-400'>
            Try a different search, status, or urgency filter.
          </p>
        </div>
      ) : (
        <ul
          className={
            view === 'grid'
              ? 'grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3'
              : 'flex flex-col gap-2'
          }
        >
          {filtered.map((complaint) => (
            <li key={complaint.id}>
              <ComplaintItem complaint={complaint} view={view} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default ComplaintList

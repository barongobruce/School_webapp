import React from 'react'
import { ArrowRight, Calendar, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../../../components/Button'

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

const statusClass = (status) => {
  switch (status) {
    case 'Open':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300'
    case 'Under Review':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
    case 'Resolved':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
    case 'Closed':
      return 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300'
    case 'Dismissed':
      return 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300'
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300'
  }
}

const priorityClass = (priority) => {
  switch (priority) {
    case 'Critical':
      return 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300'
    case 'High':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300'
    case 'Medium':
      return 'bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300'
    case 'Low':
      return 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300'
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300'
  }
}

const rolePath = (role, id) => {
  if (role === 'student') return `/students/${id}`
  if (role === 'teacher') return `/teachers/${id}`
  if (role === 'guardian') return `/guardians/${id}`
  return null
}

const roleLabel = (role) =>
  role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Unknown'

const chipRadius = { borderRadius: '0.85rem 0.25rem 0.85rem 0.25rem' }
const cardRadius = { borderRadius: '1.5rem 0.5rem 1.5rem 0.5rem' }

const PartyChip = ({ party, tone = 'neutral' }) => {
  if (!party) return null

  const path = rolePath(party.role, party.id)
  const tones = {
    reporter:
      'border border-violet-100 bg-violet-50/80 text-violet-800 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-200',
    reported:
      'border border-rose-100 bg-rose-50/80 text-rose-800 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200',
    neutral:
      'border border-gray-200 bg-gray-50 text-gray-700 dark:border-white/10 dark:bg-white/8 dark:text-gray-200',
  }

  const showRole = party.role && party.role !== 'unknown'

  const content = (
    <>
      <span className='truncate font-medium'>{party.name}</span>
      {showRole ? (
        <span className='shrink-0 text-[10px] font-semibold tracking-wide uppercase opacity-70'>
          {roleLabel(party.role)}
        </span>
      ) : null}
    </>
  )

  const className = `inline-flex max-w-full items-center gap-1.5 py-1 pr-2.5 pl-2.5 text-[11px] ${tones[tone]}`

  if (path) {
    return (
      <Link
        to={path}
        title={party.name}
        className={`${className} transition-colors hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:hover:brightness-110`}
        style={chipRadius}
      >
        {content}
      </Link>
    )
  }

  return (
    <span className={className} style={chipRadius}>
      {content}
    </span>
  )
}

const ComplaintItem = ({ complaint, view = 'grid' }) => {
  if (view === 'list') {
    return (
      <article
        className='flex flex-col gap-3 bg-white p-3 shadow-[var(--shadow-soft)] transition-shadow duration-200 hover:shadow-[var(--shadow-lift)] dark:bg-[#152238] sm:flex-row sm:items-center sm:gap-4 sm:px-4'
        style={cardRadius}
      >
        <div className='min-w-0 flex-1'>
          <h2 className='truncate text-[13px] font-semibold text-gray-900 dark:text-white'>
            {complaint.title}
          </h2>

          <div className='mt-2 flex flex-wrap items-center gap-1.5'>
            <PartyChip party={complaint.reporter} tone='reporter' />
            <ArrowRight
              className='size-3.5 shrink-0 text-gray-300 dark:text-gray-600'
              strokeWidth={2}
              aria-hidden='true'
            />
            <PartyChip party={complaint.reportedParty} tone='reported' />
          </div>

          <p className='mt-1.5 truncate text-[12px] text-gray-500 dark:text-gray-400'>
            {complaint.category}
            {complaint.incidentDate ? (
              <>
                <span className='mx-1.5 text-gray-300 dark:text-gray-600'>
                  ·
                </span>
                {formatDate(complaint.incidentDate)}
              </>
            ) : null}
          </p>
        </div>

        <div className='flex flex-wrap items-center gap-2 sm:flex-nowrap'>
          <span
            className={`inline-flex px-2.5 py-1 text-[11px] font-medium ${priorityClass(complaint.priority)}`}
            style={chipRadius}
          >
            {complaint.priority}
          </span>
          <span
            className={`inline-flex px-2.5 py-1 text-[11px] font-medium ${statusClass(complaint.status)}`}
            style={chipRadius}
          >
            {complaint.status}
          </span>
          <Button
            to={`/complaints/${complaint.id}`}
            variant='secondary'
            size='sm'
          >
            View
          </Button>
        </div>
      </article>
    )
  }

  return (
    <article
      className='flex h-full flex-col bg-white p-4 shadow-[var(--shadow-soft)] transition-shadow duration-200 hover:shadow-[var(--shadow-lift)] dark:bg-[#152238]'
      style={cardRadius}
    >
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0 flex-1'>
          <h2 className='line-clamp-2 text-[14px] font-semibold tracking-tight text-gray-900 dark:text-white'>
            {complaint.title}
          </h2>
        </div>
        <span
          className={`shrink-0 px-2.5 py-1 text-[11px] font-medium ${statusClass(complaint.status)}`}
          style={chipRadius}
        >
          {complaint.status}
        </span>
      </div>

      <div className='mt-3 flex flex-wrap gap-1.5'>
        <span
          className={`inline-flex px-2.5 py-1 text-[11px] font-medium ${priorityClass(complaint.priority)}`}
          style={chipRadius}
        >
          {complaint.priority}
        </span>
        <span
          className='inline-flex bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-700 dark:bg-white/10 dark:text-gray-200'
          style={chipRadius}
        >
          {complaint.category}
        </span>
      </div>

      <div
        className='mt-3 border border-dashed border-rose-200/80 bg-rose-50/40 p-3 dark:border-rose-500/20 dark:bg-rose-500/10'
        style={{ borderRadius: '1.1rem 0.35rem 1.1rem 0.35rem' }}
      >
        <p className='mb-2 text-[11px] font-medium tracking-[0.06em] text-gray-500 uppercase dark:text-gray-400'>
          Parties
        </p>
        <div className='flex flex-wrap items-center gap-1.5'>
          <PartyChip party={complaint.reporter} tone='reporter' />
          <ArrowRight
            className='size-3.5 shrink-0 text-gray-300 dark:text-gray-600'
            strokeWidth={2}
            aria-hidden='true'
          />
          <PartyChip party={complaint.reportedParty} tone='reported' />
        </div>
      </div>

      <div className='mt-3 flex flex-wrap gap-2 text-[12px] text-gray-500 dark:text-gray-400'>
        {complaint.incidentDate ? (
          <span className='inline-flex items-center gap-1'>
            <Calendar className='size-3' strokeWidth={2} />
            {formatDate(complaint.incidentDate)}
          </span>
        ) : null}
        {complaint.incidentLocation && complaint.incidentLocation !== '—' ? (
          <span className='inline-flex min-w-0 items-center gap-1'>
            <MapPin className='size-3 shrink-0' strokeWidth={2} />
            <span className='truncate'>{complaint.incidentLocation}</span>
          </span>
        ) : null}
      </div>

      <div className='mt-auto flex items-center justify-end gap-3 pt-4'>
        <Button
          to={`/complaints/${complaint.id}`}
          variant='secondary'
          size='sm'
        >
          View Case
        </Button>
      </div>
    </article>
  )
}

export default ComplaintItem

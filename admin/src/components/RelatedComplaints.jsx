import React from 'react'
import { FileText, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

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

const involvementClass = (involvement) => {
  switch (involvement) {
    case 'Filed':
      return 'bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-300'
    case 'Against':
      return 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300'
    case 'Related':
      return 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300'
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300'
  }
}

const cardRadius = { borderRadius: '1.5rem 0.5rem 1.5rem 0.5rem' }
const itemRadius = { borderRadius: '1.2rem 0.4rem 1.2rem 0.4rem' }
const chipRadius = { borderRadius: '0.85rem 0.25rem 0.85rem 0.25rem' }
const iconRadius = { borderRadius: '0.95rem 0.3rem 0.95rem 0.3rem' }

const RelatedComplaints = ({ complaints = [], personLabel = 'record' }) => {
  const count = complaints.length

  return (
    <div
      className='mt-3 border border-rose-200/60 bg-rose-50/40 p-5 dark:border-rose-500/20 dark:bg-rose-500/8'
      style={cardRadius}
    >
      <div className='mb-4 flex items-center justify-between gap-3'>
        <h2 className='text-[11px] font-semibold tracking-[0.08em] text-gray-500 uppercase dark:text-gray-400'>
          Complaints
        </h2>
        <span
          className='bg-rose-100 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700 dark:bg-rose-500/25 dark:text-rose-300'
          style={chipRadius}
        >
          {count}
        </span>
      </div>

      {count === 0 ? (
        <p className='text-[13px] text-gray-500 dark:text-gray-400'>
          No complaints linked to this {personLabel}.
        </p>
      ) : (
        <ul className='flex flex-col gap-2'>
          {complaints.map((complaint) => (
            <li key={complaint.id}>
              <Link
                to={`/complaints/${complaint.id}`}
                className='flex flex-col gap-2 border border-gray-200/70 bg-white p-3.5 transition-colors hover:border-rose-200 hover:bg-rose-50/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:border-white/10 dark:bg-[#0c1528] dark:hover:border-rose-500/30 dark:hover:bg-rose-500/10 sm:flex-row sm:items-center sm:gap-4'
                style={itemRadius}
              >
                <div
                  className='grid size-10 shrink-0 place-items-center bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300'
                  style={iconRadius}
                >
                  <FileText className='size-4' strokeWidth={1.75} />
                </div>

                <div className='min-w-0 flex-1'>
                  <div className='flex flex-wrap items-center gap-x-2 gap-y-1'>
                    <p className='truncate text-[13px] font-semibold text-gray-900 dark:text-white'>
                      {complaint.title}
                    </p>
                    <span className='font-mono text-[11px] text-gray-400 dark:text-gray-500'>
                      {complaint.id}
                    </span>
                  </div>
                  <p className='mt-1 line-clamp-2 text-[12px] text-gray-500 dark:text-gray-400'>
                    {complaint.summary}
                  </p>
                  <div className='mt-2 flex flex-wrap gap-1.5'>
                    <span
                      className={`inline-flex px-2 py-0.5 text-[11px] font-medium ${involvementClass(complaint.involvement)}`}
                      style={chipRadius}
                    >
                      {complaint.involvement}
                    </span>
                    <span
                      className={`inline-flex px-2 py-0.5 text-[11px] font-medium ${priorityClass(complaint.priority)}`}
                      style={chipRadius}
                    >
                      {complaint.priority}
                    </span>
                    <span
                      className={`inline-flex px-2 py-0.5 text-[11px] font-medium ${statusClass(complaint.status)}`}
                      style={chipRadius}
                    >
                      {complaint.status}
                    </span>
                    <span
                      className='inline-flex bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700 dark:bg-white/10 dark:text-gray-300'
                      style={chipRadius}
                    >
                      {complaint.category}
                    </span>
                    <span
                      className='inline-flex bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500 dark:bg-white/10 dark:text-gray-400'
                      style={chipRadius}
                    >
                      {formatDate(complaint.createdAt)}
                    </span>
                  </div>
                </div>

                <ArrowRight
                  className='hidden size-4 shrink-0 text-gray-300 sm:block dark:text-gray-600'
                  strokeWidth={1.75}
                  aria-hidden='true'
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default RelatedComplaints

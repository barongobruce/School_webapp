import React from 'react'
import { Calendar, GraduationCap } from 'lucide-react'
import Button from '../../../../../components/Button'

const cardRadius = { borderRadius: '1.5rem 0.5rem 1.5rem 0.5rem' }
const avatarRadius = { borderRadius: '0.95rem 0.3rem 0.95rem 0.3rem' }
const chipRadius = { borderRadius: '0.85rem 0.25rem 0.85rem 0.25rem' }

const subjectTone = (subject) => {
  switch (subject) {
    case 'Mathematics':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300'
    case 'Science':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
    case 'English':
      return 'bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-300'
    case 'History':
      return 'bg-yellow-100 text-yellow-900 dark:bg-yellow-500/20 dark:text-yellow-300'
    case 'Geography':
      return 'bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300'
    case 'French':
      return 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300'
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300'
  }
}

const formatDate = (iso) => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

const isOverdue = (iso) => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return false
  const endOfDueDay = new Date(date)
  endOfDueDay.setHours(23, 59, 59, 999)
  return endOfDueDay.getTime() < Date.now()
}

const SubjectMark = ({ subject, className = 'size-11' }) => {
  const initial = subject?.[0]?.toUpperCase() || '?'

  return (
    <div
      className={`${className} grid shrink-0 place-items-center shadow-[var(--shadow-soft)] ${subjectTone(subject)}`}
      style={avatarRadius}
      aria-hidden='true'
    >
      <span className='text-[13px] font-semibold'>{initial}</span>
    </div>
  )
}

const HomeworkItem = ({ homework, view = 'grid' }) => {
  const homeworkId = homework._id || homework.id
  const detailsPath = `/dashboard/homeworks/${homeworkId}`
  const subjectLabel = homework.courseName || homework.subject || 'Course'
  const overdue = isOverdue(homework.dueDate)

  if (view === 'list') {
    return (
      <article
        className='flex items-center gap-3 bg-white p-3 shadow-[var(--shadow-soft)] transition-shadow duration-200 hover:shadow-[var(--shadow-lift)] dark:bg-[#152238] sm:gap-4 sm:px-4'
        style={cardRadius}
      >
        <SubjectMark subject={subjectLabel} className='size-10 sm:size-11' />

        <div className='min-w-0 flex-1'>
          <div className='flex flex-wrap items-center gap-x-2 gap-y-0.5'>
            <h2 className='truncate text-[13px] font-semibold text-gray-900 dark:text-white'>
              {homework.title}
            </h2>
            <span className='truncate text-[11px] text-gray-400 dark:text-gray-500'>
              {subjectLabel}
            </span>
          </div>
          <p className='mt-0.5 truncate text-[12px] text-gray-500 dark:text-gray-400'>
            {homework.className}
            <span className='mx-1.5 text-gray-300 dark:text-gray-600'>·</span>
            Due {formatDate(homework.dueDate)}
            {overdue ? (
              <span className='ml-1.5 text-red-500 dark:text-red-400'>
                · Overdue
              </span>
            ) : null}
          </p>
        </div>

        <Button to={detailsPath} variant='secondary' size='sm'>
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
        <SubjectMark subject={subjectLabel} />

        <div className='min-w-0 flex-1'>
          <h2 className='truncate text-[14px] font-semibold tracking-tight text-gray-900 dark:text-white'>
            {homework.title}
          </h2>
          <p className='mt-0.5 truncate text-[12px] text-gray-500 dark:text-gray-400'>
            {subjectLabel}
          </p>
        </div>
      </div>

      <div className='mt-3 flex flex-wrap gap-1.5'>
        <span
          className='inline-flex items-center gap-1 bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-700 dark:bg-white/10 dark:text-gray-200'
          style={chipRadius}
        >
          <GraduationCap className='size-3' strokeWidth={2} />
          {homework.className}
        </span>
        {overdue ? (
          <span
            className='inline-flex items-center gap-1 bg-red-50 px-2 py-1 text-[11px] font-medium text-red-700 dark:bg-red-500/15 dark:text-red-300'
            style={chipRadius}
          >
            Overdue
          </span>
        ) : null}
      </div>

      {homework.instructions ? (
        <p className='mt-3 line-clamp-2 text-[12px] leading-relaxed text-gray-500 dark:text-gray-400'>
          {homework.instructions}
        </p>
      ) : null}

      <div className='mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-gray-500 dark:text-gray-400'>
        <span className='inline-flex items-center gap-1.5'>
          <Calendar className='size-3 shrink-0' strokeWidth={1.75} />
          Due {formatDate(homework.dueDate)}
        </span>
      </div>

      <div className='mt-auto flex items-center justify-end gap-3 pt-4'>
        <Button to={detailsPath} variant='secondary' size='sm'>
          View
        </Button>
      </div>
    </article>
  )
}

export default HomeworkItem

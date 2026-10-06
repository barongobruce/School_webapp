import React from 'react'
import { Bookmark, Calendar, Clock, GraduationCap } from 'lucide-react'
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

const formatTime = (iso) => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })
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

const LessonItem = ({ lesson, view = 'grid' }) => {
  const lessonId = lesson._id || lesson.id
  const detailsPath = `/dashboard/lessons/${lessonId}`
  const subjectLabel = lesson.courseName || lesson.subject || 'Course'

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
              {lesson.title}
            </h2>
            <span className='truncate text-[11px] text-gray-400 dark:text-gray-500'>
              {subjectLabel}
            </span>
          </div>
          <p className='mt-0.5 truncate text-[12px] text-gray-500 dark:text-gray-400'>
            {lesson.className}
            <span className='mx-1.5 text-gray-300 dark:text-gray-600'>·</span>
            {formatDate(lesson.scheduledAt)} · {formatTime(lesson.scheduledAt)}
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
            {lesson.title}
          </h2>
          <p className='mt-0.5 truncate text-[12px] text-gray-500 dark:text-gray-400'>
            {subjectLabel}
          </p>
        </div>

        <button
          type='button'
          aria-label={`Bookmark ${lesson.title}`}
          className='shrink-0 p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:hover:bg-white/8 dark:hover:text-gray-200'
          style={{ borderRadius: '0.7rem 0.2rem 0.7rem 0.2rem' }}
        >
          <Bookmark className='size-3.5' strokeWidth={1.75} />
        </button>
      </div>

      <div className='mt-3 flex flex-wrap gap-1.5'>
        <span
          className='inline-flex items-center gap-1 bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-700 dark:bg-white/10 dark:text-gray-200'
          style={chipRadius}
        >
          <GraduationCap className='size-3' strokeWidth={2} />
          {lesson.className}
        </span>
      </div>

      {lesson.notes ? (
        <p className='mt-3 line-clamp-2 text-[12px] leading-relaxed text-gray-500 dark:text-gray-400'>
          {lesson.notes}
        </p>
      ) : null}

      <div className='mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-gray-500 dark:text-gray-400'>
        <span className='inline-flex items-center gap-1.5'>
          <Calendar className='size-3 shrink-0' strokeWidth={1.75} />
          {formatDate(lesson.scheduledAt)}
        </span>
        <span className='inline-flex items-center gap-1.5'>
          <Clock className='size-3 shrink-0' strokeWidth={1.75} />
          {formatTime(lesson.scheduledAt)} · {lesson.durationMinutes} min
        </span>
      </div>

      <div className='mt-auto flex items-center justify-between gap-3 pt-4'>
        <p className='truncate font-mono text-[11px] text-gray-400 dark:text-gray-500'>
          {lessonId}
        </p>
        <Button to={detailsPath} variant='secondary' size='sm'>
          View Plan
        </Button>
      </div>
    </article>
  )
}

export default LessonItem

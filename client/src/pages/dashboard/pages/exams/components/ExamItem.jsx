import React from 'react'
import { Calendar, Clock, GraduationCap, MapPin } from 'lucide-react'
import Button from '../../../../../components/Button'

const cardRadius = { borderRadius: '1.5rem 0.5rem 1.5rem 0.5rem' }
const avatarRadius = { borderRadius: '0.95rem 0.3rem 0.95rem 0.3rem' }
const chipRadius = { borderRadius: '0.85rem 0.25rem 0.85rem 0.25rem' }

const subjectTone = (subject) => {
  switch (subject) {
    case 'Mathematics':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300'
    case 'Science':
    case 'Biology':
    case 'Chemistry':
    case 'Physics':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
    case 'English':
    case 'Literature':
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

const STATUS_TONE = {
  scheduled:
    'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  ongoing:
    'bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  completed:
    'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
  cancelled: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
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

const formatTimeLabel = (value) => {
  if (!value) return '—'
  const [hours, minutes] = String(value).split(':')
  const hour = Number(hours)
  if (!Number.isFinite(hour)) return value
  const date = new Date()
  date.setHours(hour, Number(minutes) || 0, 0, 0)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
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

const ExamItem = ({ exam, view = 'grid' }) => {
  const examId = exam._id || exam.id
  const detailsPath = `/dashboard/exams/${examId}`
  const subjectLabel = exam.subject || 'Subject'
  const status = exam.status || 'scheduled'
  const statusLabel = exam.statusLabel || status
  const timeRange = `${formatTimeLabel(exam.startTime)} – ${formatTimeLabel(exam.endTime)}`

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
              {exam.title}
            </h2>
            <span className='truncate text-[11px] text-gray-400 dark:text-gray-500'>
              {subjectLabel}
            </span>
          </div>
          <p className='mt-0.5 truncate text-[12px] text-gray-500 dark:text-gray-400'>
            {exam.className}
            <span className='mx-1.5 text-gray-300 dark:text-gray-600'>·</span>
            {formatDate(exam.examDate)}
            <span className='mx-1.5 text-gray-300 dark:text-gray-600'>·</span>
            {timeRange}
          </p>
        </div>

        <span
          className={`hidden shrink-0 px-2 py-1 text-[11px] font-medium sm:inline-flex ${STATUS_TONE[status] || STATUS_TONE.scheduled}`}
          style={chipRadius}
        >
          {statusLabel}
        </span>

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
            {exam.title}
          </h2>
          <p className='mt-0.5 truncate text-[12px] text-gray-500 dark:text-gray-400'>
            {subjectLabel}
            {exam.examTypeLabel ? ` · ${exam.examTypeLabel}` : ''}
          </p>
        </div>
      </div>

      <div className='mt-3 flex flex-wrap gap-1.5'>
        <span
          className='inline-flex items-center gap-1 bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-700 dark:bg-white/10 dark:text-gray-200'
          style={chipRadius}
        >
          <GraduationCap className='size-3' strokeWidth={2} />
          {exam.className || 'Class'}
        </span>
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium ${STATUS_TONE[status] || STATUS_TONE.scheduled}`}
          style={chipRadius}
        >
          {statusLabel}
        </span>
      </div>

      <div className='mt-3 space-y-1.5 text-[12px] text-gray-500 dark:text-gray-400'>
        <span className='flex items-center gap-1.5'>
          <Calendar className='size-3 shrink-0' strokeWidth={1.75} />
          {formatDate(exam.examDate)}
        </span>
        <span className='flex items-center gap-1.5'>
          <Clock className='size-3 shrink-0' strokeWidth={1.75} />
          {timeRange}
          {exam.duration ? ` · ${exam.duration} min` : ''}
        </span>
        {exam.venue ? (
          <span className='flex items-center gap-1.5'>
            <MapPin className='size-3 shrink-0' strokeWidth={1.75} />
            {exam.venue}
          </span>
        ) : null}
      </div>

      <div className='mt-auto flex items-center justify-between gap-3 pt-4'>
        <span className='text-[11px] font-medium text-gray-400 dark:text-gray-500'>
          {exam.totalMarks != null ? `${exam.totalMarks} marks` : ''}
          {exam.passingMarks != null ? ` · pass ${exam.passingMarks}` : ''}
        </span>
        <Button to={detailsPath} variant='secondary' size='sm'>
          View
        </Button>
      </div>
    </article>
  )
}

export default ExamItem

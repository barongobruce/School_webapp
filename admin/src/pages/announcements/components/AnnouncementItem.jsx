import React from 'react'
import {
  Bookmark,
  CalendarDays,
  Megaphone,
  Tag,
  Users,
} from 'lucide-react'
import Button from '../../../components/Button'

const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const toList = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean)
  return value ? [value] : []
}

const formatLabel = (value) => {
  if (!value) return '—'
  return String(value)
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

const formatList = (value) => {
  const items = toList(value).map(formatLabel)
  return items.length ? items.join(', ') : '—'
}

const severityClass = (severity) => {
  switch (String(severity || '').toLowerCase()) {
    case 'high':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300'
    case 'medium':
      return 'bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300'
    case 'low':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-200'
  }
}

const cardRadius = { borderRadius: '1.5rem 0.5rem 1.5rem 0.5rem' }
const avatarRadius = { borderRadius: '0.95rem 0.3rem 0.95rem 0.3rem' }
const chipRadius = { borderRadius: '0.85rem 0.25rem 0.85rem 0.25rem' }

const DateAvatar = ({ date, className = 'size-11' }) => {
  if (!date) {
    return (
      <div
        className={`${className} flex shrink-0 items-center justify-center bg-blue-100 shadow-[var(--shadow-soft)] dark:bg-blue-500/20`}
        style={avatarRadius}
      >
        <Megaphone
          className='size-4 text-blue-800 dark:text-blue-300'
          strokeWidth={1.75}
        />
      </div>
    )
  }

  const parsed = new Date(date)
  const month = parsed.toLocaleDateString('en-GB', { month: 'short' })
  const day = parsed.getDate()

  return (
    <div
      className={`${className} flex shrink-0 flex-col items-center justify-center bg-blue-100 shadow-[var(--shadow-soft)] dark:bg-blue-500/20`}
      style={avatarRadius}
    >
      <span className='text-[8px] font-semibold tracking-wide text-blue-700/70 uppercase dark:text-blue-300/70'>
        {month}
      </span>
      <span className='text-[13px] leading-none font-semibold text-blue-800 dark:text-blue-300'>
        {day}
      </span>
    </div>
  )
}

const AnnouncementItem = ({ announcement, view = 'grid' }) => {
  const id = announcement._id || announcement.id
  const postedAt = announcement.publishDate || announcement.createdAt
  const description = announcement.description || announcement.summary || ''
  const category = formatList(announcement.category)
  const severity = toList(announcement.severity)[0] || announcement.priority || ''
  const audience = formatList(
    announcement.targetAudience || announcement.audience,
  )

  if (view === 'list') {
    return (
      <article
        className='flex items-center gap-3 bg-white p-3 shadow-[var(--shadow-soft)] transition-shadow duration-200 hover:shadow-[var(--shadow-lift)] dark:bg-[#152238] sm:gap-4 sm:px-4'
        style={cardRadius}
      >
        <DateAvatar date={postedAt} className='size-10 sm:size-11' />

        <div className='min-w-0 flex-1'>
          <div className='flex flex-wrap items-center gap-x-2 gap-y-0.5'>
            <h2 className='truncate text-[13px] font-semibold text-gray-900 dark:text-white'>
              {announcement.title}
            </h2>
          </div>
          <p className='mt-0.5 truncate text-[12px] text-gray-500 dark:text-gray-400'>
            {category}
            <span className='mx-1.5 text-gray-300 dark:text-gray-600'>·</span>
            {audience}
            {description ? (
              <>
                <span className='mx-1.5 text-gray-300 dark:text-gray-600'>·</span>
                {description}
              </>
            ) : null}
          </p>
        </div>

        {severity ? (
          <span
            className={`hidden shrink-0 px-2.5 py-1 text-[11px] font-medium sm:inline-flex ${severityClass(severity)}`}
            style={chipRadius}
          >
            {formatLabel(severity)}
          </span>
        ) : null}

        <Button to={`/announcements/${id}`} variant='secondary' size='sm'>
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
        <DateAvatar date={postedAt} />

        <div className='min-w-0 flex-1'>
          <h2 className='line-clamp-2 text-[14px] font-semibold tracking-tight text-gray-900 dark:text-white'>
            {announcement.title}
          </h2>
          <p className='mt-0.5 flex items-center gap-1.5 truncate text-[12px] text-gray-500 dark:text-gray-400'>
            <Users className='size-3 shrink-0' strokeWidth={1.75} />
            <span className='truncate'>{audience}</span>
          </p>
        </div>

        <button
          type='button'
          aria-label={`Bookmark ${announcement.title}`}
          className='shrink-0 p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:hover:bg-white/8 dark:hover:text-gray-200'
          style={{ borderRadius: '0.7rem 0.2rem 0.7rem 0.2rem' }}
        >
          <Bookmark className='size-3.5' strokeWidth={1.75} />
        </button>
      </div>

      <div className='mt-3 flex flex-wrap gap-1.5'>
        {severity ? (
          <span
            className={`inline-flex px-2 py-1 text-[11px] font-medium ${severityClass(severity)}`}
            style={chipRadius}
          >
            {formatLabel(severity)}
          </span>
        ) : null}
        <span
          className='inline-flex items-center gap-1 bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-700 dark:bg-white/10 dark:text-gray-200'
          style={chipRadius}
        >
          <Tag className='size-3' strokeWidth={2} />
          {category}
        </span>
      </div>

      {description ? (
        <p className='mt-3 line-clamp-2 text-[12px] leading-relaxed text-gray-500 dark:text-gray-400'>
          {description}
        </p>
      ) : null}

      <div className='mt-auto flex items-center justify-between gap-3 pt-4'>
        <p className='flex min-w-0 items-center gap-1.5 truncate text-[12px] text-gray-400 dark:text-gray-500'>
          <CalendarDays className='size-3 shrink-0' strokeWidth={1.75} />
          <span className='truncate'>Posted {formatDate(postedAt)}</span>
        </p>
        <Button to={`/announcements/${id}`} variant='secondary' size='sm'>
          View Notice
        </Button>
      </div>
    </article>
  )
}

export default AnnouncementItem

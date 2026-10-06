import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  Megaphone,
  Pencil,
  Tag,
  Users,
} from 'lucide-react'
import { getAnnouncementById } from '../../lib/announcement.requests'
import useModal from '../../hooks/useModal'
import Button from '../../components/Button'
import EditAnnouncement from './components/EditAnnouncement'
import AnnouncementDetailsSkeleton from './components/AnnouncementDetailsSkeleton'

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
      return 'bg-orange-50 text-orange-700 ring-1 ring-orange-200/80 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/25'
    case 'medium':
      return 'bg-sky-50 text-sky-700 ring-1 ring-sky-200/80 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/25'
    case 'low':
      return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/25'
    default:
      return 'bg-gray-50 text-gray-600 ring-1 ring-gray-200/80 dark:bg-white/5 dark:text-gray-300 dark:ring-white/10'
  }
}

const chipRadius = { borderRadius: '0.85rem 0.25rem 0.85rem 0.25rem' }
const cardRadius = { borderRadius: '1.5rem 0.5rem 1.5rem 0.5rem' }
const avatarRadius = { borderRadius: '1.5rem 0.5rem 1.5rem 0.5rem' }

const surface =
  'border border-gray-200/70 bg-white dark:border-white/10 dark:bg-[#0c1528]'

const DetailRow = ({ label, value }) => (
  <div className='flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4'>
    <dt className='shrink-0 text-[12px] text-gray-500 dark:text-gray-400'>{label}</dt>
    <dd className='text-[13px] font-medium text-gray-900 sm:text-right dark:text-gray-100'>
      {value || '—'}
    </dd>
  </div>
)

const SectionCard = ({ title, children }) => (
  <section className={`${surface} p-5`} style={cardRadius}>
    <h2 className='mb-4 text-[11px] font-semibold tracking-[0.08em] text-gray-500 uppercase dark:text-gray-400'>
      {title}
    </h2>
    {children}
  </section>
)

const StatCard = ({ label, value, valueClassName = '' }) => (
  <div className={`${surface} px-4 py-4`} style={cardRadius}>
    <p className='text-[11px] font-medium tracking-[0.06em] text-gray-500 uppercase dark:text-gray-400'>
      {label}
    </p>
    <p
      className={`mt-1.5 text-[17px] font-semibold tracking-tight text-gray-900 dark:text-white ${valueClassName}`}
    >
      {value}
    </p>
  </div>
)

const AnnouncementAvatar = ({ date, className = 'size-28 sm:size-32' }) => {
  if (!date) {
    return (
      <div
        className={`${className} flex shrink-0 items-center justify-center bg-blue-50 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:ring-blue-500/20`}
        style={avatarRadius}
      >
        <Megaphone
          className='size-8 text-blue-800 dark:text-blue-300'
          strokeWidth={1.5}
        />
      </div>
    )
  }

  const parsed = new Date(date)
  const month = parsed.toLocaleDateString('en-GB', { month: 'short' })
  const day = parsed.getDate()

  return (
    <div
      className={`${className} flex shrink-0 flex-col items-center justify-center bg-blue-50 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:ring-blue-500/20`}
      style={avatarRadius}
    >
      <span className='text-[11px] font-semibold tracking-[0.08em] text-blue-700/70 uppercase dark:text-blue-300/70'>
        {month}
      </span>
      <span className='mt-1 text-3xl font-semibold tracking-tight text-blue-800 dark:text-blue-300 sm:text-4xl'>
        {day}
      </span>
    </div>
  )
}

const AnnouncementDetails = () => {
  const { id } = useParams()
  const { open } = useModal()
  const [announcement, setAnnouncement] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadAnnouncement = async () => {
      setLoading(true)
      setError('')

      try {
        const data = await getAnnouncementById(id)
        if (!cancelled) setAnnouncement(data.announcement)
      } catch (err) {
        if (!cancelled) {
          setAnnouncement(null)
          setError(err.message || 'Failed to load announcement.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadAnnouncement()

    return () => {
      cancelled = true
    }
  }, [id])

  const reloadAnnouncement = async () => {
    try {
      const data = await getAnnouncementById(id)
      setAnnouncement(data.announcement)
    } catch (err) {
      setError(err.message || 'Failed to reload announcement.')
    }
  }

  const handleEditAnnouncement = () => {
    if (!announcement) return
    open({
      title: 'Edit Announcement',
      description: `Update the notice profile for ${announcement.title}.`,
      size: 'full',
      content: (
        <EditAnnouncement
          announcement={announcement}
          onSuccess={reloadAnnouncement}
        />
      ),
    })
  }

  if (loading) {
    return <AnnouncementDetailsSkeleton />
  }

  if (!announcement) {
    return (
      <section className='flex flex-1 flex-col items-start gap-4 overflow-y-auto px-3 py-5 sm:px-4'>
        <Link
          to='/announcements'
          className='inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-500 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'
        >
          <ArrowLeft className='size-3.5' strokeWidth={1.75} />
          Back to announcements
        </Link>
        <div className={`w-full ${surface} px-6 py-12 text-center`} style={cardRadius}>
          <h1 className='text-[15px] font-semibold text-gray-900 dark:text-white'>
            Announcement not found
          </h1>
          <p className='mt-1 text-[13px] text-gray-500 dark:text-gray-400'>
            {error || (
              <>
                No announcement matches the ID{' '}
                <span className='font-medium text-gray-700 dark:text-gray-300'>
                  {id}
                </span>
                .
              </>
            )}
          </p>
        </div>
      </section>
    )
  }

  const announcementId = announcement._id || announcement.id
  const category = formatList(announcement.category)
  const severity =
    toList(announcement.severity)[0] || announcement.priority || ''
  const audienceItems = toList(
    announcement.targetAudience || announcement.audience,
  )
  const description = announcement.description || announcement.summary || ''
  const postedAt = announcement.publishDate || announcement.createdAt

  const metaParts = [
    category !== '—' ? category : null,
    audienceItems.length ? formatList(audienceItems) : null,
    postedAt ? `Posted ${formatDate(postedAt)}` : null,
  ].filter(Boolean)

  return (
    <section className='flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-3 sm:px-4'>
      <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
        <Link
          to='/announcements'
          className='inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-500 transition-colors hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:text-gray-400 dark:hover:text-blue-400'
        >
          <ArrowLeft className='size-3.5' strokeWidth={1.75} />
          Back to announcements
        </Link>

        <Button
          type='button'
          variant='primary'
          size='sm'
          onClick={handleEditAnnouncement}
        >
          <Pencil className='size-3.5' strokeWidth={1.75} />
          Edit Announcement
        </Button>
      </div>

      {/* Identity */}
      <div className={`mb-4 ${surface} p-4 sm:p-5`} style={cardRadius}>
        <div className='flex flex-col gap-5 sm:flex-row sm:items-stretch'>
          <AnnouncementAvatar date={postedAt} />

          <div className='flex min-w-0 flex-1 flex-col justify-between gap-4'>
            <div>
              <div className='flex flex-wrap items-start justify-between gap-3'>
                <div className='min-w-0'>
                  <h1 className='text-[22px] font-semibold tracking-tight text-gray-900 dark:text-white sm:text-[26px]'>
                    {announcement.title}
                  </h1>
                  <p className='mt-1 font-mono text-[12px] tracking-wide text-gray-400 dark:text-gray-500'>
                    {announcementId}
                  </p>
                </div>

                {severity ? (
                  <span
                    className={`inline-flex shrink-0 px-2.5 py-1 text-[11px] font-medium ${severityClass(severity)}`}
                    style={chipRadius}
                  >
                    {formatLabel(severity)}
                  </span>
                ) : null}
              </div>

              {metaParts.length > 0 && (
                <p className='mt-3 text-[13px] leading-relaxed text-gray-500 dark:text-gray-400'>
                  {metaParts.map((part, index) => (
                    <React.Fragment key={`${part}-${index}`}>
                      {index > 0 && (
                        <span
                          className='mx-2 text-gray-300 dark:text-gray-600'
                          aria-hidden='true'
                        >
                          ·
                        </span>
                      )}
                      <span>{part}</span>
                    </React.Fragment>
                  ))}
                </p>
              )}
            </div>

            <div className='flex flex-wrap items-center gap-x-1 gap-y-2 border-t border-gray-100 pt-3 dark:border-white/8'>
              <span className='inline-flex items-center gap-1.5 rounded-[0.85rem_0.25rem] px-2 py-1.5 text-[13px] text-gray-600 dark:text-gray-300'>
                <Tag className='size-3.5 shrink-0' strokeWidth={1.75} />
                {category}
              </span>
              <span
                className='hidden text-gray-200 sm:inline dark:text-gray-700'
                aria-hidden='true'
              >
                |
              </span>
              <span className='inline-flex items-center gap-1.5 rounded-[0.85rem_0.25rem] px-2 py-1.5 text-[13px] text-gray-600 dark:text-gray-300'>
                <Users className='size-3.5 shrink-0' strokeWidth={1.75} />
                {audienceItems.length
                  ? formatList(audienceItems)
                  : 'No audience'}
              </span>
              <span
                className='hidden text-gray-200 sm:inline dark:text-gray-700'
                aria-hidden='true'
              >
                |
              </span>
              <span className='inline-flex items-center gap-1.5 rounded-[0.85rem_0.25rem] px-2 py-1.5 text-[13px] text-gray-600 dark:text-gray-300'>
                <CalendarDays className='size-3.5 shrink-0' strokeWidth={1.75} />
                Posted {formatDate(postedAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className='mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3'>
        <StatCard label='Severity' value={formatLabel(severity)} />
        <StatCard label='Category' value={category} />
        <StatCard
          label='Audience'
          value={audienceItems.length ? String(audienceItems.length) : '—'}
        />
      </div>

      <div className='mb-4 grid grid-cols-1 gap-3 lg:grid-cols-2'>
        <SectionCard title='Full announcement'>
          <p className='text-[13px] leading-relaxed whitespace-pre-line text-gray-700 dark:text-gray-200'>
            {description || 'No description provided.'}
          </p>
        </SectionCard>

        <SectionCard title='Audience'>
          {audienceItems.length === 0 ? (
            <p className='text-[13px] text-gray-500 dark:text-gray-400'>
              No audience assigned.
            </p>
          ) : (
            <ul className='flex flex-wrap gap-2'>
              {audienceItems.map((item) => (
                <li key={item}>
                  <span
                    className='inline-flex items-center gap-1.5 border border-gray-200/70 bg-gray-50/80 px-3 py-2 text-[13px] font-medium text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-200'
                    style={chipRadius}
                  >
                    <Users
                      className='size-3.5 text-[#20509b] dark:text-blue-300'
                      strokeWidth={1.75}
                    />
                    {formatLabel(item)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title='Notice details'>
          <dl className='flex flex-col gap-3'>
            <DetailRow label='Title' value={announcement.title} />
            <DetailRow label='Category' value={category} />
            <DetailRow label='Severity' value={formatLabel(severity)} />
            <DetailRow
              label='Target audience'
              value={formatList(audienceItems)}
            />
          </dl>
        </SectionCard>

        <SectionCard title='Record details'>
          <dl className='flex flex-col gap-3'>
            <DetailRow label='Announcement ID' value={announcementId} />
            <DetailRow label='Posted' value={formatDate(postedAt)} />
            <DetailRow
              label='Created'
              value={formatDate(announcement.createdAt)}
            />
            <DetailRow
              label='Updated'
              value={formatDate(announcement.updatedAt)}
            />
          </dl>
        </SectionCard>
      </div>
    </section>
  )
}

export default AnnouncementDetails

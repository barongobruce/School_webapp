import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { LayoutGrid, List } from 'lucide-react'
import { getMyAnnouncements } from '../../../../../lib/announcement.requests'
import { syncAnnouncementsAsSeen } from '../../../../../store/slices/announcementsSlice'
import AnnouncementItem from './AnnouncementItem'
import AnnouncementsSkeleton from './AnnouncementsSkeleton'

const viewToggleBtn =
  'grid size-8 place-items-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500'

const toList = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean)
  return value ? [value] : []
}

const matchesQuery = (announcement, query) => {
  const q = query.trim().toLowerCase()
  if (!q) return true

  const haystack = [
    announcement._id,
    announcement.id,
    announcement.title,
    announcement.description,
    ...toList(announcement.category),
    ...toList(announcement.severity),
    ...toList(announcement.targetAudience),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return haystack.includes(q)
}

const hasValue = (values, expected) =>
  toList(values).some((item) => String(item).toLowerCase() === expected)

const AnnouncementList = ({
  search = '',
  severityFilter = 'All',
  categoryFilter = 'All',
}) => {
  const dispatch = useDispatch()
  const [view, setView] = useState('grid')
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadAnnouncements = async () => {
      setLoading(true)
      setError('')

      try {
        const data = await getMyAnnouncements()
        if (cancelled) return
        const items = data.announcements || []
        setAnnouncements(items)
        // Sync store + clear navbar unread badge for this visit
        dispatch(syncAnnouncementsAsSeen(items))
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load announcements.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadAnnouncements()

    return () => {
      cancelled = true
    }
  }, [dispatch])

  const filtered = useMemo(() => {
    return announcements.filter((announcement) => {
      const severityOk =
        severityFilter === 'All'
          ? true
          : hasValue(announcement.severity, severityFilter)
      const categoryOk =
        categoryFilter === 'All'
          ? true
          : hasValue(announcement.category, categoryFilter)
      return severityOk && categoryOk && matchesQuery(announcement, search)
    })
  }, [announcements, search, severityFilter, categoryFilter])

  if (loading) {
    return <AnnouncementsSkeleton />
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
      <div className='mb-4 flex items-center justify-between gap-3'>
        <p className='text-[13px] text-gray-500 dark:text-gray-400'>
          Showing{' '}
          <span className='font-semibold text-gray-800 dark:text-gray-200'>
            {filtered.length}
          </span>{' '}
          {filtered.length === 1 ? 'announcement' : 'announcements'}
          {search ? (
            <span className='text-gray-400 dark:text-gray-500'>
              {' '}
              for “{search}”
            </span>
          ) : null}
        </p>

        <div
          className='flex items-center gap-0.5 bg-gray-100 p-0.5 shadow-[var(--shadow-soft)] dark:bg-[#152238]'
          style={{ borderRadius: '0.95rem 0.3rem 0.95rem 0.3rem' }}
          role='group'
          aria-label='Change announcement list layout'
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
            {announcements.length === 0
              ? 'No announcements yet'
              : 'No matching announcements'}
          </p>
          <p className='mt-1 text-[13px] text-gray-500 dark:text-gray-400'>
            {announcements.length === 0
              ? 'School notices for your role will appear here when posted.'
              : 'Try a different search, severity, or category filter.'}
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
          {filtered.map((announcement) => (
            <li key={announcement._id || announcement.id}>
              <AnnouncementItem announcement={announcement} view={view} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default AnnouncementList

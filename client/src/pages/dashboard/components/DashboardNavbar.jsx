import React, { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation } from 'react-router-dom'
import {
  PanelLeftClose,
  PanelLeftOpen,
  MoreVertical,
  Megaphone,
  ChevronRight,
} from 'lucide-react'
import { formatUserRole, getUserFullName } from '../../../lib/auth'
import { getInitials } from '../../../utils/avatar'
import { toggleSidebar } from '../../../store/slices/uiSlice'
import {
  fetchAnnouncements,
  hydrateAnnouncementSeen,
  selectUnreadAnnouncementCount,
} from '../../../store/slices/announcementsSlice'

const chipRadius = { borderRadius: '0.85rem 0.25rem 0.85rem 0.25rem' }
const softRadius = { borderRadius: '1.1rem 0.35rem 1.1rem 0.35rem' }
const avatarRadius = { borderRadius: '0.95rem 0.3rem 0.95rem 0.3rem' }

/** Refetch navbar count at most once every 60s unless forced by a new user. */
const STALE_MS = 60_000

const ROUTE_META = [
  {
    match: '/dashboard',
    exact: true,
    title: 'Dashboard',
    subtitle: 'Your day, lessons, and progress at a glance',
  },
  {
    match: '/dashboard/students',
    title: 'Students',
    subtitle: 'Enrollment and student records',
  },
  {
    match: '/dashboard/guardians',
    title: 'Guardians',
    subtitle: 'Parent and guardian contacts',
  },
  {
    match: '/dashboard/classes',
    title: 'Classes',
    subtitle: 'Your assigned classes and students',
  },
  {
    match: '/dashboard/lessons',
    title: 'Lessons',
    subtitle: 'Lesson plans and teaching sessions',
  },
  {
    match: '/dashboard/homeworks',
    title: 'Homeworks',
    subtitle: 'Homework and coursework tasks',
  },
  {
    match: '/dashboard/exams',
    title: 'Exams',
    subtitle: 'Assessments and exam sessions',
  },
  {
    match: '/dashboard/attendance',
    title: 'Attendance',
    subtitle: 'Lesson roll call and presence records',
  },
  {
    match: '/dashboard/complaints',
    title: 'Complaints',
    subtitle: 'Incidents and case records',
  },
  {
    match: '/dashboard/events',
    title: 'Events',
    subtitle: 'Calendar and school activities',
  },
  {
    match: '/dashboard/announcements',
    title: 'Announcements',
    subtitle: 'School notices and updates',
  },
  {
    match: '/dashboard/payments',
    title: 'Payments',
    subtitle: 'Invoices and payment history',
  },
  {
    match: '/dashboard/profile',
    title: 'Profile',
    subtitle: 'Your account settings',
  },
  {
    match: '/dashboard/settings',
    title: 'Settings',
    subtitle: 'Preferences and configuration',
  },
]

const getRouteMeta = (pathname) => {
  const exact = ROUTE_META.find(
    (route) => route.exact && pathname === route.match,
  )
  if (exact) return exact

  const nested = ROUTE_META.filter((route) => !route.exact)
    .sort((a, b) => b.match.length - a.match.length)
    .find(
      (route) =>
        pathname === route.match || pathname.startsWith(`${route.match}/`),
    )

  if (nested) {
    const isDetail = pathname !== nested.match
    return {
      ...nested,
      crumb: isDetail ? 'Details' : null,
    }
  }

  return { title: 'BARONGO', subtitle: 'School workspace', crumb: null }
}

const formatToday = () =>
  new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })

const NavIconButton = ({
  label,
  onClick,
  to,
  children,
  active = false,
  badge,
  expanded,
}) => {
  const className = [
    'relative grid size-9 place-items-center transition-all duration-200',
    'text-gray-500 hover:text-[#20509b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
    'dark:text-gray-400 dark:hover:text-blue-300',
    active
      ? 'brand-gradient text-white shadow-[var(--shadow-brand)] hover:text-white dark:hover:text-white'
      : 'bg-gray-100/80 hover:bg-blue-50 dark:bg-white/6 dark:hover:bg-white/10',
  ].join(' ')

  const content = (
    <>
      {children}
      {badge > 0 ? (
        <span
          className='absolute -top-1 -right-1 grid h-[1.125rem] min-w-[1.125rem] place-items-center rounded-full bg-gradient-to-br from-orange-500 to-red-500 px-1 text-[9px] font-bold text-white shadow-[0_6px_14px_rgba(239,68,68,0.35)] ring-2 ring-white dark:ring-[#0c1528]'
          aria-hidden='true'
        >
          {badge > 99 ? '99+' : badge}
        </span>
      ) : null}
    </>
  )

  if (to) {
    return (
      <Link to={to} aria-label={label} className={className} style={chipRadius}>
        {content}
      </Link>
    )
  }

  return (
    <button
      type='button'
      aria-label={label}
      aria-expanded={expanded}
      aria-controls={expanded === undefined ? undefined : 'dashboard-navigation'}
      onClick={onClick}
      className={className}
      style={chipRadius}
    >
      {content}
    </button>
  )
}

const DashboardNavbar = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const isSidebarOpen = useSelector((state) => state.ui.isSidebarOpen)
  const user = useSelector((state) => state.user.user)
  const announcementsStatus = useSelector((state) => state.announcements.status)
  const lastFetchedAt = useSelector((state) => state.announcements.lastFetchedAt)
  const announcementsUserId = useSelector((state) => state.announcements.userId)
  const unreadCount = useSelector(selectUnreadAnnouncementCount)

  const meta = useMemo(() => getRouteMeta(location.pathname), [location.pathname])
  const todayLabel = useMemo(() => formatToday(), [])
  const displayName = getUserFullName(user) || 'User'
  const displayRole = formatUserRole(user?.role)
  const initials = getInitials(user?.firstName, user?.lastName)
  const userId = user?.id || user?._id || null

  useEffect(() => {
    if (!userId) return

    const sameUser = String(announcementsUserId || '') === String(userId)

    if (!sameUser) {
      dispatch(hydrateAnnouncementSeen(userId))
      dispatch(fetchAnnouncements())
      return
    }

    if (announcementsStatus === 'idle') {
      dispatch(fetchAnnouncements())
      return
    }

    if (
      announcementsStatus === 'succeeded' &&
      lastFetchedAt &&
      Date.now() - lastFetchedAt > STALE_MS
    ) {
      dispatch(fetchAnnouncements())
    }
  }, [
    announcementsStatus,
    announcementsUserId,
    dispatch,
    lastFetchedAt,
    userId,
  ])

  const announcementLabel =
    unreadCount > 0
      ? `Announcements, ${unreadCount} unread`
      : 'Announcements'

  return (
    <nav className='flex items-center justify-between gap-3 sm:gap-4'>
      <div className='flex min-w-0 items-center gap-2.5 sm:gap-3'>
        <NavIconButton
          label={isSidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => dispatch(toggleSidebar())}
          active={!isSidebarOpen}
          expanded={isSidebarOpen}
        >
          <MoreVertical className='size-5 md:hidden' strokeWidth={2.25} />
          {isSidebarOpen ? (
            <PanelLeftClose className='hidden size-4 md:block' strokeWidth={1.75} />
          ) : (
            <PanelLeftOpen className='hidden size-4 md:block' strokeWidth={1.75} />
          )}
        </NavIconButton>

        <div className='min-w-0'>
          <div className='flex min-w-0 items-center gap-1.5'>
            <h1 className='truncate text-[15px] font-semibold tracking-tight text-gray-900 dark:text-white sm:text-[16px]'>
              {meta.title}
            </h1>
            {meta.crumb ? (
              <>
                <ChevronRight
                  className='hidden size-3.5 shrink-0 text-gray-300 sm:block dark:text-gray-600'
                  strokeWidth={2}
                  aria-hidden='true'
                />
                <span className='hidden truncate text-[13px] font-medium text-gray-400 sm:inline dark:text-gray-500'>
                  {meta.crumb}
                </span>
              </>
            ) : null}
          </div>
          <p className='mt-0.5 hidden truncate text-[11px] text-gray-400 sm:block dark:text-gray-500'>
            <span className='text-gray-500 dark:text-gray-400'>{todayLabel}</span>
            <span className='mx-1.5 text-gray-300 dark:text-gray-600' aria-hidden='true'>
              ·
            </span>
            {meta.subtitle}
          </p>
        </div>
      </div>

      <div className='flex shrink-0 items-center gap-1.5 sm:gap-2'>
        <NavIconButton
          to='/dashboard/announcements'
          label={announcementLabel}
          badge={unreadCount}
          active={location.pathname.startsWith('/dashboard/announcements')}
        >
          <Megaphone className='size-4' strokeWidth={1.75} />
        </NavIconButton>

        <Link
          to='/dashboard/profile'
          className='group flex items-center gap-2.5 py-1 pr-2.5 pl-1 transition-all duration-200 hover:bg-gray-100/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:hover:bg-white/6'
          style={softRadius}
        >
          <span
            className='relative grid size-9 shrink-0 place-items-center overflow-hidden brand-gradient text-[11px] font-semibold tracking-wide text-white shadow-[0_8px_18px_rgba(32,80,155,0.22)] ring-1 ring-blue-100/80 transition-shadow duration-200 group-hover:shadow-[0_10px_22px_rgba(32,80,155,0.28)] dark:ring-blue-400/20'
            style={avatarRadius}
            aria-hidden='true'
          >
            {user?.photo ? (
              <img
                src={user.photo}
                alt=''
                className='absolute inset-0 size-full object-cover'
              />
            ) : (
              initials
            )}
          </span>
          <span className='hidden min-w-0 lg:block'>
            <span className='block truncate text-[13px] font-semibold leading-tight text-gray-900 dark:text-gray-100'>
              {displayName}
            </span>
            <span className='mt-0.5 block truncate text-[10px] font-medium tracking-[0.08em] text-gray-400 uppercase dark:text-gray-500'>
              {displayRole}
            </span>
          </span>
        </Link>
      </div>
    </nav>
  )
}

export default DashboardNavbar

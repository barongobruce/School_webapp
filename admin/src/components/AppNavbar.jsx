import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTheme } from 'next-themes'
import { Link, useLocation } from 'react-router-dom'
import {
  PanelLeftClose,
  PanelLeftOpen,
  Moon,
  Sun,
  ChevronRight,
} from 'lucide-react'
import { toggleSidebar } from '../store/slices/uiSlice'
import { formatAdminRole, getAdminFullName } from '../lib/auth'
import { getInitials } from '../utils/avatar'

const chipRadius = { borderRadius: '0.85rem 0.25rem 0.85rem 0.25rem' }
const softRadius = { borderRadius: '1.1rem 0.35rem 1.1rem 0.35rem' }
const avatarRadius = { borderRadius: '0.95rem 0.3rem 0.95rem 0.3rem' }

const ROUTE_META = [
  { match: '/', exact: true, title: 'Overview', subtitle: 'School operations at a glance' },
  { match: '/complaints', title: 'Complaints', subtitle: 'Incidents and case records' },
  { match: '/students', title: 'Students', subtitle: 'Enrollment and student records' },
  { match: '/teachers', title: 'Teachers', subtitle: 'Faculty and staffing profiles' },
  { match: '/events', title: 'Events', subtitle: 'Calendar and school activities' },
  { match: '/guardians', title: 'Guardians', subtitle: 'Parent and guardian contacts' },
  { match: '/classes', title: 'Classes', subtitle: 'Sections, grades, and schedules' },
  { match: '/courses', title: 'Courses', subtitle: 'Curriculum and course catalog' },
  { match: '/payments', title: 'Fees & Payments', subtitle: 'Billing and payment tracking' },
  { match: '/exams', title: 'Exams', subtitle: 'Assessments and exam sessions' },
  { match: '/announcements', title: 'Announcements', subtitle: 'School notices and updates' },
  { match: '/profile', title: 'Profile', subtitle: 'Your admin account settings' },
]

const getRouteMeta = (pathname) => {
  const exact = ROUTE_META.find(
    (route) => route.exact && pathname === route.match,
  )
  if (exact) return exact

  const nested = ROUTE_META.filter((route) => !route.exact)
    .sort((a, b) => b.match.length - a.match.length)
    .find((route) => pathname === route.match || pathname.startsWith(`${route.match}/`))

  if (nested) {
    const isDetail = pathname !== nested.match
    return {
      ...nested,
      crumb: isDetail ? 'Details' : null,
    }
  }

  return { title: 'Barongo', subtitle: 'Admin workspace', crumb: null }
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
      onClick={onClick}
      className={className}
      style={chipRadius}
    >
      {content}
    </button>
  )
}

const AppNavbar = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const isSidebarOpen = useSelector((state) => state.ui.isSidebarOpen)
  const user = useSelector((state) => state.user.user)
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === 'dark'
  const meta = useMemo(() => getRouteMeta(location.pathname), [location.pathname])
  const todayLabel = useMemo(() => formatToday(), [])
  const displayName = getAdminFullName(user) || 'Admin'
  const displayRole = formatAdminRole(user?.role)
  const initials = getInitials(user?.firstName, user?.lastName)

  return (
    <nav className='flex items-center justify-between gap-3 sm:gap-4'>
      <div className='flex min-w-0 items-center gap-2.5 sm:gap-3'>
        <NavIconButton
          label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          onClick={() => dispatch(toggleSidebar())}
          active={!isSidebarOpen}
        >
          {isSidebarOpen ? (
            <PanelLeftClose className='size-4' strokeWidth={1.75} />
          ) : (
            <PanelLeftOpen className='size-4' strokeWidth={1.75} />
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
        <div
          className='flex items-center gap-1 bg-gray-100/70 p-1 dark:bg-white/5'
          style={softRadius}
        >
          <NavIconButton
            label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
          >
            <span className='relative grid size-4 place-items-center overflow-hidden'>
              <Sun
                className={`absolute size-4 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isDark
                    ? 'translate-y-0 rotate-0 opacity-100'
                    : '-translate-y-3 rotate-45 opacity-0'
                }`}
                strokeWidth={1.75}
              />
              <Moon
                className={`absolute size-4 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isDark
                    ? 'translate-y-3 -rotate-45 opacity-0'
                    : 'translate-y-0 rotate-0 opacity-100'
                }`}
                strokeWidth={1.75}
              />
            </span>
          </NavIconButton>
        </div>

        <Link
          to='/profile'
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

export default AppNavbar

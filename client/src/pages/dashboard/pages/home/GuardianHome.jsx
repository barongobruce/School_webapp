import React from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  GraduationCap,
  Megaphone,
  MessageSquareWarning,
  School,
  Users,
} from 'lucide-react'
import Button from '../../../../components/Button'
import DashboardTimetable from './DashboardTimetable'
import demoLessons from '../../../../data/lessons'

const cardRadius = { borderRadius: '1.6rem 0.45rem 1.6rem 0.45rem' }
const softRadius = { borderRadius: '0.95rem 0.3rem 0.95rem 0.3rem' }
const chipRadius = { borderRadius: '0.85rem 0.25rem 0.85rem 0.25rem' }

const surface =
  'border border-gray-200/70 bg-white dark:border-white/10 dark:bg-[#0c1528]'

const formatDay = (iso) => {
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

const greetingForNow = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

const initialsFromName = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?'

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

const formatLabel = (value) => {
  if (!value) return ''
  return String(value)
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

const firstOf = (value) => {
  if (Array.isArray(value)) return value[0] || ''
  return value || ''
}

const StatCard = ({ label, value, hint, to, icon: Icon }) => (
  <Link
    to={to}
    className={`${surface} group flex items-start gap-3 p-4 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-lift)]`}
    style={softRadius}
  >
    <span
      className='grid size-10 shrink-0 place-items-center bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300'
      style={chipRadius}
    >
      <Icon className='size-4' strokeWidth={1.75} />
    </span>
    <span className='min-w-0 flex-1'>
      <span className='block text-[11px] font-medium tracking-[0.06em] text-gray-400 uppercase dark:text-gray-500'>
        {label}
      </span>
      <span className='mt-1 block text-[22px] font-semibold tracking-tight text-gray-900 tabular-nums dark:text-white'>
        {value}
      </span>
      {hint ? (
        <span className='mt-0.5 block text-[11px] text-gray-500 dark:text-gray-400'>
          {hint}
        </span>
      ) : null}
    </span>
    <ArrowRight
      className='mt-1 size-3.5 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-600 dark:text-gray-600 dark:group-hover:text-blue-400'
      strokeWidth={1.75}
    />
  </Link>
)

const SectionCard = ({ title, actionLabel, actionTo, children, empty, className = '' }) => (
  <section
    className={`${surface} p-4 shadow-[var(--shadow-soft)] sm:p-5 ${className}`}
    style={cardRadius}
  >
    <div className='mb-4 flex items-center justify-between gap-3'>
      <h2 className='text-[13px] font-semibold tracking-tight text-gray-900 dark:text-white'>
        {title}
      </h2>
      {actionTo ? (
        <Link
          to={actionTo}
          className='inline-flex items-center gap-1 text-[12px] font-medium text-blue-700 transition-colors hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200'
        >
          {actionLabel}
          <ArrowRight className='size-3' strokeWidth={2} />
        </Link>
      ) : null}
    </div>
    {empty ? (
      <p className='py-8 text-center text-[13px] text-gray-500 dark:text-gray-400'>
        {empty}
      </p>
    ) : (
      children
    )}
  </section>
)

const GuardianHome = ({ data }) => {
  const firstName = data.user?.firstName || 'there'
  const stats = data.stats || {}
  const wards = data.wards || []
  const announcements = data.announcements || []
  const presentRate = stats.presentRate ?? 0

  return (
    <section className='flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-3 py-3 sm:px-4'>
      <div
        className='brand-gradient relative overflow-hidden px-5 py-6 text-white shadow-[var(--shadow-brand)] sm:px-6'
        style={cardRadius}
      >
        <div
          aria-hidden='true'
          className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_45%)]'
        />
        <div className='relative z-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div className='min-w-0'>
            <p className='text-[11px] font-medium tracking-[0.08em] text-white/70 uppercase'>
              {greetingForNow()}
            </p>
            <h1 className='mt-1 text-[26px] font-semibold tracking-tight sm:text-[30px]'>
              {firstName}
            </h1>
            <p className='mt-1.5 max-w-lg text-[13px] text-white/85'>
              A clear view of your {wards.length === 1 ? 'child’s' : 'children’s'}{' '}
              lessons, homework, and attendance.
            </p>
            <div className='mt-4 flex flex-wrap gap-2'>
              <span
                className='inline-flex items-center gap-1.5 bg-white/15 px-3 py-1.5 text-[11px] font-medium text-white ring-1 ring-white/20'
                style={chipRadius}
              >
                <Users className='size-3.5' strokeWidth={1.75} />
                {wards.length} linked {wards.length === 1 ? 'student' : 'students'}
              </span>
              {wards.slice(0, 3).map((ward) => (
                <span
                  key={ward.id}
                  className='inline-flex items-center gap-1.5 bg-white/15 px-3 py-1.5 text-[11px] font-medium text-white ring-1 ring-white/20'
                  style={chipRadius}
                >
                  <GraduationCap className='size-3.5' strokeWidth={1.75} />
                  {ward.name}
                  {ward.className ? ` · ${ward.className}` : ''}
                </span>
              ))}
            </div>
          </div>
          <div className='flex flex-wrap gap-2'>
            <Button to='/dashboard/students' size='sm' variant='secondary' className='bg-white'>
              View students
            </Button>
            <Button
              to='/dashboard/attendance'
              size='sm'
              variant='outline'
              className='border-white/30 text-white hover:bg-white/10'
            >
              Attendance
            </Button>
          </div>
        </div>
      </div>

      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        <StatCard
          label='Linked students'
          value={stats.wards ?? 0}
          hint='In your care'
          to='/dashboard/students'
          icon={Users}
        />
        <StatCard
          label='Upcoming lessons'
          value={stats.upcomingLessons ?? 0}
          hint='Next 14 days'
          to='/dashboard/lessons'
          icon={BookOpen}
        />
        <StatCard
          label='Homework due'
          value={stats.dueHomeworks ?? 0}
          hint={
            stats.overdueHomeworks
              ? `${stats.overdueHomeworks} overdue`
              : 'Looking good'
          }
          to='/dashboard/homeworks'
          icon={ClipboardList}
        />
        <StatCard
          label='Attendance'
          value={`${presentRate}%`}
          hint={
            stats.attendanceTotal
              ? `${stats.attendanceTotal} records`
              : 'No records yet'
          }
          to='/dashboard/attendance'
          icon={CalendarCheck}
        />
      </div>

      <div className='grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)]'>
        <DashboardTimetable
          lessons={demoLessons}
          title='Timetable'
          showMeta={wards.length > 1}
        />

        <SectionCard
          title='Announcements'
          actionLabel='View all'
          actionTo='/dashboard/announcements'
          empty={
            announcements.length === 0
              ? 'No school announcements for guardians right now.'
              : null
          }
        >
          <ul className='space-y-2'>
            {announcements.slice(0, 4).map((item) => {
              const id = item.id || item._id
              const severity = firstOf(item.severity)
              return (
                <li key={id}>
                  <Link
                    to={`/dashboard/announcements/${id}`}
                    className='flex items-start gap-3 bg-gray-50/80 px-3 py-2.5 transition-colors hover:bg-blue-50/70 dark:bg-white/[0.03] dark:hover:bg-blue-500/10'
                    style={chipRadius}
                  >
                    <span
                      className='mt-0.5 grid size-8 shrink-0 place-items-center bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300'
                      style={chipRadius}
                    >
                      <Megaphone className='size-3.5' strokeWidth={1.75} />
                    </span>
                    <span className='min-w-0 flex-1'>
                      <span className='flex flex-wrap items-center gap-2'>
                        <span className='truncate text-[13px] font-semibold text-gray-900 dark:text-white'>
                          {item.title}
                        </span>
                        {severity ? (
                          <span
                            className={`px-2 py-0.5 text-[10px] font-semibold ${severityClass(severity)}`}
                            style={chipRadius}
                          >
                            {formatLabel(severity)}
                          </span>
                        ) : null}
                      </span>
                      <span className='mt-0.5 line-clamp-2 text-[11px] text-gray-500 dark:text-gray-400'>
                        {item.description || formatDay(item.createdAt)}
                      </span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </SectionCard>
      </div>

      <SectionCard
        title='Your students'
        actionLabel='Open directory'
        actionTo='/dashboard/students'
        empty={
          wards.length === 0
            ? 'No students are linked to your guardian account yet.'
            : null
        }
      >
        <ul className='grid gap-2 sm:grid-cols-2 xl:grid-cols-3'>
          {wards.map((ward) => (
            <li key={ward.id}>
              <Link
                to={`/dashboard/students/${ward.id}`}
                className='flex items-center gap-3 bg-gray-50/80 px-3 py-3 transition-colors hover:bg-blue-50/70 dark:bg-white/[0.03] dark:hover:bg-blue-500/10'
                style={chipRadius}
              >
                <span
                  className='size-10 shrink-0 overflow-hidden'
                  style={chipRadius}
                >
                  {ward.photo ? (
                    <img
                      src={ward.photo}
                      alt=''
                      className='!h-full !w-full object-cover'
                    />
                  ) : (
                    <span className='grid !h-full !w-full place-items-center bg-blue-100 text-[11px] font-semibold text-blue-800 dark:bg-blue-500/20 dark:text-blue-300'>
                      {initialsFromName(ward.name)}
                    </span>
                  )}
                </span>
                <span className='min-w-0 flex-1'>
                  <span className='block truncate text-[13px] font-semibold text-gray-900 dark:text-white'>
                    {ward.name}
                  </span>
                  <span className='mt-0.5 flex items-center gap-1 truncate text-[11px] text-gray-500 dark:text-gray-400'>
                    <School className='size-3 shrink-0' strokeWidth={1.75} />
                    {ward.className || 'No class'}
                  </span>
                </span>
                <span className='shrink-0 text-right'>
                  <span className='block text-[13px] font-semibold tabular-nums text-gray-900 dark:text-white'>
                    {ward.presentRate ?? 0}%
                  </span>
                  <span className='block text-[10px] text-gray-400'>present</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </SectionCard>

      <div className='grid gap-4 xl:grid-cols-2'>
        <SectionCard
          title='Upcoming lessons'
          actionLabel='All lessons'
          actionTo='/dashboard/lessons'
          empty={
            !(data.upcomingLessons || []).length
              ? 'No lessons scheduled for your wards in the next two weeks.'
              : null
          }
        >
          <ul className='space-y-2'>
            {(data.upcomingLessons || []).map((lesson) => (
              <li key={lesson.id || lesson._id}>
                <Link
                  to={`/dashboard/lessons/${lesson.id || lesson._id}`}
                  className='flex items-center gap-3 bg-gray-50/80 px-3 py-2.5 transition-colors hover:bg-blue-50/70 dark:bg-white/[0.03] dark:hover:bg-blue-500/10'
                  style={chipRadius}
                >
                  <span className='min-w-0 flex-1'>
                    <span className='block truncate text-[13px] font-semibold text-gray-900 dark:text-white'>
                      {lesson.title}
                    </span>
                    <span className='mt-0.5 block truncate text-[11px] text-gray-500 dark:text-gray-400'>
                      {lesson.className}
                      {lesson.courseName || lesson.subject
                        ? ` · ${lesson.courseName || lesson.subject}`
                        : ''}
                    </span>
                  </span>
                  <span className='shrink-0 text-right text-[11px] text-gray-500 dark:text-gray-400'>
                    <span className='block'>{formatDay(lesson.scheduledAt)}</span>
                    <span className='block'>{formatTime(lesson.scheduledAt)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard
          title='Homework'
          actionLabel='All homework'
          actionTo='/dashboard/homeworks'
          empty={
            !(data.dueHomeworks || []).length
              ? 'No homework due soon for your wards.'
              : null
          }
        >
          <ul className='space-y-2'>
            {(data.dueHomeworks || []).map((homework) => (
              <li key={homework.id || homework._id}>
                <Link
                  to={`/dashboard/homeworks/${homework.id || homework._id}`}
                  className='flex items-center gap-3 bg-gray-50/80 px-3 py-2.5 transition-colors hover:bg-blue-50/70 dark:bg-white/[0.03] dark:hover:bg-blue-500/10'
                  style={chipRadius}
                >
                  <span className='min-w-0 flex-1'>
                    <span className='flex flex-wrap items-center gap-2'>
                      <span className='truncate text-[13px] font-semibold text-gray-900 dark:text-white'>
                        {homework.title}
                      </span>
                      {homework.overdue ? (
                        <span
                          className='bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'
                          style={chipRadius}
                        >
                          Overdue
                        </span>
                      ) : homework.dueSoon ? (
                        <span
                          className='bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
                          style={chipRadius}
                        >
                          Due soon
                        </span>
                      ) : null}
                    </span>
                    <span className='mt-0.5 block truncate text-[11px] text-gray-500 dark:text-gray-400'>
                      {homework.className}
                      {homework.courseName || homework.subject
                        ? ` · ${homework.courseName || homework.subject}`
                        : ''}
                    </span>
                  </span>
                  <span className='shrink-0 text-[11px] text-gray-500 dark:text-gray-400'>
                    {formatDay(homework.dueDate)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      {(stats.openComplaints ?? 0) > 0 ? (
        <SectionCard
          title='Open complaints'
          actionLabel='View all'
          actionTo='/dashboard/complaints'
        >
          <ul className='space-y-2'>
            {(data.openComplaints || []).map((complaint) => (
              <li key={complaint.id}>
                <Link
                  to={`/dashboard/complaints/${complaint.id}`}
                  className='flex items-center gap-3 bg-gray-50/80 px-3 py-2.5 transition-colors hover:bg-blue-50/70 dark:bg-white/[0.03] dark:hover:bg-blue-500/10'
                  style={chipRadius}
                >
                  <MessageSquareWarning
                    className='size-4 shrink-0 text-amber-600 dark:text-amber-300'
                    strokeWidth={1.75}
                  />
                  <span className='min-w-0 flex-1 truncate text-[13px] font-medium text-gray-900 dark:text-white'>
                    {complaint.title}
                  </span>
                  <span className='text-[11px] text-gray-400'>
                    {formatDay(complaint.dateFiled)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </SectionCard>
      ) : null}
    </section>
  )
}

export default GuardianHome

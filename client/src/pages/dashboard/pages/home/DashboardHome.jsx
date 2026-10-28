import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  GraduationCap,
  MessageSquareWarning,
  School,
  UserRound,
} from 'lucide-react'
import { getMyDashboard } from '../../../../lib/dashboard.requests'
import { USER_ROLES } from '../../../../store/slices/uiSlice'
import Button from '../../../../components/Button'
import { STATUS_META } from '../attendance/attendanceUtils'
import AttendanceDonut from '../attendance/components/AttendanceDonut'
import GuardianHome from './GuardianHome'
import TeacherHome from './TeacherHome'
import PublishedTimetable from './PublishedTimetable'

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

const DashboardSkeleton = () => (
  <section
    className='flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-3 py-3 sm:px-4'
    aria-busy='true'
    aria-label='Loading dashboard'
  >
    <div
      className='h-36 animate-pulse bg-gray-200 dark:bg-white/10'
      style={cardRadius}
    />
    <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className='h-24 animate-pulse bg-gray-200 dark:bg-white/10'
          style={softRadius}
        />
      ))}
    </div>
    <div className='grid gap-4 xl:grid-cols-2'>
      <div
        className='h-64 animate-pulse bg-gray-200 dark:bg-white/10'
        style={cardRadius}
      />
      <div
        className='h-64 animate-pulse bg-gray-200 dark:bg-white/10'
        style={cardRadius}
      />
    </div>
  </section>
)

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

const SectionCard = ({ title, actionLabel, actionTo, children, empty }) => (
  <section className={`${surface} p-4 shadow-[var(--shadow-soft)] sm:p-5`} style={cardRadius}>
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

const StudentHome = ({ data }) => {
  const firstName = data.user?.firstName || 'there'
  const profile = data.profile || {}
  const stats = data.stats || {}
  const attendanceSummary = data.attendanceSummary || {
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    total: 0,
    presentRate: 0,
  }

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
              Here is what is coming up for your classes — lessons, homework, and
              how you are showing up.
            </p>
            <div className='mt-4 flex flex-wrap gap-2'>
              {profile.className ? (
                <span
                  className='inline-flex items-center gap-1.5 bg-white/15 px-3 py-1.5 text-[11px] font-medium text-white ring-1 ring-white/20'
                  style={chipRadius}
                >
                  <School className='size-3.5' strokeWidth={1.75} />
                  {profile.className}
                  {profile.classCode ? ` · ${profile.classCode}` : ''}
                </span>
              ) : null}
              {profile.academicYear ? (
                <span
                  className='inline-flex items-center gap-1.5 bg-white/15 px-3 py-1.5 text-[11px] font-medium text-white ring-1 ring-white/20'
                  style={chipRadius}
                >
                  {profile.academicYear}
                </span>
              ) : null}
              {profile.guardian?.name ? (
                <span
                  className='inline-flex items-center gap-1.5 bg-white/15 px-3 py-1.5 text-[11px] font-medium text-white ring-1 ring-white/20'
                  style={chipRadius}
                >
                  <UserRound className='size-3.5' strokeWidth={1.75} />
                  Guardian: {profile.guardian.name}
                </span>
              ) : null}
            </div>
          </div>
          <div className='flex flex-wrap gap-2'>
            <Button to='/dashboard/lessons' size='sm' variant='secondary' className='bg-white'>
              View lessons
            </Button>
            <Button
              to='/dashboard/homeworks'
              size='sm'
              variant='outline'
              className='border-white/30 text-white hover:bg-white/10'
            >
              Homework
            </Button>
          </div>
        </div>
      </div>

      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
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
              : 'On track'
          }
          to='/dashboard/homeworks'
          icon={ClipboardList}
        />
        <StatCard
          label='Attendance'
          value={`${stats.presentRate ?? 0}%`}
          hint={
            stats.attendanceTotal
              ? `${stats.attendanceTotal} recorded`
              : 'No records yet'
          }
          to='/dashboard/attendance'
          icon={CalendarCheck}
        />
        <StatCard
          label='Open complaints'
          value={stats.openComplaints ?? 0}
          hint='Cases still active'
          to='/dashboard/complaints'
          icon={MessageSquareWarning}
        />
      </div>

      <div className='grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)]'>
        <PublishedTimetable title='Timetable' />

        <SectionCard
          title='Attendance'
          actionLabel='Full record'
          actionTo='/dashboard/attendance'
        >
          <AttendanceDonut
            summary={attendanceSummary}
            emptyLabel='Attendance will appear here once your teachers take roll.'
          />
        </SectionCard>
      </div>

      <div className='grid gap-4 xl:grid-cols-2'>
        <SectionCard
          title='Upcoming lessons'
          actionLabel='All lessons'
          actionTo='/dashboard/lessons'
          empty={
            !(data.upcomingLessons || []).length
              ? 'No lessons scheduled in the next two weeks.'
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
                  <span
                    className='grid size-9 shrink-0 place-items-center bg-blue-100 text-[11px] font-semibold text-blue-800 dark:bg-blue-500/20 dark:text-blue-300'
                    style={chipRadius}
                  >
                    {(lesson.courseName || lesson.subject || '?')[0]}
                  </span>
                  <span className='min-w-0 flex-1'>
                    <span className='block truncate text-[13px] font-semibold text-gray-900 dark:text-white'>
                      {lesson.title}
                    </span>
                    <span className='mt-0.5 block truncate text-[11px] text-gray-500 dark:text-gray-400'>
                      {lesson.courseName || lesson.subject}
                      {lesson.teacher ? ` · ${lesson.teacher}` : ''}
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
              ? 'No homework due soon. Enjoy the breathing room.'
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
                      {homework.courseName || homework.subject}
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

      <div className='grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)]'>
        <SectionCard
          title='Recent attendance'
          actionLabel='Full record'
          actionTo='/dashboard/attendance'
          empty={
            !(data.recentAttendance || []).length
              ? 'Attendance will appear here once your teachers take roll.'
              : null
          }
        >
          <ul className='space-y-2'>
            {(data.recentAttendance || []).map((record) => {
              const meta = STATUS_META[record.status] || STATUS_META.present
              return (
                <li
                  key={record.id || record._id}
                  className='flex items-center gap-3 bg-gray-50/80 px-3 py-2.5 dark:bg-white/[0.03]'
                  style={chipRadius}
                >
                  <span
                    className={`grid size-8 shrink-0 place-items-center text-[11px] font-semibold ${meta.className}`}
                    style={chipRadius}
                  >
                    {meta.short}
                  </span>
                  <span className='min-w-0 flex-1'>
                    <span className='block truncate text-[13px] font-medium text-gray-900 dark:text-white'>
                      {record.lessonTitle || 'Lesson'}
                    </span>
                    <span className='mt-0.5 block truncate text-[11px] text-gray-500 dark:text-gray-400'>
                      {record.subject} · {formatDay(record.date || record.scheduledAt)}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 px-2 py-0.5 text-[10px] font-semibold ${meta.className}`}
                    style={chipRadius}
                  >
                    {meta.label}
                  </span>
                </li>
              )
            })}
          </ul>
        </SectionCard>

        <div className='flex flex-col gap-4'>
          <SectionCard title='Your courses'>
            {(data.courses || []).length === 0 ? (
              <p className='py-6 text-center text-[13px] text-gray-500 dark:text-gray-400'>
                No courses linked to your class yet.
              </p>
            ) : (
              <ul className='space-y-2'>
                {(data.courses || []).map((course) => (
                  <li
                    key={course.id || course._id}
                    className='flex items-center gap-3 bg-gray-50/80 px-3 py-2.5 dark:bg-white/[0.03]'
                    style={chipRadius}
                  >
                    <span
                      className='grid size-8 shrink-0 place-items-center bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300'
                      style={chipRadius}
                    >
                      <GraduationCap className='size-3.5' strokeWidth={1.75} />
                    </span>
                    <span className='min-w-0'>
                      <span className='block truncate text-[13px] font-medium text-gray-900 dark:text-white'>
                        {course.courseName}
                      </span>
                      <span className='mt-0.5 block truncate text-[11px] text-gray-500 dark:text-gray-400'>
                        {[course.courseCode, course.className]
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard
            title='Quick links'
          >
            <div className='grid grid-cols-2 gap-2'>
              {[
                { to: '/dashboard/lessons', label: 'Lessons', icon: BookOpen },
                {
                  to: '/dashboard/homeworks',
                  label: 'Homework',
                  icon: ClipboardList,
                },
                {
                  to: '/dashboard/attendance',
                  label: 'Attendance',
                  icon: CalendarCheck,
                },
                {
                  to: '/dashboard/complaints',
                  label: 'Complaints',
                  icon: MessageSquareWarning,
                },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className='flex flex-col items-start gap-2 bg-gray-50/80 px-3 py-3 text-[12px] font-semibold text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-800 dark:bg-white/[0.03] dark:text-gray-200 dark:hover:bg-blue-500/10 dark:hover:text-blue-200'
                    style={chipRadius}
                  >
                    <Icon className='size-4' strokeWidth={1.75} />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </SectionCard>
        </div>
      </div>
    </section>
  )
}

const FallbackHome = ({ data }) => {
  const firstName = data?.user?.firstName || 'there'

  return (
    <section className='flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-3 sm:px-4'>
      <div className={`${surface} px-6 py-12 text-center shadow-[var(--shadow-soft)]`} style={cardRadius}>
        <h1 className='text-[20px] font-semibold tracking-tight text-gray-900 dark:text-white'>
          Welcome, {firstName}
        </h1>
        <p className='mx-auto mt-2 max-w-md text-[13px] text-gray-500 dark:text-gray-400'>
          {data?.message ||
            'Use the sidebar to open lessons, homework, attendance, and more.'}
        </p>
      </div>
    </section>
  )
}

const DashboardHome = () => {
  const userRole = useSelector((state) => state.user.user?.role)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const dashboard = await getMyDashboard()
        if (!cancelled) setData(dashboard)
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load dashboard.')
          setData(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [userRole])

  if (loading) return <DashboardSkeleton />

  if (error) {
    return (
      <section className='flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-3 sm:px-4'>
        <div
          className='bg-red-50 px-4 py-3 text-[13px] text-red-700 dark:bg-red-500/15 dark:text-red-300'
          style={softRadius}
        >
          {error}
        </div>
      </section>
    )
  }

  if (data?.supported && data?.role === USER_ROLES.STUDENT) {
    return <StudentHome data={data} />
  }

  if (
    data?.supported &&
    (data?.role === USER_ROLES.GUARDIAN || data?.role === USER_ROLES.PARENT)
  ) {
    return <GuardianHome data={data} />
  }

  if (data?.supported && data?.role === USER_ROLES.TEACHER) {
    return <TeacherHome data={data} />
  }

  return <FallbackHome data={data} />
}

export default DashboardHome

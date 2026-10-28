import React from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  School,
  Users,
} from 'lucide-react'
import Button from '../../../../components/Button'
import AttendanceDonut from '../attendance/components/AttendanceDonut'
import TeacherTimetableManager from './TeacherTimetableManager'

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

const SectionCard = ({
  title,
  actionLabel,
  actionTo,
  children,
  empty,
  className = '',
}) => (
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

const TeacherHome = ({ data }) => {
  const firstName = data.user?.firstName || 'there'
  const stats = data.stats || {}
  const classes = data.classes || []
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
              Your teaching snapshot — classes, lessons to run, roll to take, and
              homework on the horizon.
            </p>
            <div className='mt-4 flex flex-wrap gap-2'>
              <span
                className='inline-flex items-center gap-1.5 bg-white/15 px-3 py-1.5 text-[11px] font-medium text-white ring-1 ring-white/20'
                style={chipRadius}
              >
                <School className='size-3.5' strokeWidth={1.75} />
                {stats.classes ?? 0}{' '}
                {(stats.classes ?? 0) === 1 ? 'class' : 'classes'}
              </span>
              <span
                className='inline-flex items-center gap-1.5 bg-white/15 px-3 py-1.5 text-[11px] font-medium text-white ring-1 ring-white/20'
                style={chipRadius}
              >
                <Users className='size-3.5' strokeWidth={1.75} />
                {stats.students ?? 0} students
              </span>
              {(stats.needsAttendance ?? 0) > 0 ? (
                <span
                  className='inline-flex items-center gap-1.5 bg-yellow-400/95 px-3 py-1.5 text-[11px] font-semibold text-[#1a1a1a]'
                  style={chipRadius}
                >
                  {stats.needsAttendance} need roll call
                </span>
              ) : null}
            </div>
          </div>
          <div className='flex flex-wrap gap-2'>
            <Button
              to='/dashboard/attendance'
              size='sm'
              variant='secondary'
              className='bg-white'
            >
              Take attendance
            </Button>
            <Button
              to='/dashboard/lessons'
              size='sm'
              variant='outline'
              className='border-white/30 text-white hover:bg-white/10'
            >
              Lessons
            </Button>
          </div>
        </div>
      </div>

      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        <StatCard
          label='Classes'
          value={stats.classes ?? 0}
          hint={`${stats.students ?? 0} students`}
          to='/dashboard/classes'
          icon={School}
        />
        <StatCard
          label='Upcoming lessons'
          value={stats.upcomingLessons ?? 0}
          hint='Next 14 days'
          to='/dashboard/lessons'
          icon={BookOpen}
        />
        <StatCard
          label='Needs attendance'
          value={stats.needsAttendance ?? 0}
          hint='Recent sessions'
          to='/dashboard/attendance'
          icon={CalendarCheck}
        />
        <StatCard
          label='Homework due'
          value={stats.dueHomeworks ?? 0}
          hint={
            stats.overdueHomeworks
              ? `${stats.overdueHomeworks} past due`
              : 'Assigned work'
          }
          to='/dashboard/homeworks'
          icon={ClipboardList}
        />
      </div>

      <div className='grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)]'>
        <TeacherTimetableManager classes={classes} />
        <SectionCard
          title='Attendance'
          actionLabel='Full record'
          actionTo='/dashboard/attendance'
        >
          <AttendanceDonut
            summary={attendanceSummary}
            emptyLabel='Marked attendance for your lessons will show up here.'
          />
        </SectionCard>
      </div>

      {(data.needsAttendance || []).length > 0 ? (
        <SectionCard
          title='Roll call waiting'
          actionLabel='Attendance'
          actionTo='/dashboard/attendance'
        >
          <ul className='space-y-2'>
            {(data.needsAttendance || []).map((lesson) => {
              const lessonId = lesson.id || lesson._id
              const attendance = lesson.attendance || {}
              return (
                <li key={lessonId}>
                  <Link
                    to={`/dashboard/attendance/lessons/${lessonId}`}
                    className='flex items-center gap-3 bg-amber-50/80 px-3 py-2.5 transition-colors hover:bg-amber-100/80 dark:bg-amber-500/10 dark:hover:bg-amber-500/15'
                    style={chipRadius}
                  >
                    <span className='min-w-0 flex-1'>
                      <span className='block truncate text-[13px] font-semibold text-gray-900 dark:text-white'>
                        {lesson.title}
                      </span>
                      <span className='mt-0.5 block truncate text-[11px] text-gray-500 dark:text-gray-400'>
                        {lesson.className}
                        {' · '}
                        {attendance.markedCount || 0}/
                        {attendance.rosterSize || 0} marked
                      </span>
                    </span>
                    <span className='shrink-0 text-right text-[11px] text-gray-500 dark:text-gray-400'>
                      <span className='block'>{formatDay(lesson.scheduledAt)}</span>
                      <span className='block font-medium text-amber-700 dark:text-amber-300'>
                        Take roll
                      </span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </SectionCard>
      ) : null}

      <SectionCard
        title='Your classes'
        actionLabel='All classes'
        actionTo='/dashboard/classes'
        empty={
          classes.length === 0
            ? 'No classes are assigned to you yet.'
            : null
        }
      >
        <ul className='grid gap-2 sm:grid-cols-2 xl:grid-cols-3'>
          {classes.map((classItem) => (
            <li key={classItem.id}>
              <Link
                to={`/dashboard/classes/${classItem.id}`}
                className='flex items-center gap-3 bg-gray-50/80 px-3 py-3 transition-colors hover:bg-blue-50/70 dark:bg-white/[0.03] dark:hover:bg-blue-500/10'
                style={chipRadius}
              >
                <span
                  className='grid size-10 shrink-0 place-items-center bg-blue-100 text-[11px] font-semibold text-blue-800 dark:bg-blue-500/20 dark:text-blue-300'
                  style={chipRadius}
                >
                  {(classItem.classCode || classItem.className || '?')[0]}
                </span>
                <span className='min-w-0 flex-1'>
                  <span className='block truncate text-[13px] font-semibold text-gray-900 dark:text-white'>
                    {classItem.className}
                  </span>
                  <span className='mt-0.5 block truncate text-[11px] text-gray-500 dark:text-gray-400'>
                    {classItem.studentCount} students
                    {classItem.classCode ? ` · ${classItem.classCode}` : ''}
                  </span>
                </span>
                <span className='shrink-0 text-right'>
                  <span className='block text-[13px] font-semibold tabular-nums text-gray-900 dark:text-white'>
                    {classItem.presentRate ?? 0}%
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
              ? 'No homework due in this window.'
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
                          Past due
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
    </section>
  )
}

export default TeacherHome

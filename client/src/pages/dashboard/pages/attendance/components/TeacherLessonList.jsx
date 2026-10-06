import React, { useMemo } from 'react'
import {
  Calendar,
  CheckCircle2,
  Clock,
  GraduationCap,
  CircleDashed,
} from 'lucide-react'
import Button from '../../../../../components/Button'
import {
  STATUS_META,
  cardRadius,
  chipRadius,
  formatDate,
  formatTime,
  surface,
} from '../attendanceUtils'

const markBadge = (attendance) => {
  if (!attendance?.isMarked) {
    return {
      label: 'Not marked',
      className:
        'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300',
      icon: CircleDashed,
    }
  }
  if (attendance.isComplete) {
    return {
      label: 'Complete',
      className:
        'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300',
      icon: CheckCircle2,
    }
  }
  return {
    label: 'Partial',
    className:
      'bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-300',
    icon: Clock,
  }
}

const TeacherLessonList = ({
  lessons = [],
  search = '',
  markFilter = 'All',
}) => {
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()

    return lessons
      .filter((lesson) => {
        const attendance = lesson.attendance || {}
        if (markFilter === 'unmarked' && attendance.isMarked) return false
        if (
          markFilter === 'incomplete' &&
          (!attendance.isMarked || attendance.isComplete)
        ) {
          return false
        }
        if (markFilter === 'complete' && !attendance.isComplete) return false

        if (!q) return true
        const haystack = [
          lesson.title,
          lesson.subject,
          lesson.courseName,
          lesson.className,
          lesson.classCode,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return haystack.includes(q)
      })
      .sort(
        (a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt),
      )
  }, [lessons, search, markFilter])

  if (filtered.length === 0) {
    return (
      <div
        className={`${surface} px-6 py-12 text-center shadow-[var(--shadow-soft)]`}
        style={cardRadius}
      >
        <p className='text-[13px] font-semibold text-gray-900 dark:text-gray-100'>
          {lessons.length === 0 ? 'No lessons yet' : 'No matching lessons'}
        </p>
        <p className='mt-1 text-[13px] text-gray-500 dark:text-gray-400'>
          {lessons.length === 0
            ? 'Create a lesson, then mark attendance for that session.'
            : 'Try a different search or marking filter.'}
        </p>
      </div>
    )
  }

  return (
    <div>
      <p className='mb-3 text-[13px] text-gray-500 dark:text-gray-400'>
        Showing{' '}
        <span className='font-semibold text-gray-800 dark:text-gray-200'>
          {filtered.length}
        </span>{' '}
        {filtered.length === 1 ? 'lesson' : 'lessons'}
      </p>

      <ul className='grid grid-cols-1 gap-3 xl:grid-cols-2'>
        {filtered.map((lesson) => {
          const attendance = lesson.attendance || {}
          const badge = markBadge(attendance)
          const BadgeIcon = badge.icon
          const lessonId = lesson.id || lesson._id

          return (
            <li key={lessonId}>
              <article
                className={`${surface} flex h-full flex-col p-4 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-lift)]`}
                style={cardRadius}
              >
                <div className='flex items-start justify-between gap-3'>
                  <div className='min-w-0'>
                    <h3 className='truncate text-[14px] font-semibold text-gray-900 dark:text-white'>
                      {lesson.title}
                    </h3>
                    <p className='mt-0.5 truncate text-[12px] text-gray-500 dark:text-gray-400'>
                      {lesson.courseName || lesson.subject}
                    </p>
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1 px-2 py-1 text-[11px] font-medium ${badge.className}`}
                    style={chipRadius}
                  >
                    <BadgeIcon className='size-3' strokeWidth={2} />
                    {badge.label}
                  </span>
                </div>

                <div className='mt-3 flex flex-wrap gap-1.5'>
                  <span
                    className='inline-flex items-center gap-1 bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-700 dark:bg-white/10 dark:text-gray-200'
                    style={chipRadius}
                  >
                    <GraduationCap className='size-3' strokeWidth={2} />
                    {lesson.className}
                  </span>
                  <span
                    className='inline-flex items-center gap-1 bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-700 dark:bg-white/10 dark:text-gray-200'
                    style={chipRadius}
                  >
                    <Calendar className='size-3' strokeWidth={2} />
                    {formatDate(lesson.scheduledAt)} ·{' '}
                    {formatTime(lesson.scheduledAt)}
                  </span>
                </div>

                {attendance.isMarked ? (
                  <div className='mt-3 flex flex-wrap gap-2 text-[11px]'>
                    {['present', 'absent', 'late', 'excused'].map((status) => (
                      <span
                        key={status}
                        className={`inline-flex items-center gap-1 px-2 py-1 font-medium ${STATUS_META[status].className}`}
                        style={chipRadius}
                      >
                        <span
                          className={`size-1.5 rounded-full ${STATUS_META[status].dot}`}
                        />
                        {attendance[status] || 0} {STATUS_META[status].short}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className='mt-3 text-[12px] text-gray-500 dark:text-gray-400'>
                    {attendance.rosterSize || 0} students ready for roll call
                  </p>
                )}

                <div className='mt-auto flex items-center justify-between gap-3 pt-4'>
                  <p className='text-[12px] text-gray-400 dark:text-gray-500'>
                    {attendance.markedCount || 0}/
                    {attendance.rosterSize || 0} marked
                  </p>
                  <Button
                    to={`/dashboard/attendance/lessons/${lessonId}`}
                    variant='primary'
                    size='sm'
                  >
                    {attendance.isMarked ? 'Update roll' : 'Take roll'}
                  </Button>
                </div>
              </article>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default TeacherLessonList

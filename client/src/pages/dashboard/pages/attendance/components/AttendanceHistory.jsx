import React, { useMemo } from 'react'
import { Calendar, Clock, GraduationCap } from 'lucide-react'
import Button from '../../../../../components/Button'
import {
  STATUS_META,
  cardRadius,
  chipRadius,
  formatDate,
  formatTime,
  surface,
} from '../attendanceUtils'

const AttendanceHistory = ({
  records = [],
  search = '',
  statusFilter = 'All',
}) => {
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()

    return records
      .filter((record) => {
        if (statusFilter !== 'All' && record.status !== statusFilter) {
          return false
        }
        if (!q) return true
        const haystack = [
          record.lessonTitle,
          record.subject,
          record.className,
          record.studentName,
          record.teacher,
          record.status,
          record.note,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return haystack.includes(q)
      })
      .sort((a, b) => new Date(b.date || b.scheduledAt) - new Date(a.date || a.scheduledAt))
  }, [records, search, statusFilter])

  if (filtered.length === 0) {
    return (
      <div
        className={`${surface} px-6 py-12 text-center shadow-[var(--shadow-soft)]`}
        style={cardRadius}
      >
        <p className='text-[13px] font-semibold text-gray-900 dark:text-gray-100'>
          {records.length === 0 ? 'No attendance yet' : 'No matching records'}
        </p>
        <p className='mt-1 text-[13px] text-gray-500 dark:text-gray-400'>
          {records.length === 0
            ? 'Attendance marked for your lessons will appear here.'
            : 'Try a different search or status filter.'}
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
        {filtered.length === 1 ? 'record' : 'records'}
      </p>

      <ul className='flex flex-col gap-2'>
        {filtered.map((record) => {
          const meta = STATUS_META[record.status] || STATUS_META.present
          const lessonId = record.lessonId

          return (
            <li key={record.id || record._id}>
              <article
                className={`${surface} flex flex-col gap-3 p-3 shadow-[var(--shadow-soft)] sm:flex-row sm:items-center sm:gap-4 sm:px-4`}
                style={cardRadius}
              >
                <span
                  className={`inline-flex size-11 shrink-0 items-center justify-center text-[12px] font-semibold ${meta.className}`}
                  style={chipRadius}
                  title={meta.label}
                >
                  {meta.short}
                </span>

                <div className='min-w-0 flex-1'>
                  <div className='flex flex-wrap items-center gap-x-2 gap-y-0.5'>
                    <h3 className='truncate text-[13px] font-semibold text-gray-900 dark:text-white'>
                      {record.lessonTitle || 'Lesson'}
                    </h3>
                    <span
                      className={`inline-flex px-2 py-0.5 text-[10px] font-medium ${meta.className}`}
                      style={chipRadius}
                    >
                      {meta.label}
                    </span>
                  </div>
                  <p className='mt-0.5 truncate text-[12px] text-gray-500 dark:text-gray-400'>
                    {record.subject}
                    {record.studentName ? ` · ${record.studentName}` : ''}
                  </p>
                  <div className='mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-400 dark:text-gray-500'>
                    <span className='inline-flex items-center gap-1'>
                      <GraduationCap className='size-3' strokeWidth={1.75} />
                      {record.className || '—'}
                    </span>
                    <span className='inline-flex items-center gap-1'>
                      <Calendar className='size-3' strokeWidth={1.75} />
                      {formatDate(record.date || record.scheduledAt)}
                    </span>
                    <span className='inline-flex items-center gap-1'>
                      <Clock className='size-3' strokeWidth={1.75} />
                      {formatTime(record.scheduledAt || record.date)}
                    </span>
                  </div>
                  {record.note ? (
                    <p className='mt-1.5 line-clamp-1 text-[12px] text-gray-500 dark:text-gray-400'>
                      Note: {record.note}
                    </p>
                  ) : null}
                </div>

                {lessonId ? (
                  <Button
                    to={`/dashboard/attendance/lessons/${lessonId}`}
                    variant='secondary'
                    size='sm'
                    className='shrink-0'
                  >
                    View
                  </Button>
                ) : null}
              </article>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default AttendanceHistory

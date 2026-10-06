import React from 'react'
import { ATTENDANCE_STATUSES } from '../../../../../lib/attendance.requests'
import {
  STATUS_META,
  chipRadius,
  initialsFromName,
  softRadius,
  surface,
} from '../attendanceUtils'

const StatusButton = ({ status, active, onClick, disabled }) => {
  const meta = STATUS_META[status]
  return (
    <button
      type='button'
      disabled={disabled}
      onClick={onClick}
      aria-pressed={active}
      title={meta.label}
      className={`min-w-10 px-2.5 py-1.5 text-[11px] font-semibold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:opacity-50 ${
        active
          ? `${meta.className} shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]`
          : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-white/8 dark:text-gray-400 dark:hover:bg-white/12'
      }`}
      style={chipRadius}
    >
      {meta.short}
    </button>
  )
}

const AttendanceRoster = ({
  roster = [],
  drafts = {},
  onStatusChange,
  onNoteChange,
  readOnly = false,
  search = '',
}) => {
  const q = search.trim().toLowerCase()
  const visible = roster.filter((student) => {
    if (!q) return true
    return `${student.name} ${student.firstName} ${student.lastName}`
      .toLowerCase()
      .includes(q)
  })

  if (visible.length === 0) {
    return (
      <div
        className={`${surface} px-6 py-10 text-center`}
        style={softRadius}
      >
        <p className='text-[13px] font-semibold text-gray-900 dark:text-gray-100'>
          {roster.length === 0 ? 'No students in this class' : 'No matching students'}
        </p>
      </div>
    )
  }

  return (
    <ul className='flex flex-col gap-2'>
      {visible.map((student) => {
        const draft = drafts[student.studentId] || {
          status: student.status,
          note: student.note || '',
        }
        const meta = draft.status ? STATUS_META[draft.status] : null

        return (
          <li
            key={student.studentId}
            className={`${surface} p-3 sm:px-4`}
            style={softRadius}
          >
            <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
              <div className='flex min-w-0 flex-1 items-center gap-3'>
                <span
                  className='size-10 shrink-0 overflow-hidden'
                  style={chipRadius}
                >
                  {student.photo ? (
                    <img
                      src={student.photo}
                      alt=''
                      className='!h-full !w-full object-cover'
                    />
                  ) : (
                    <span className='grid !h-full !w-full place-items-center bg-blue-100 text-[11px] font-semibold text-blue-800 dark:bg-blue-500/20 dark:text-blue-300'>
                      {initialsFromName(student.name)}
                    </span>
                  )}
                </span>

                <div className='min-w-0'>
                  <p className='truncate text-[13px] font-semibold text-gray-900 dark:text-white'>
                    {student.name}
                  </p>
                  <p className='mt-0.5 text-[11px] text-gray-400 dark:text-gray-500'>
                    {meta ? meta.label : 'Not marked'}
                  </p>
                </div>
              </div>

              {!readOnly ? (
                <div
                  className='flex flex-wrap items-center gap-1.5'
                  role='group'
                  aria-label={`Mark attendance for ${student.name}`}
                >
                  {ATTENDANCE_STATUSES.map((item) => (
                    <StatusButton
                      key={item.value}
                      status={item.value}
                      active={draft.status === item.value}
                      onClick={() =>
                        onStatusChange(student.studentId, item.value)
                      }
                    />
                  ))}
                </div>
              ) : meta ? (
                <span
                  className={`inline-flex px-2.5 py-1 text-[11px] font-semibold ${meta.className}`}
                  style={chipRadius}
                >
                  {meta.label}
                </span>
              ) : (
                <span className='text-[12px] text-gray-400'>Not marked</span>
              )}
            </div>

            {!readOnly || draft.note ? (
              <div className='mt-3'>
                {readOnly ? (
                  draft.note ? (
                    <p className='text-[12px] text-gray-500 dark:text-gray-400'>
                      Note: {draft.note}
                    </p>
                  ) : null
                ) : (
                  <input
                    type='text'
                    value={draft.note || ''}
                    onChange={(event) =>
                      onNoteChange(student.studentId, event.target.value)
                    }
                    placeholder='Optional note…'
                    maxLength={500}
                    className='form-field w-full px-3 py-2 text-[12px]'
                    style={chipRadius}
                  />
                )}
              </div>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}

export default AttendanceRoster

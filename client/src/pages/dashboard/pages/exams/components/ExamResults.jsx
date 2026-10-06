import React from 'react'
import { Award, ClipboardList } from 'lucide-react'

const chipRadius = { borderRadius: '0.85rem 0.25rem 0.85rem 0.25rem' }
const softRadius = { borderRadius: '0.95rem 0.3rem 0.95rem 0.3rem' }

const initialsFromName = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?'

const ExamResults = ({
  results = [],
  summary = null,
  totalMarks = 0,
  passingMarks = 0,
  emptyHint = 'Scores will appear here once they are recorded.',
}) => {
  if (!results.length) {
    return (
      <div className='py-8 text-center'>
        <p className='text-[13px] font-semibold text-gray-900 dark:text-gray-100'>
          No scores yet
        </p>
        <p className='mt-1 text-[13px] text-gray-500 dark:text-gray-400'>
          {emptyHint}
        </p>
      </div>
    )
  }

  const recorded = results.filter((row) => row.hasResult)

  if (recorded.length === 0) {
    return (
      <div className='py-8 text-center'>
        <p className='text-[13px] font-semibold text-gray-900 dark:text-gray-100'>
          No scores recorded
        </p>
        <p className='mt-1 text-[13px] text-gray-500 dark:text-gray-400'>
          {emptyHint}
        </p>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {summary ? (
        <div className='grid grid-cols-2 gap-2 sm:grid-cols-4'>
          {[
            {
              label: 'Recorded',
              value: `${summary.recordedCount}/${summary.rosterSize}`,
            },
            {
              label: 'Average',
              value: summary.average != null ? summary.average : '—',
            },
            {
              label: 'Pass rate',
              value:
                summary.passRate != null ? `${summary.passRate}%` : '—',
            },
            {
              label: 'Absent',
              value: summary.absentCount ?? 0,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className='bg-gray-50/90 px-3 py-2.5 dark:bg-white/[0.04]'
              style={softRadius}
            >
              <p className='text-[10px] font-medium tracking-[0.06em] text-gray-400 uppercase dark:text-gray-500'>
                {stat.label}
              </p>
              <p className='mt-0.5 text-[15px] font-semibold tabular-nums text-gray-900 dark:text-white'>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      <ul className='space-y-2'>
        {results
          .filter((row) => row.hasResult)
          .map((row) => {
            const passed = row.passed === true
            const failed = row.passed === false

            return (
              <li
                key={row.studentId}
                className='flex items-center gap-3 bg-gray-50/80 px-3 py-2.5 dark:bg-white/[0.03]'
                style={softRadius}
              >
                <span
                  className='size-9 shrink-0 overflow-hidden bg-blue-100 text-[11px] font-semibold text-blue-800 dark:bg-blue-500/20 dark:text-blue-300'
                  style={chipRadius}
                >
                  {row.photo ? (
                    <img
                      src={row.photo}
                      alt=''
                      className='!h-full !w-full object-cover'
                    />
                  ) : (
                    <span className='grid !h-full !w-full place-items-center'>
                      {initialsFromName(row.name)}
                    </span>
                  )}
                </span>

                <div className='min-w-0 flex-1'>
                  <p className='truncate text-[13px] font-semibold text-gray-900 dark:text-white'>
                    {row.name}
                  </p>
                  <p className='mt-0.5 truncate text-[11px] text-gray-500 dark:text-gray-400'>
                    {row.isAbsent
                      ? 'Marked absent'
                      : row.remarks
                        ? row.remarks
                        : row.grade
                          ? `Grade ${row.grade}`
                          : 'Score recorded'}
                  </p>
                </div>

                <div className='shrink-0 text-right'>
                  {row.isAbsent ? (
                    <span
                      className='inline-flex bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
                      style={chipRadius}
                    >
                      Absent
                    </span>
                  ) : (
                    <>
                      <p className='text-[14px] font-semibold tabular-nums text-gray-900 dark:text-white'>
                        {row.marksObtained}
                        <span className='text-[11px] font-medium text-gray-400'>
                          /{totalMarks}
                        </span>
                      </p>
                      <p
                        className={`mt-0.5 text-[11px] font-medium ${
                          passed
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : failed
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-gray-400'
                        }`}
                      >
                        {row.percentage != null ? `${row.percentage}%` : ''}
                        {row.grade ? ` · ${row.grade}` : ''}
                        {passed ? ' · Pass' : failed ? ' · Fail' : ''}
                      </p>
                    </>
                  )}
                </div>
              </li>
            )
          })}
      </ul>

      <p className='flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500'>
        <Award className='size-3' strokeWidth={1.75} />
        Pass mark: {passingMarks}/{totalMarks}
        <span className='mx-1 text-gray-300 dark:text-gray-600'>·</span>
        <ClipboardList className='size-3' strokeWidth={1.75} />
        {recorded.length} scored
      </p>
    </div>
  )
}

export default ExamResults

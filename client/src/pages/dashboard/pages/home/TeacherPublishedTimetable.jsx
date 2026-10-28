import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { getMyTimetables } from '../../../../lib/timetable.requests'
import DashboardTimetable from './DashboardTimetable'
import { toDashboardCalendarLessons } from './timetableCalendar'

const card =
  'border border-gray-200/70 bg-white p-4 shadow-[var(--shadow-soft)] dark:border-white/10 dark:bg-[#0c1528]'
const radius = { borderRadius: '1.6rem 0.45rem 1.6rem 0.45rem' }
const selectClass =
  'form-field min-w-0 rounded-lg px-3 py-2 text-[12px] text-gray-800 dark:text-gray-100'

const TeacherPublishedTimetable = () => {
  const [records, setRecords] = useState([])
  const [academicYear, setAcademicYear] = useState('')
  const [term, setTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      // The teacher-role endpoint returns only entries assigned to this teacher,
      // across the classes the authenticated teacher is authorized to view.
      const response = await getMyTimetables()
      const next = response.timetables || []
      setRecords(next)
      setAcademicYear((current) =>
        next.some((item) => item.academicYear === current)
          ? current
          : next[0]?.academicYear || '',
      )
      setTerm((current) =>
        next.some(
          (item) =>
            item.academicYear === (academicYear || next[0]?.academicYear) &&
            item.term === current,
        )
          ? current
          : next.find(
              (item) =>
                item.academicYear === (academicYear || next[0]?.academicYear),
            )?.term || '',
      )
    } catch (err) {
      setRecords([])
      setError(err.message || 'Could not load your published teaching timetable.')
    } finally {
      setLoading(false)
    }
  }, [academicYear])

  useEffect(() => {
    load()
  }, [load])

  const years = useMemo(
    () => [...new Set(records.map((item) => item.academicYear).filter(Boolean))],
    [records],
  )
  const terms = useMemo(
    () => [
      ...new Set(
        records
          .filter((item) => !academicYear || item.academicYear === academicYear)
          .map((item) => item.term)
          .filter(Boolean),
      ),
    ],
    [records, academicYear],
  )

  const matchingRecords = useMemo(
    () =>
      records.filter(
        (item) =>
          (!academicYear || item.academicYear === academicYear) &&
          (!term || item.term === term),
      ),
    [records, academicYear, term],
  )

  const calendarLessons = useMemo(() => {
    const entries = matchingRecords.flatMap((record) =>
      (record.entries || []).map((entry) => ({
        ...entry,
        classId: record.classId,
        className: record.className,
      })),
    )
    return toDashboardCalendarLessons(entries, matchingRecords)
  }, [matchingRecords])

  if (loading) {
    return (
      <div
        className={`${card} animate-pulse text-[13px] text-gray-400`}
        style={radius}
        aria-busy='true'
      >
        Loading your teaching timetable…
      </div>
    )
  }

  if (error) {
    return (
      <section className={card} style={radius}>
        <h2 className='text-[15px] font-semibold text-gray-900 dark:text-white'>
          My teaching timetable
        </h2>
        <p role='alert' className='mt-2 text-[13px] text-rose-600 dark:text-rose-300'>
          {error}
        </p>
        <button
          type='button'
          onClick={load}
          className='mt-3 inline-flex items-center gap-2 text-[12px] font-semibold text-blue-700 dark:text-blue-300'
        >
          <RefreshCw className='size-3.5' /> Retry
        </button>
      </section>
    )
  }

  if (!records.length) {
    return (
      <section className={`${card} py-8 text-center`} style={radius}>
        <h2 className='text-[15px] font-semibold text-gray-900 dark:text-white'>
          My teaching timetable
        </h2>
        <p className='mt-2 text-[13px] text-gray-500 dark:text-gray-400'>
          No published lessons are assigned to you in your authorized classes.
        </p>
      </section>
    )
  }

  return (
    <div className='min-w-0 space-y-3'>
      <div className={`${card} flex flex-wrap items-end gap-3`} style={radius}>
        <div className='min-w-0 flex-1'>
          <h2 className='text-[15px] font-semibold text-gray-900 dark:text-white'>
            My teaching timetable
          </h2>
          <p className='mt-1 text-[11px] text-gray-500 dark:text-gray-400'>
            Published entries across your authorized classes. Each lesson shows its class.
          </p>
        </div>
        <label className='min-w-36 text-[11px] text-gray-500 dark:text-gray-400'>
          Academic year
          <select
            className={`${selectClass} mt-1 block w-full`}
            value={academicYear}
            onChange={(event) => {
              setAcademicYear(event.target.value)
              const nextYear = event.target.value
              const firstTerm = records.find((item) => item.academicYear === nextYear)?.term || ''
              setTerm(firstTerm)
            }}
          >
            {years.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </label>
        <label className='min-w-32 text-[11px] text-gray-500 dark:text-gray-400'>
          Term
          <select
            className={`${selectClass} mt-1 block w-full`}
            value={term}
            onChange={(event) => setTerm(event.target.value)}
          >
            {terms.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </label>
        <button
          type='button'
          onClick={load}
          className='mb-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-700 dark:text-blue-300'
        >
          <RefreshCw className='size-3.5' /> Refresh
        </button>
      </div>

      {!matchingRecords.length || !calendarLessons.length ? (
        <div className={`${card} py-8 text-center text-[13px] text-gray-500 dark:text-gray-400`} style={radius}>
          No published lessons match this academic year and term.
        </div>
      ) : (
        <DashboardTimetable
          lessons={calendarLessons}
          title='My teaching timetable'
          showMeta
        />
      )}
    </div>
  )
}

export default TeacherPublishedTimetable

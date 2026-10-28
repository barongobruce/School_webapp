import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { getMyTimetables } from '../../../../lib/timetable.requests'
import DashboardTimetable from './DashboardTimetable'
import { toDashboardCalendarLessons } from './timetableCalendar'

const card = 'border border-gray-200/70 bg-white p-4 shadow-[var(--shadow-soft)] dark:border-white/10 dark:bg-[#0c1528]'
const radius = { borderRadius: '1.6rem 0.45rem 1.6rem 0.45rem' }
const selectClass = 'form-field min-w-0 rounded-lg px-3 py-2 text-[12px] text-gray-800 dark:text-gray-100'

const PublishedTimetable = ({ title = 'Timetable', showMeta = false }) => {
  const [records, setRecords] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await getMyTimetables()
      const next = response.timetables || []
      setRecords(next)
      setSelectedId((current) => next.some((item) => item.id === current) ? current : next[0]?.id || '')
    } catch (err) {
      setRecords([])
      setError(err.message || 'Could not load published timetables.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const selected = records.find((item) => item.id === selectedId) || null
  const entries = selected?.entries || []
  const calendarLessons = useMemo(
    () => toDashboardCalendarLessons(
      entries.map((entry) => ({ ...entry, classId: selected?.classId, className: selected?.className })),
      selected ? [selected] : [],
    ),
    [entries, selected],
  )

  if (loading) {
    return <div className={`${card} animate-pulse text-[13px] text-gray-400`} style={radius} aria-busy='true'>Loading timetable…</div>
  }
  if (error) {
    return (
      <section className={card} style={radius}>
        <h2 className='text-[15px] font-semibold text-gray-900 dark:text-white'>{title}</h2>
        <p role='alert' className='mt-2 text-[13px] text-rose-600 dark:text-rose-300'>{error}</p>
        <button type='button' onClick={load} className='mt-3 inline-flex items-center gap-2 text-[12px] font-semibold text-blue-700 dark:text-blue-300'>
          <RefreshCw className='size-3.5' /> Retry
        </button>
      </section>
    )
  }
  if (!records.length) {
    return (
      <section className={`${card} py-10 text-center`} style={radius}>
        <h2 className='text-[15px] font-semibold text-gray-900 dark:text-white'>{title}</h2>
        <p className='mt-2 text-[13px] text-gray-500 dark:text-gray-400'>No published timetable is available for your class yet.</p>
      </section>
    )
  }

  return (
    <div className='min-w-0 space-y-3'>
      <div className={`${card} flex flex-wrap items-end gap-3`} style={radius}>
        <label className='min-w-44 flex-1 text-[11px] font-medium text-gray-500 dark:text-gray-400'>
          Class / term
          <select className={`${selectClass} mt-1 block w-full`} value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
            {records.map((item) => (
              <option key={item.id} value={item.id}>{item.className} · {item.academicYear} · {item.term}</option>
            ))}
          </select>
        </label>
        {selected ? <p className='pb-2 text-[11px] text-gray-500 dark:text-gray-400'>Published {new Date(selected.publishedAt).toLocaleDateString()}</p> : null}
        <button type='button' onClick={load} className='mb-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-700 dark:text-blue-300'><RefreshCw className='size-3.5' /> Refresh</button>
      </div>
      {selected ? (
        <div className={`${card} grid gap-2 text-[12px] sm:grid-cols-2`} style={radius}>
          <p><b>Class:</b> {selected.className} {selected.classCode ? `· ${selected.classCode}` : ''}</p>
          <p><b>Class teacher:</b> {selected.classTeacherName || 'Not designated'}</p>
          <p><b>Students:</b> {selected.studentCount ?? '—'}</p>
          <p><b>Academic year / term:</b> {selected.academicYear} · {selected.term}</p>
          <p className='sm:col-span-2'><b>Subjects:</b> {(selected.classCourses || []).map((item) => item.courseName).filter(Boolean).join(', ') || '—'}</p>
        </div>
      ) : null}
      <DashboardTimetable lessons={calendarLessons} title={title} showMeta={showMeta || records.length > 1} />
    </div>
  )
}

export default PublishedTimetable

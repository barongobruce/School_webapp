import React, { useEffect, useMemo, useState } from 'react'
import { getAdminTimetables } from '../../../lib/timetable.requests'

const box = 'border border-gray-200/70 bg-white p-5 dark:border-white/10 dark:bg-[#0c1528]'
const radius = { borderRadius: '1.5rem 0.5rem 1.5rem 0.5rem' }
const field = 'form-field rounded-lg px-3 py-2 text-[12px] dark:text-gray-100'

const AdminTeacherTimetable = ({ teacherId }) => {
  const [records, setRecords] = useState([])
  const [academicYear, setAcademicYear] = useState('')
  const [term, setTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let live = true
    setLoading(true); setError('')
    getAdminTimetables({ teacherId, ...(academicYear ? { academicYear } : {}), ...(term ? { term } : {}) })
      .then((data) => { if (live) setRecords(data.timetables || []) })
      .catch((err) => { if (live) { setRecords([]); setError(err.message || 'Could not load teacher timetable.') } })
      .finally(() => { if (live) setLoading(false) })
    return () => { live = false }
  }, [teacherId, academicYear, term])

  const years = useMemo(() => [...new Set(records.map((item) => item.academicYear).filter(Boolean))], [records])
  const terms = useMemo(() => [...new Set(records.map((item) => item.term).filter(Boolean))], [records])

  return (
    <section className={`${box} space-y-4`} style={radius}>
      <div><h2 className='text-[14px] font-semibold text-gray-900 dark:text-white'>Teaching timetable</h2><p className='mt-1 text-[11px] text-gray-500 dark:text-gray-400'>Derived from published class timetable entries; view only.</p></div>
      <div className='grid gap-3 sm:grid-cols-2'>
        <label className='text-[11px] text-gray-500'>Academic year<select className={`${field} mt-1 block w-full`} value={academicYear} onChange={(e) => setAcademicYear(e.target.value)}><option value=''>All years</option>{years.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label className='text-[11px] text-gray-500'>Term<select className={`${field} mt-1 block w-full`} value={term} onChange={(e) => setTerm(e.target.value)}><option value=''>All terms</option>{terms.map((value) => <option key={value}>{value}</option>)}</select></label>
      </div>
      {error ? <p role='alert' className='text-[13px] text-rose-600'>{error}</p> : null}
      {loading ? <p className='text-[12px] text-gray-500'>Loading teacher timetable…</p> : null}
      {!loading && !error && !records.length ? <p className='text-[12px] text-gray-500'>No published timetable entries are assigned to this teacher.</p> : null}
      <div className='space-y-4'>{records.map((item) => <article key={item.id} className='border-t border-gray-100 pt-3 dark:border-white/10'><h3 className='mb-2 text-[12px] font-semibold'>{item.className} · {item.academicYear} · {item.term}</h3><ul className='grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>{item.publishedEntries.map((entry) => <li key={entry.id} className='rounded-lg bg-gray-50 px-3 py-2 text-[12px] dark:bg-white/5'><b>{entry.dayOfWeek} {entry.startTime}–{entry.endTime}</b><span className='block'>{entry.courseName}</span><span className='block text-gray-500'>{item.className}{entry.room ? ` · ${entry.room}` : ''}</span></li>)}</ul></article>)}</div>
    </section>
  )
}

export default AdminTeacherTimetable

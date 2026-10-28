import React, { useEffect, useMemo, useState } from 'react'
import { getClasses } from '../../../lib/class.requests'
import { getAdminTimetables } from '../../../lib/timetable.requests'

const surface = 'border border-gray-200/70 bg-white p-5 dark:border-white/10 dark:bg-[#0c1528]'
const radius = { borderRadius: '1.5rem 0.5rem 1.5rem 0.5rem' }
const field = 'form-field rounded-lg px-3 py-2 text-[12px] dark:text-gray-100'

const AdminTimetableViewer = ({ initialClassId = '' }) => {
  const [classes, setClasses] = useState([])
  const [classId, setClassId] = useState(initialClassId)
  const [records, setRecords] = useState([])
  const [academicYear, setAcademicYear] = useState('')
  const [term, setTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let live = true
    getClasses().then((data) => {
      if (!live) return
      const list = data.classes || []
      setClasses(list)
      setClassId((old) => old || initialClassId || String(list[0]?._id || ''))
    }).catch((err) => { if (live) setError(err.message) })
    return () => { live = false }
  }, [initialClassId])

  useEffect(() => {
    let live = true
    const load = async () => {
      setLoading(true); setError('')
      try {
        const data = await getAdminTimetables({
          ...(classId ? { classId } : {}),
          ...(academicYear ? { academicYear } : {}),
          ...(term ? { term } : {}),
        })
        if (live) setRecords(data.timetables || [])
      } catch (err) { if (live) { setRecords([]); setError(err.message || 'Could not load timetables.') } }
      finally { if (live) setLoading(false) }
    }
    load()
    return () => { live = false }
  }, [classId, academicYear, term])

  const selectedClass = classes.find((item) => String(item._id || item.id) === classId)
  const subjects = useMemo(() => selectedClass?.courses || [], [selectedClass])

  return (
    <section className={`${surface} space-y-4`} style={radius}>
      <div><h2 className='text-[14px] font-semibold text-gray-900 dark:text-white'>Class timetables</h2><p className='mt-1 text-[11px] text-gray-500 dark:text-gray-400'>Read-only view. Admins cannot edit or publish schedules.</p></div>
      <div className='grid gap-3 sm:grid-cols-3'>
        <label className='text-[11px] text-gray-500'>Class<select className={`${field} mt-1 block w-full`} value={classId} onChange={(e) => setClassId(e.target.value)}><option value=''>All classes</option>{classes.map((item) => <option key={item._id || item.id} value={item._id || item.id}>{item.className} · {item.classCode}</option>)}</select></label>
        <label className='text-[11px] text-gray-500'>Academic year<input className={`${field} mt-1 block w-full`} value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} placeholder='All years' /></label>
        <label className='text-[11px] text-gray-500'>Term<input className={`${field} mt-1 block w-full`} value={term} onChange={(e) => setTerm(e.target.value)} placeholder='All terms' /></label>
      </div>
      {selectedClass ? <div className='grid gap-1 text-[12px] sm:grid-cols-2'><p><b>Class teacher:</b> {selectedClass.classTeacher?.user ? `${selectedClass.classTeacher.user.firstName || ''} ${selectedClass.classTeacher.user.lastName || ''}`.trim() : 'Not designated'}</p><p><b>Students:</b> {selectedClass.students?.length ?? '—'}</p><p><b>Academic year:</b> {selectedClass.academicYear || '—'}</p><p><b>Subjects:</b> {subjects.map((item) => item.courseName).filter(Boolean).join(', ') || '—'}</p></div> : null}
      {error ? <p role='alert' className='text-[13px] text-rose-600'>{error}</p> : null}
      {loading ? <p className='text-[12px] text-gray-500'>Loading timetables…</p> : null}
      {!loading && !error && !records.length ? <p className='text-[12px] text-gray-500'>No timetable records match these filters.</p> : null}
      <div className='space-y-4'>
        {records.map((item) => (
          <article key={item.id} className='border-t border-gray-100 pt-3 dark:border-white/10'>
            <header className='mb-2 flex flex-wrap justify-between gap-2 text-[12px]'><b>{item.className} · {item.academicYear} · {item.term}</b><span>{item.isPublished ? `Published ${new Date(item.publishedAt).toLocaleDateString()}` : 'Draft only — not published'}</span></header>
            {item.publishedEntries?.length ? <ul className='grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>{item.publishedEntries.map((entry) => <li key={entry.id} className='rounded-lg bg-gray-50 px-3 py-2 text-[12px] dark:bg-white/5'><b>{entry.dayOfWeek} {entry.startTime}–{entry.endTime}</b><span className='block'>{entry.courseName || entry.label || entry.slotType}</span><span className='block text-gray-500'>{entry.teacherName}{entry.room ? ` · ${entry.room}` : ''}</span></li>)}</ul> : <p className='text-[12px] text-gray-500'>No published entries.</p>}
            {item.draftEntries?.length ? <p className='mt-2 text-[11px] text-amber-700 dark:text-amber-300'>Unpublished draft exists ({item.draftEntries.length} entries); this admin view is read-only.</p> : null}
          </article>
        ))}
      </div>
    </section>
  )
}

export default AdminTimetableViewer
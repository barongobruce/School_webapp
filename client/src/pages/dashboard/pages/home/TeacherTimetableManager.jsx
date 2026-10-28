import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, RefreshCw, Save, Send, Trash2 } from 'lucide-react'
import DashboardTimetable from './DashboardTimetable'
import TeacherPublishedTimetable from './TeacherPublishedTimetable'
import {
  getTeacherTimetable,
  publishTeacherTimetable,
  saveTeacherTimetableDraft,
} from '../../../../lib/timetable.requests'
import { toDashboardCalendarLessons } from './timetableCalendar'

const card =
  'border border-gray-200/70 bg-white p-4 shadow-[var(--shadow-soft)] dark:border-white/10 dark:bg-[#0c1528]'
const radius = { borderRadius: '1.6rem 0.45rem 1.6rem 0.45rem' }
const control =
  'form-field w-full rounded-lg px-3 py-2 text-[12px] text-gray-800 dark:text-gray-100'
const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
const emptyEntry = () => ({
  dayOfWeek: 'monday',
  startTime: '08:00',
  endTime: '08:45',
  slotType: 'lesson',
  label: '',
  courseId: '',
  teacherId: '',
  room: '',
})
const errorText = (error) => error.message || 'Request failed.'

const TeacherTimetableManager = ({ classes = [] }) => {
  const [classId, setClassId] = useState('')
  const selectedClass = classes.find(
    (item) => String(item.id || item._id) === classId,
  )
  const [academicYear, setAcademicYear] = useState('')
  const [term, setTerm] = useState('term 1')
  const [record, setRecord] = useState(null)
  const [classInfo, setClassInfo] = useState(null)
  const [availableCourses, setAvailableCourses] = useState([])
  const [entries, setEntries] = useState([])
  const [form, setForm] = useState(emptyEntry())
  const [editingKey, setEditingKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [forbidden, setForbidden] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [conflicts, setConflicts] = useState([])

  useEffect(() => {
    if (!classes.length) return
    setClassId((current) => current || String(classes[0].id || classes[0]._id))
  }, [classes])

  useEffect(() => {
    if (selectedClass) setAcademicYear(selectedClass.academicYear || '')
  }, [selectedClass?.id, selectedClass?._id, selectedClass?.academicYear])

  const load = useCallback(async () => {
    setClassInfo(null)
    setRecord(null)
    setEntries([])
    setAvailableCourses([])
    setForbidden(false)
    setError('')
    setMessage('')
    setConflicts([])

    if (!classId || !academicYear.trim() || !term.trim()) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const response = await getTeacherTimetable(classId, {
        academicYear: academicYear.trim(),
        term: term.trim(),
      })
      setClassInfo(response.class)
      setRecord(response.timetable)
      setAvailableCourses(response.class?.availableCourses || [])
      setEntries(response.timetable?.draftEntries || [])
      setForm(emptyEntry())
      setEditingKey('')
    } catch (err) {
      const isForbidden = err.status === 403
      setForbidden(isForbidden)
      setError(
        isForbidden
          ? `${errorText(err)} Editing controls are hidden because the server denied access.`
          : errorText(err),
      )
    } finally {
      setLoading(false)
    }
  }, [classId, academicYear, term])

  useEffect(() => {
    load()
  }, [load])

  const calendarLessons = useMemo(() => {
    const displayEntries = entries.map((entry) => {
      const course = availableCourses.find(
        (item) => String(item.id) === String(entry.courseId),
      )
      const teacher = course?.teachers?.find(
        (item) => String(item.id) === String(entry.teacherId),
      )
      return {
        ...entry,
        courseName: entry.courseName || course?.courseName || '',
        teacherName: entry.teacherName || teacher?.name || '',
        classId,
        className: selectedClass?.className || classInfo?.className || '',
      }
    })
    return toDashboardCalendarLessons(
      displayEntries,
      [
        {
          classId,
          className: selectedClass?.className || classInfo?.className || '',
        },
      ],
    )
  }, [entries, availableCourses, classId, selectedClass, classInfo])

  const selectedCourse = availableCourses.find(
    (item) => String(item.id) === String(form.courseId),
  )
  const courseTeachers = selectedCourse?.teachers || []

  const submitEntry = (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (form.slotType === 'lesson' && (!form.courseId || !form.teacherId)) {
      setError('Choose an assigned course and an eligible teacher.')
      return
    }

    const entry = {
      ...form,
      label: form.slotType === 'lesson' ? '' : form.label.trim(),
      courseId: form.slotType === 'lesson' ? form.courseId : '',
      teacherId: form.slotType === 'lesson' ? form.teacherId : '',
    }

    if (editingKey) {
      setEntries((current) =>
        current.map((item) =>
          String(item.id || item.clientKey) === editingKey
            ? { ...entry, id: item.id, clientKey: item.clientKey }
            : item,
        ),
      )
    } else {
      setEntries((current) => [
        ...current,
        { ...entry, clientKey: `local-${Date.now()}-${Math.random()}` },
      ])
    }
    setForm(emptyEntry())
    setEditingKey('')
  }

  const editEntry = (entry) => {
    setEditingKey(String(entry.id || entry.clientKey || ''))
    setForm({
      dayOfWeek: entry.dayOfWeek,
      startTime: entry.startTime,
      endTime: entry.endTime,
      slotType: entry.slotType || 'lesson',
      label: entry.label || '',
      courseId: entry.courseId || '',
      teacherId: entry.teacherId || '',
      room: entry.room || '',
    })
  }

  const saveDraft = async () => {
    setBusy(true)
    setError('')
    setMessage('')
    setConflicts([])
    try {
      const response = await saveTeacherTimetableDraft(classId, {
        academicYear: academicYear.trim(),
        term: term.trim(),
        entries,
      })
      setRecord(response.timetable)
      setEntries(response.timetable?.draftEntries || entries)
      setConflicts(response.teacherConflictWarnings || [])
      setMessage(response.message || 'Draft saved; viewers still see the published timetable.')
    } catch (err) {
      if (err.status === 403) {
        setForbidden(true)
        setClassInfo(null)
      }
      setError(errorText(err))
    } finally {
      setBusy(false)
    }
  }

  const publish = async () => {
    if (!window.confirm('Publish this timetable? Students and guardians will see the new published version.')) return
    setBusy(true)
    setError('')
    setMessage('')
    setConflicts([])
    try {
      // Persist the currently displayed edits first. If publication validation
      // fails, the previous published snapshot remains the public version.
      const saved = await saveTeacherTimetableDraft(classId, {
        academicYear: academicYear.trim(),
        term: term.trim(),
        entries,
      })
      setRecord(saved.timetable)
      setConflicts(saved.teacherConflictWarnings || [])
      const response = await publishTeacherTimetable(classId, {
        academicYear: academicYear.trim(),
        term: term.trim(),
      })
      setRecord(response.timetable)
      setEntries(response.timetable?.draftEntries || entries)
      setMessage(response.message || 'Timetable published.')
    } catch (err) {
      if (err.status === 403) {
        setForbidden(true)
        setClassInfo(null)
      }
      setError(errorText(err))
    } finally {
      setBusy(false)
    }
  }

  if (!classes.length) {
    return (
      <section className={card} style={radius}>
        <h2 className='text-[15px] font-semibold text-gray-900 dark:text-white'>
          Class timetable
        </h2>
        <p className='mt-2 text-[13px] text-gray-500 dark:text-gray-400'>
          No assigned classes are available for timetable management.
        </p>
        <TeacherPublishedTimetable />
      </section>
    )
  }

  return (
    <section className='min-w-0 space-y-3'>
      <div className={`${card} space-y-3`} style={radius}>
        <div>
          <h2 className='text-[15px] font-semibold text-gray-900 dark:text-white'>
            Class timetable editor
          </h2>
          <p className='mt-1 text-[11px] text-gray-500 dark:text-gray-400'>
            Only the designated class teacher can edit or publish. Drafts stay private.
          </p>
        </div>

        <div className='grid gap-3 sm:grid-cols-3'>
          <label className='text-[11px] text-gray-500 dark:text-gray-400'>
            Class
            <select className={`${control} mt-1`} value={classId} onChange={(event) => setClassId(event.target.value)}>
              {classes.map((item) => (
                <option key={item.id || item._id} value={item.id || item._id}>
                  {item.className} · {item.classCode || ''}
                </option>
              ))}
            </select>
          </label>
          <label className='text-[11px] text-gray-500 dark:text-gray-400'>
            Academic year
            <input className={`${control} mt-1`} maxLength={20} value={academicYear} onChange={(event) => setAcademicYear(event.target.value)} placeholder='e.g. 2025/2026' />
          </label>
          <label className='text-[11px] text-gray-500 dark:text-gray-400'>
            Term (free text; no term catalogue exists)
            <input className={`${control} mt-1`} maxLength={50} value={term} onChange={(event) => setTerm(event.target.value)} placeholder='e.g. Term 1' />
          </label>
        </div>

        <button type='button' onClick={load} disabled={loading} className='inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-2 text-[12px] font-semibold text-gray-700 dark:bg-white/10 dark:text-gray-100'>
          <RefreshCw className='size-3.5' /> Reload authorization and timetable
        </button>

        {loading ? <p role='status' className='text-[12px] text-gray-500'>Checking timetable access…</p> : null}
        {error ? <p role='alert' className={`text-[13px] ${forbidden ? 'text-amber-700 dark:text-amber-300' : 'text-rose-600 dark:text-rose-300'}`}>{error}</p> : null}
        {message ? <p role='status' className='text-[12px] text-emerald-700 dark:text-emerald-300'>{message}</p> : null}
        {record?.publishedAt ? <p className='text-[11px] text-emerald-700 dark:text-emerald-300'>Published{record.hasUnpublishedChanges ? ' · draft changes pending' : ' · up to date'}</p> : null}
        {conflicts.length ? <p role='alert' className='text-[12px] text-amber-800 dark:text-amber-200'>Draft warning(s): {conflicts.map((item) => `${item.className} ${item.dayOfWeek} ${item.startTime}–${item.endTime}`).join('; ')}. Resolve before publishing.</p> : null}
      </div>

      {classInfo && !loading && !forbidden ? (
        <>
          <div className={`${card} grid gap-2 text-[12px] sm:grid-cols-2`} style={radius}>
            <p><b>Class:</b> {classInfo.className}</p>
            <p><b>Class teacher:</b> You (authorized by the server)</p>
            <p><b>Students:</b> {classInfo.studentCount ?? selectedClass?.studentCount ?? '—'}</p>
            <p><b>Academic year / term:</b> {academicYear} · {term}</p>
            <p className='sm:col-span-2'><b>Subjects:</b> {availableCourses.map((item) => item.courseName).filter(Boolean).join(', ') || '—'}</p>
          </div>

          <DashboardTimetable lessons={calendarLessons} title='Timetable draft preview' showMeta />

          <div className={`${card} space-y-4`} style={radius}>
            <h3 className='text-[14px] font-semibold text-gray-900 dark:text-white'>
              {editingKey ? 'Edit slot' : 'Add lesson, break, or lunch'}
            </h3>
            <form onSubmit={submitEntry} className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
              <label className='text-[11px] text-gray-500'>Day
                <select className={`${control} mt-1`} value={form.dayOfWeek} onChange={(event) => setForm({ ...form, dayOfWeek: event.target.value })}>
                  {days.map((day) => <option key={day} value={day}>{day[0].toUpperCase() + day.slice(1)}</option>)}
                </select>
              </label>
              <label className='text-[11px] text-gray-500'>Type
                <select className={`${control} mt-1`} value={form.slotType} onChange={(event) => setForm({ ...form, slotType: event.target.value, courseId: '', teacherId: '' })}>
                  <option value='lesson'>Lesson</option><option value='break'>Break</option><option value='lunch'>Lunch</option>
                </select>
              </label>
              <label className='text-[11px] text-gray-500'>Start
                <input className={`${control} mt-1`} type='time' required value={form.startTime} onChange={(event) => setForm({ ...form, startTime: event.target.value })} />
              </label>
              <label className='text-[11px] text-gray-500'>End
                <input className={`${control} mt-1`} type='time' required value={form.endTime} onChange={(event) => setForm({ ...form, endTime: event.target.value })} />
              </label>

              {form.slotType === 'lesson' ? (
                <>
                  <label className='text-[11px] text-gray-500'>Course
                    <select className={`${control} mt-1`} required value={form.courseId} onChange={(event) => setForm({ ...form, courseId: event.target.value, teacherId: '' })}>
                      <option value=''>Select course</option>
                      {availableCourses.map((course) => <option key={course.id} value={course.id}>{course.courseName}{course.courseCode ? ` · ${course.courseCode}` : ''}</option>)}
                    </select>
                  </label>
                  <label className='text-[11px] text-gray-500'>Course teacher
                    <select className={`${control} mt-1`} required value={form.teacherId} onChange={(event) => setForm({ ...form, teacherId: event.target.value })}>
                      <option value=''>Select eligible teacher</option>
                      {courseTeachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}
                    </select>
                  </label>
                </>
              ) : (
                <label className='text-[11px] text-gray-500'>Label
                  <input className={`${control} mt-1`} maxLength={100} value={form.label} onChange={(event) => setForm({ ...form, label: event.target.value })} placeholder={form.slotType === 'lunch' ? 'Lunch' : 'Break'} />
                </label>
              )}

              <label className='text-[11px] text-gray-500'>Room / location
                <input className={`${control} mt-1`} maxLength={100} value={form.room} onChange={(event) => setForm({ ...form, room: event.target.value })} />
              </label>
              <div className='flex flex-wrap items-end gap-2'>
                <button type='submit' className='inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-3 py-2 text-[12px] font-semibold text-white'>
                  <Plus className='size-3.5' /> {editingKey ? 'Apply changes' : 'Add slot'}
                </button>
                {editingKey ? <button type='button' onClick={() => { setEditingKey(''); setForm(emptyEntry()) }} className='px-2 py-2 text-[12px]'>Cancel</button> : null}
              </div>
            </form>

            <div className='space-y-2'>
              {!entries.length ? <p className='text-[12px] text-gray-500'>No draft entries. Add valid slots; no sample lessons are shown.</p> : null}
              {entries.map((entry, index) => {
                const course = availableCourses.find((item) => String(item.id) === String(entry.courseId))
                const teacher = course?.teachers?.find((item) => String(item.id) === String(entry.teacherId))
                return (
                  <div key={entry.id || entry.clientKey || `${entry.dayOfWeek}-${entry.startTime}-${index}`} className='flex flex-wrap items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-[12px] dark:bg-white/5'>
                    <span className='min-w-28 font-semibold'>{entry.dayOfWeek} · {entry.startTime}–{entry.endTime}</span>
                    <span className='min-w-0 flex-1'>{entry.courseName || course?.courseName || entry.label || entry.slotType}{entry.teacherName || teacher?.name ? ` · ${entry.teacherName || teacher.name}` : ''}{entry.room ? ` · ${entry.room}` : ''}</span>
                    <button type='button' aria-label='Edit slot' onClick={() => editEntry(entry)} className='p-1 text-blue-700 dark:text-blue-300'><Pencil className='size-4' /></button>
                    <button type='button' aria-label='Remove slot' onClick={() => setEntries((current) => current.filter((_, currentIndex) => currentIndex !== index))} className='p-1 text-rose-600'><Trash2 className='size-4' /></button>
                  </div>
                )
              })}
            </div>

            <div className='flex flex-wrap gap-2 border-t border-gray-100 pt-3 dark:border-white/10'>
              <button type='button' disabled={busy || loading} onClick={saveDraft} className='inline-flex items-center gap-1.5 rounded-lg bg-gray-800 px-3 py-2 text-[12px] font-semibold text-white disabled:opacity-50 dark:bg-white/15'>
                <Save className='size-3.5' /> Save draft
              </button>
              <button type='button' disabled={busy || loading || !record} onClick={publish} className='inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-3 py-2 text-[12px] font-semibold text-white disabled:opacity-50'>
                <Send className='size-3.5' /> Publish
              </button>
            </div>
            <p className='text-[11px] text-gray-500'>Saving changes the private draft only. The server validates course/class teacher assignments and conflicts, and revalidates before publishing.</p>
          </div>
        </>
      ) : null}

      <TeacherPublishedTimetable />
    </section>
  )
}

export default TeacherTimetableManager

import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  ArrowLeft,
  Calendar,
  CheckCheck,
  Clock,
  GraduationCap,
  Save,
} from 'lucide-react'
import {
  getLessonAttendanceRoster,
  getMyLessonAttendance,
  saveLessonAttendance,
} from '../../../../lib/attendance.requests'
import { USER_ROLES } from '../../../../store/slices/uiSlice'
import Button from '../../../../components/Button'
import AttendanceRoster from './components/AttendanceRoster'
import AttendanceSummary from './components/AttendanceSummary'
import {
  cardRadius,
  formatDateLong,
  formatTime,
  softRadius,
  surface,
} from './attendanceUtils'

const AttendanceSessionSkeleton = () => (
  <section
    className='flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-3 py-3 sm:px-4'
    aria-busy='true'
  >
    <div className='h-4 w-36 animate-pulse rounded bg-gray-200 dark:bg-white/10' />
    <div
      className='h-36 animate-pulse bg-gray-200 dark:bg-white/10'
      style={cardRadius}
    />
    <div
      className='h-56 animate-pulse bg-gray-200 dark:bg-white/10'
      style={cardRadius}
    />
  </section>
)

const AttendanceSession = () => {
  const { lessonId } = useParams()
  const userRole = useSelector((state) => state.user.user?.role)
  const isTeacher = userRole === USER_ROLES.TEACHER

  const [lesson, setLesson] = useState(null)
  const [roster, setRoster] = useState([])
  const [records, setRecords] = useState([])
  const [summary, setSummary] = useState(null)
  const [drafts, setDrafts] = useState({})
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError('')
      setSuccess('')

      try {
        if (isTeacher) {
          const data = await getLessonAttendanceRoster(lessonId)
          if (cancelled) return
          setLesson(data.lesson)
          setRoster(data.roster || [])
          setSummary(data.summary)
          const nextDrafts = {}
          ;(data.roster || []).forEach((student) => {
            nextDrafts[student.studentId] = {
              status: student.status || null,
              note: student.note || '',
            }
          })
          setDrafts(nextDrafts)
        } else {
          const data = await getMyLessonAttendance(lessonId)
          if (cancelled) return
          setLesson(data.lesson)
          setRecords(data.records || [])
          setSummary(data.summary)
          setRoster(
            (data.records || []).map((record) => ({
              studentId: record.studentId,
              name: record.studentName,
              photo: record.studentPhoto,
              status: record.status,
              note: record.note,
            })),
          )
        }
      } catch (err) {
        if (!cancelled) {
          setLesson(null)
          setError(err.message || 'Failed to load attendance.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [lessonId, isTeacher])

  const dirtyCount = useMemo(() => {
    if (!isTeacher) return 0
    return roster.filter((student) => {
      const draft = drafts[student.studentId]
      if (!draft?.status) return false
      return (
        draft.status !== student.status ||
        (draft.note || '') !== (student.note || '')
      )
    }).length
  }, [drafts, roster, isTeacher])

  const handleStatusChange = (studentId, status) => {
    setDrafts((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
        note: prev[studentId]?.note || '',
      },
    }))
    setSuccess('')
  }

  const handleNoteChange = (studentId, note) => {
    setDrafts((prev) => ({
      ...prev,
      [studentId]: {
        status: prev[studentId]?.status || null,
        note,
      },
    }))
    setSuccess('')
  }

  const markAllPresent = () => {
    setDrafts((prev) => {
      const next = { ...prev }
      roster.forEach((student) => {
        next[student.studentId] = {
          status: 'present',
          note: next[student.studentId]?.note || '',
        }
      })
      return next
    })
    setSuccess('')
  }

  const handleSave = async () => {
    const recordsPayload = roster
      .map((student) => {
        const draft = drafts[student.studentId]
        if (!draft?.status) return null
        return {
          studentId: student.studentId,
          status: draft.status,
          note: draft.note || '',
        }
      })
      .filter(Boolean)

    if (!recordsPayload.length) {
      setError('Mark at least one student before saving.')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const data = await saveLessonAttendance(lessonId, recordsPayload)
      setLesson(data.lesson)
      setRoster(data.roster || [])
      setSummary(data.summary)
      const nextDrafts = {}
      ;(data.roster || []).forEach((student) => {
        nextDrafts[student.studentId] = {
          status: student.status || null,
          note: student.note || '',
        }
      })
      setDrafts(nextDrafts)
      setSuccess(data.message || 'Attendance saved.')
    } catch (err) {
      setError(err.message || 'Failed to save attendance.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <AttendanceSessionSkeleton />

  if (!lesson) {
    return (
      <section className='flex flex-1 flex-col items-start gap-4 overflow-y-auto px-3 py-5 sm:px-4'>
        <Link
          to='/dashboard/attendance'
          className='inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-500 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'
        >
          <ArrowLeft className='size-3.5' strokeWidth={1.75} />
          Back to attendance
        </Link>
        <div className={`w-full ${surface} px-6 py-12 text-center`} style={cardRadius}>
          <h1 className='text-[15px] font-semibold text-gray-900 dark:text-white'>
            Attendance session not found
          </h1>
          <p className='mt-1 text-[13px] text-gray-500 dark:text-gray-400'>
            {error || 'This lesson is unavailable or you do not have access.'}
          </p>
        </div>
      </section>
    )
  }

  const subjectLabel = lesson.courseName || lesson.subject || 'Course'

  return (
    <section className='flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-3 sm:px-4'>
      <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
        <Link
          to='/dashboard/attendance'
          className='inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-500 transition-colors hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:text-gray-400 dark:hover:text-blue-400'
        >
          <ArrowLeft className='size-3.5' strokeWidth={1.75} />
          Back to attendance
        </Link>

        {isTeacher ? (
          <div className='flex flex-wrap items-center gap-2'>
            <Button
              type='button'
              variant='secondary'
              size='sm'
              onClick={markAllPresent}
              disabled={saving || roster.length === 0}
            >
              <CheckCheck className='size-3.5' strokeWidth={1.75} />
              Mark all present
            </Button>
            <Button
              type='button'
              variant='primary'
              size='sm'
              loading={saving}
              onClick={handleSave}
              disabled={roster.length === 0}
            >
              <Save className='size-3.5' strokeWidth={1.75} />
              Save attendance
            </Button>
          </div>
        ) : null}
      </div>

      <div className={`mb-4 ${surface} p-4 sm:p-5`} style={cardRadius}>
        <p className='text-[11px] font-medium tracking-[0.06em] text-gray-400 uppercase dark:text-gray-500'>
          {isTeacher ? 'Take roll' : 'Lesson attendance'}
        </p>
        <h1 className='mt-1 text-[22px] font-semibold tracking-tight text-gray-900 dark:text-white sm:text-[26px]'>
          {lesson.title}
        </h1>
        <p className='mt-2 text-[13px] text-gray-500 dark:text-gray-400'>
          {subjectLabel}
          <span className='mx-2 text-gray-300 dark:text-gray-600'>·</span>
          {lesson.className}
        </p>
        <div className='mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-gray-600 dark:text-gray-300'>
          <span className='inline-flex items-center gap-1.5'>
            <Calendar className='size-3.5' strokeWidth={1.75} />
            {formatDateLong(lesson.scheduledAt)}
          </span>
          <span className='inline-flex items-center gap-1.5'>
            <Clock className='size-3.5' strokeWidth={1.75} />
            {formatTime(lesson.scheduledAt)} · {lesson.durationMinutes} min
          </span>
          <span className='inline-flex items-center gap-1.5'>
            <GraduationCap className='size-3.5' strokeWidth={1.75} />
            {lesson.className}
          </span>
        </div>
        {isTeacher && dirtyCount > 0 ? (
          <p className='mt-3 text-[12px] text-amber-700 dark:text-amber-300'>
            {dirtyCount} unsaved change{dirtyCount === 1 ? '' : 's'}
          </p>
        ) : null}
      </div>

      {error ? (
        <div
          className='mb-4 bg-red-50 px-4 py-3 text-[13px] text-red-700 dark:bg-red-500/15 dark:text-red-300'
          style={softRadius}
        >
          {error}
        </div>
      ) : null}
      {success ? (
        <div
          className='mb-4 bg-emerald-50 px-4 py-3 text-[13px] text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300'
          style={softRadius}
        >
          {success}
        </div>
      ) : null}

      <div className='mb-4'>
        <AttendanceSummary
          summary={summary}
          title='Session summary'
          subtitle={
            isTeacher
              ? 'Live totals for this lesson roster'
              : records.length
                ? 'Your recorded status for this lesson'
                : 'No attendance has been marked for this lesson yet'
          }
        />
      </div>

      {isTeacher ? (
        <div className='mb-3'>
          <label className='relative block'>
            <span className='sr-only'>Search students</span>
            <input
              type='search'
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder='Search students…'
              className='form-field w-full px-3 py-2.5 text-[13px] shadow-[var(--shadow-soft)]'
              style={softRadius}
            />
          </label>
        </div>
      ) : null}

      <div className='pb-4'>
        {isTeacher ? (
          <AttendanceRoster
            roster={roster}
            drafts={drafts}
            onStatusChange={handleStatusChange}
            onNoteChange={handleNoteChange}
            search={search}
          />
        ) : records.length === 0 ? (
          <div
            className={`${surface} px-6 py-12 text-center`}
            style={cardRadius}
          >
            <p className='text-[13px] font-semibold text-gray-900 dark:text-gray-100'>
              Not marked yet
            </p>
            <p className='mt-1 text-[13px] text-gray-500 dark:text-gray-400'>
              Your teacher has not saved attendance for this lesson.
            </p>
          </div>
        ) : (
          <AttendanceRoster roster={roster} drafts={{}} readOnly />
        )}
      </div>
    </section>
  )
}

export default AttendanceSession

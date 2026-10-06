import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  getMyAttendance,
  getMyAttendanceSummary,
  getTeacherAttendanceLessons,
} from '../../../../lib/attendance.requests'
import { USER_ROLES } from '../../../../store/slices/uiSlice'
import AttendanceToolbar from './components/AttendanceToolbar'
import AttendanceSummary from './components/AttendanceSummary'
import AttendanceSkeleton from './components/AttendanceSkeleton'
import TeacherLessonList from './components/TeacherLessonList'
import AttendanceHistory from './components/AttendanceHistory'
import { softRadius } from './attendanceUtils'

const Attendance = () => {
  const userRole = useSelector((state) => state.user.user?.role)
  const isTeacher = userRole === USER_ROLES.TEACHER
  const isGuardian =
    userRole === USER_ROLES.GUARDIAN || userRole === USER_ROLES.PARENT

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [markFilter, setMarkFilter] = useState('All')
  const [studentFilter, setStudentFilter] = useState('All')
  const [lessons, setLessons] = useState([])
  const [records, setRecords] = useState([])
  const [wards, setWards] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const filters = useMemo(() => {
    const next = {}
    if (!isTeacher && statusFilter !== 'All') next.status = statusFilter
    if (isGuardian && studentFilter !== 'All') next.studentId = studentFilter
    return next
  }, [isTeacher, statusFilter, isGuardian, studentFilter])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError('')

      try {
        if (isTeacher) {
          const [lessonData, summaryData] = await Promise.all([
            getTeacherAttendanceLessons(),
            getMyAttendanceSummary(),
          ])
          if (cancelled) return
          setLessons(lessonData.lessons || [])
          setSummary(summaryData.summary)
          setRecords(summaryData.recent || [])
          setWards([])
        } else {
          const [historyData, summaryData] = await Promise.all([
            getMyAttendance(filters),
            getMyAttendanceSummary(filters),
          ])
          if (cancelled) return
          setRecords(historyData.records || [])
          setSummary(summaryData.summary)
          setWards(summaryData.wards || historyData.wards || [])
          setLessons([])
        }
      } catch (err) {
        if (!cancelled) {
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
  }, [isTeacher, filters])

  const teacherSummary = useMemo(() => {
    if (!isTeacher) return summary
    const totals = lessons.reduce(
      (acc, lesson) => {
        const a = lesson.attendance || {}
        acc.present += a.present || 0
        acc.absent += a.absent || 0
        acc.late += a.late || 0
        acc.excused += a.excused || 0
        acc.total += a.markedCount || 0
        return acc
      },
      { present: 0, absent: 0, late: 0, excused: 0, total: 0 },
    )
    const attended = totals.present + totals.late
    return {
      ...totals,
      presentRate: totals.total
        ? Math.round((attended / totals.total) * 100)
        : 0,
    }
  }, [isTeacher, lessons, summary])

  if (loading) {
    return (
      <div className='flex min-h-0 flex-1 flex-col overflow-y-auto'>
        <AttendanceSkeleton />
      </div>
    )
  }

  return (
    <div className='flex min-h-0 flex-1 flex-col overflow-y-auto'>
      <AttendanceToolbar
        search={search}
        onSearch={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        studentFilter={studentFilter}
        onStudentFilterChange={setStudentFilter}
        studentOptions={wards}
        showStudentFilter={isGuardian && wards.length > 1}
        markFilter={markFilter}
        onMarkFilterChange={setMarkFilter}
        showMarkFilter={isTeacher}
      />

      <div className='flex flex-col gap-4 px-3 pb-4 sm:px-4'>
        {error ? (
          <div
            className='bg-red-50 px-4 py-3 text-[13px] text-red-700 shadow-[var(--shadow-soft)] dark:bg-red-500/15 dark:text-red-300'
            style={softRadius}
          >
            {error}
          </div>
        ) : null}

        <AttendanceSummary
          summary={isTeacher ? teacherSummary : summary}
          title={isTeacher ? 'Class attendance' : 'Your attendance'}
          subtitle={
            isTeacher
              ? 'Across all of your marked lesson sessions'
              : isGuardian
                ? 'Presence records for your linked students'
                : 'Presence across your recorded lessons'
          }
        />

        {isTeacher ? (
          <TeacherLessonList
            lessons={lessons}
            search={search}
            markFilter={markFilter}
          />
        ) : (
          <AttendanceHistory
            records={records}
            search={search}
            statusFilter={statusFilter}
          />
        )}
      </div>
    </div>
  )
}

export default Attendance

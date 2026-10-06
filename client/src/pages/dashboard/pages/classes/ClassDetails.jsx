import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  UserRound,
  Users,
} from 'lucide-react'
import { getTeacherClassById } from '../../../../lib/teacher.requests'

const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const statusClass = (status) =>
  status === 'Active'
    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/25'
    : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/80 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/25'

const getStatus = (classItem) =>
  typeof classItem.isActive === 'boolean'
    ? classItem.isActive
      ? 'Active'
      : 'Inactive'
    : classItem.status || 'Active'

const getStudentName = (student) => {
  const firstName = student.firstName || student.user?.firstName || ''
  const lastName = student.lastName || student.user?.lastName || ''
  return `${firstName} ${lastName}`.trim() || 'Unnamed student'
}

const getStudentEmail = (student) =>
  student.email || student.user?.email || '—'

const getGuardianName = (student) => {
  const guardian = student.guardian
  if (!guardian) return null
  const firstName = guardian.firstName || guardian.user?.firstName || ''
  const lastName = guardian.lastName || guardian.user?.lastName || ''
  return `${firstName} ${lastName}`.trim() || null
}

const chipRadius = { borderRadius: '0.85rem 0.25rem 0.85rem 0.25rem' }
const cardRadius = { borderRadius: '1.5rem 0.5rem 1.5rem 0.5rem' }
const avatarRadius = { borderRadius: '1.5rem 0.5rem 1.5rem 0.5rem' }

const surface =
  'border border-gray-200/70 bg-white dark:border-white/10 dark:bg-[#0c1528]'

const ClassCover = ({ classItem, className = 'size-28 sm:size-32' }) => {
  const initial =
    classItem.className?.[0]?.toUpperCase() ||
    classItem.classCode?.[0]?.toUpperCase() ||
    '?'

  return (
    <div
      className={`${className} shrink-0 overflow-hidden ring-1 ring-gray-200/80 dark:ring-white/10`}
      style={avatarRadius}
    >
      {classItem.coverImage ? (
        <img
          src={classItem.coverImage}
          alt=''
          className='!h-full !w-full object-cover'
        />
      ) : (
        <div className='flex !h-full !w-full items-center justify-center bg-blue-50 text-2xl font-semibold text-blue-800 dark:bg-blue-500/10 dark:text-blue-300'>
          {initial}
        </div>
      )}
    </div>
  )
}

const StudentRow = ({ student }) => {
  const name = getStudentName(student)
  const email = getStudentEmail(student)
  const guardianName = getGuardianName(student)
  const photo = student.photo || student.user?.photo || ''
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <li
      className='flex min-w-0 items-center gap-3 border border-gray-100 bg-gray-50/70 px-3 py-2.5 dark:border-white/8 dark:bg-white/3'
      style={chipRadius}
    >
      <span
        className='size-9 shrink-0 overflow-hidden'
        style={{ borderRadius: '0.85rem 0.25rem 0.85rem 0.25rem' }}
      >
        {photo ? (
          <img src={photo} alt='' className='!h-full !w-full object-cover' />
        ) : (
          <span className='grid !h-full !w-full place-items-center bg-blue-100 text-[11px] font-semibold text-blue-800 dark:bg-blue-500/20 dark:text-blue-300'>
            {initials || '?'}
          </span>
        )}
      </span>

      <span className='min-w-0 flex-1'>
        <span className='block truncate text-[13px] font-medium text-gray-900 dark:text-gray-100'>
          {name}
        </span>
        <span className='mt-0.5 block truncate text-[11px] text-gray-400 dark:text-gray-500'>
          {email}
          {guardianName ? ` · Guardian: ${guardianName}` : ''}
        </span>
      </span>
    </li>
  )
}

const ClassDetailsSkeleton = () => (
  <section
    className='flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-3 sm:px-4'
    aria-busy='true'
    aria-label='Loading class'
  >
    <div className='mb-4 h-4 w-28 animate-pulse rounded bg-gray-200 dark:bg-white/10' />
    <div
      className={`mb-4 ${surface} p-4 sm:p-5`}
      style={cardRadius}
    >
      <div className='flex flex-col gap-5 sm:flex-row'>
        <div
          className='size-28 shrink-0 animate-pulse bg-gray-200 sm:size-32 dark:bg-white/10'
          style={avatarRadius}
        />
        <div className='min-w-0 flex-1 space-y-3'>
          <div className='h-7 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-white/10' />
          <div className='h-4 w-1/3 animate-pulse rounded bg-gray-200 dark:bg-white/10' />
          <div className='h-4 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-white/10' />
        </div>
      </div>
    </div>
    <div className={`${surface} p-5`} style={cardRadius}>
      <div className='mb-4 h-3 w-20 animate-pulse rounded bg-gray-200 dark:bg-white/10' />
      <div className='space-y-2'>
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className='h-14 animate-pulse bg-gray-100 dark:bg-white/5'
            style={chipRadius}
          />
        ))}
      </div>
    </div>
  </section>
)

const ClassDetails = () => {
  const { id } = useParams()
  const [classItem, setClassItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadClass = async () => {
      setLoading(true)
      setError('')

      try {
        const data = await getTeacherClassById(id)
        if (!cancelled) setClassItem(data.class)
      } catch (err) {
        if (!cancelled) {
          setClassItem(null)
          setError(err.message || 'Failed to load class.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadClass()

    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return <ClassDetailsSkeleton />
  }

  if (!classItem) {
    return (
      <section className='flex flex-1 flex-col items-start gap-4 overflow-y-auto px-3 py-5 sm:px-4'>
        <Link
          to='/dashboard/classes'
          className='inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-500 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'
        >
          <ArrowLeft className='size-3.5' strokeWidth={1.75} />
          Back to classes
        </Link>
        <div className={`w-full ${surface} px-6 py-12 text-center`} style={cardRadius}>
          <h1 className='text-[15px] font-semibold text-gray-900 dark:text-white'>
            Class not found
          </h1>
          <p className='mt-1 text-[13px] text-gray-500 dark:text-gray-400'>
            {error || 'This class is unavailable or not assigned to you.'}
          </p>
        </div>
      </section>
    )
  }

  const status = getStatus(classItem)
  const courses = classItem.courses || []
  const students = classItem.students || []
  const classId = classItem._id || classItem.id

  const metaParts = [
    classItem.classCode || null,
    classItem.grade != null ? `Grade ${classItem.grade}` : null,
    classItem.academicYear ? `${classItem.academicYear} academic year` : null,
    classItem.createdAt ? `Created ${formatDate(classItem.createdAt)}` : null,
  ].filter(Boolean)

  return (
    <section className='flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-3 sm:px-4'>
      <div className='mb-4'>
        <Link
          to='/dashboard/classes'
          className='inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-500 transition-colors hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:text-gray-400 dark:hover:text-blue-400'
        >
          <ArrowLeft className='size-3.5' strokeWidth={1.75} />
          Back to classes
        </Link>
      </div>

      <div className={`mb-4 ${surface} p-4 sm:p-5`} style={cardRadius}>
        <div className='flex flex-col gap-5 sm:flex-row sm:items-stretch'>
          <ClassCover classItem={classItem} />

          <div className='flex min-w-0 flex-1 flex-col justify-between gap-4'>
            <div>
              <div className='flex flex-wrap items-start justify-between gap-3'>
                <div className='min-w-0'>
                  <h1 className='truncate text-[22px] font-semibold tracking-tight text-gray-900 dark:text-white sm:text-[26px]'>
                    {classItem.className}
                  </h1>
                  <p className='mt-1 font-mono text-[12px] tracking-wide text-gray-400 dark:text-gray-500'>
                    {classId}
                  </p>
                </div>

                <span
                  className={`inline-flex shrink-0 px-2.5 py-1 text-[11px] font-medium ${statusClass(status)}`}
                  style={chipRadius}
                >
                  {status}
                </span>
              </div>

              {metaParts.length > 0 && (
                <p className='mt-3 text-[13px] leading-relaxed text-gray-500 dark:text-gray-400'>
                  {metaParts.map((part, index) => (
                    <React.Fragment key={`${part}-${index}`}>
                      {index > 0 && (
                        <span
                          className='mx-2 text-gray-300 dark:text-gray-600'
                          aria-hidden='true'
                        >
                          ·
                        </span>
                      )}
                      <span>{part}</span>
                    </React.Fragment>
                  ))}
                </p>
              )}

              {classItem.description ? (
                <p className='mt-3 text-[13px] leading-relaxed text-gray-600 dark:text-gray-300'>
                  {classItem.description}
                </p>
              ) : null}
            </div>

            <div className='flex flex-wrap items-center gap-x-1 gap-y-2 border-t border-gray-100 pt-3 dark:border-white/8'>
              <span className='inline-flex items-center gap-1.5 px-2 py-1.5 text-[13px] text-gray-600 dark:text-gray-300'>
                <Users className='size-3.5 shrink-0' strokeWidth={1.75} />
                {students.length}{' '}
                {students.length === 1 ? 'student' : 'students'}
              </span>
              <span
                className='hidden text-gray-200 sm:inline dark:text-gray-700'
                aria-hidden='true'
              >
                |
              </span>
              <span className='inline-flex items-center gap-1.5 px-2 py-1.5 text-[13px] text-gray-600 dark:text-gray-300'>
                <GraduationCap className='size-3.5 shrink-0' strokeWidth={1.75} />
                {courses.length} {courses.length === 1 ? 'course' : 'courses'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {courses.length > 0 && (
        <section className={`mb-4 ${surface} p-5`} style={cardRadius}>
          <h2 className='mb-4 text-[11px] font-semibold tracking-[0.08em] text-gray-500 uppercase dark:text-gray-400'>
            Courses
          </h2>
          <ul className='flex flex-wrap gap-2'>
            {courses.map((course, index) => {
              const name = course?.courseName || '—'
              const code = course?.courseCode || ''
              return (
                <li key={course?._id || `${name}-${index}`}>
                  <span
                    className='inline-flex max-w-full items-center gap-2 border border-gray-200/70 bg-gray-50/80 px-3 py-2 text-[13px] font-medium text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-200'
                    style={chipRadius}
                  >
                    <BookOpen
                      className='size-3.5 shrink-0 text-[#20509b] dark:text-blue-300'
                      strokeWidth={1.75}
                    />
                    <span className='truncate'>{name}</span>
                    {code ? (
                      <span className='shrink-0 font-mono text-[11px] font-normal text-gray-400 dark:text-gray-500'>
                        {code}
                      </span>
                    ) : null}
                  </span>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <section className={`${surface} p-5`} style={cardRadius}>
        <div className='mb-4 flex items-center justify-between gap-3'>
          <h2 className='text-[11px] font-semibold tracking-[0.08em] text-gray-500 uppercase dark:text-gray-400'>
            Students
          </h2>
          <span className='inline-flex items-center gap-1.5 text-[12px] text-gray-500 dark:text-gray-400'>
            <UserRound className='size-3.5' strokeWidth={1.75} />
            {students.length}
          </span>
        </div>

        {students.length === 0 ? (
          <p className='text-[13px] text-gray-500 dark:text-gray-400'>
            No students linked to this class yet.
          </p>
        ) : (
          <ul className='flex flex-col gap-2'>
            {students.map((student) => (
              <StudentRow
                key={student._id || student.id}
                student={student}
              />
            ))}
          </ul>
        )}
      </section>
    </section>
  )
}

export default ClassDetails

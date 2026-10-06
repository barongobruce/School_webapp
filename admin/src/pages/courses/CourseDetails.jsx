import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BookOpen,
  ClipboardList,
  FileText,
  GraduationCap,
  Pencil,
  UserRound,
  Users,
} from 'lucide-react'
import { getCourseById } from '../../lib/course.requests'
import useModal from '../../hooks/useModal'
import Button from '../../components/Button'
import EditCourse from './components/EditCourse'
import CourseDetailsSkeleton from './components/CourseDetailsSkeleton'

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

const typeClass = (type) => {
  switch (type) {
    case 'Core':
      return 'bg-sky-50 text-sky-700 ring-1 ring-sky-200/80 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/25'
    case 'Elective':
      return 'bg-teal-50 text-teal-700 ring-1 ring-teal-200/80 dark:bg-teal-500/10 dark:text-teal-300 dark:ring-teal-500/25'
    case 'Optional':
      return 'bg-violet-50 text-violet-700 ring-1 ring-violet-200/80 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/25'
    default:
      return 'bg-gray-50 text-gray-600 ring-1 ring-gray-200/80 dark:bg-white/5 dark:text-gray-300 dark:ring-white/10'
  }
}

const getTeacherName = (teacher) =>
  [teacher.firstName, teacher.lastName].filter(Boolean).join(' ') ||
  teacher.email ||
  '—'

const getCount = (value) => (Array.isArray(value) ? value.length : 0)

const chipRadius = { borderRadius: '0.85rem 0.25rem 0.85rem 0.25rem' }
const cardRadius = { borderRadius: '1.5rem 0.5rem 1.5rem 0.5rem' }
const avatarRadius = { borderRadius: '1.5rem 0.5rem 1.5rem 0.5rem' }

const surface =
  'border border-gray-200/70 bg-white dark:border-white/10 dark:bg-[#0c1528]'

const DetailRow = ({ label, value }) => (
  <div className='flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4'>
    <dt className='shrink-0 text-[12px] text-gray-500 dark:text-gray-400'>{label}</dt>
    <dd className='text-[13px] font-medium text-gray-900 sm:text-right dark:text-gray-100'>
      {value || '—'}
    </dd>
  </div>
)

const SectionCard = ({ title, children }) => (
  <section className={`${surface} p-5`} style={cardRadius}>
    <h2 className='mb-4 text-[11px] font-semibold tracking-[0.08em] text-gray-500 uppercase dark:text-gray-400'>
      {title}
    </h2>
    {children}
  </section>
)

const StatCard = ({ label, value, valueClassName = '' }) => (
  <div className={`${surface} px-4 py-4`} style={cardRadius}>
    <p className='text-[11px] font-medium tracking-[0.06em] text-gray-500 uppercase dark:text-gray-400'>
      {label}
    </p>
    <p
      className={`mt-1.5 text-[17px] font-semibold tracking-tight text-gray-900 dark:text-white ${valueClassName}`}
    >
      {value}
    </p>
  </div>
)

const CourseAvatar = ({ course, className = 'size-28 sm:size-32' }) => {
  const code = String(course.courseCode || '')
  const parts = code.split('-')
  const prefix = parts[0] || 'CRS'
  const suffix = parts.slice(1).join('-')

  return (
    <div
      className={`${className} flex shrink-0 flex-col items-center justify-center bg-blue-50 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:ring-blue-500/20`}
      style={avatarRadius}
    >
      <span className='max-w-full truncate px-2 text-[11px] font-semibold tracking-[0.08em] text-blue-700/70 uppercase dark:text-blue-300/70'>
        {prefix}
      </span>
      <span className='mt-1 max-w-full truncate px-2 text-xl font-semibold tracking-tight text-blue-800 dark:text-blue-300 sm:text-2xl'>
        {suffix || code.slice(0, 4) || '?'}
      </span>
    </div>
  )
}

const PersonLink = ({ to, name, subtitle, icon: Icon = UserRound }) => (
  <Link
    to={to}
    className='flex min-w-0 items-center gap-3 border border-gray-100 bg-gray-50/70 px-3 py-2.5 transition-colors hover:border-blue-200/80 hover:bg-blue-50/40 dark:border-white/8 dark:bg-white/3 dark:hover:border-blue-500/30 dark:hover:bg-blue-500/10'
    style={chipRadius}
  >
    <span
      className='grid size-8 shrink-0 place-items-center border border-gray-200/70 bg-white text-[#20509b] dark:border-white/10 dark:bg-[#152238] dark:text-blue-300'
      style={chipRadius}
    >
      <Icon className='size-3.5' strokeWidth={1.75} />
    </span>
    <span className='min-w-0 flex-1'>
      <span className='block truncate text-[13px] font-medium text-gray-900 dark:text-gray-100'>
        {name}
      </span>
      {subtitle ? (
        <span className='mt-0.5 block truncate text-[11px] text-gray-400 dark:text-gray-500'>
          {subtitle}
        </span>
      ) : null}
    </span>
  </Link>
)

const CourseDetails = () => {
  const { id } = useParams()
  const { open } = useModal()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadCourse = async () => {
      setLoading(true)
      setError('')

      try {
        const data = await getCourseById(id)
        if (!cancelled) setCourse(data.course)
      } catch (err) {
        if (!cancelled) {
          setCourse(null)
          setError(err.message || 'Failed to load course.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadCourse()

    return () => {
      cancelled = true
    }
  }, [id])

  const handleEditCourse = () => {
    if (!course) return
    open({
      title: 'Edit Course',
      description: `Update the course profile for ${course.courseName}.`,
      size: 'full',
      content: (
        <EditCourse
          course={course}
          onSuccess={(updated) => {
            if (updated) setCourse(updated)
          }}
        />
      ),
    })
  }

  if (loading) {
    return <CourseDetailsSkeleton />
  }

  if (!course) {
    return (
      <section className='flex flex-1 flex-col items-start gap-4 overflow-y-auto px-3 py-5 sm:px-4'>
        <Link
          to='/courses'
          className='inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-500 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'
        >
          <ArrowLeft className='size-3.5' strokeWidth={1.75} />
          Back to courses
        </Link>
        <div className={`w-full ${surface} px-6 py-12 text-center`} style={cardRadius}>
          <h1 className='text-[15px] font-semibold text-gray-900 dark:text-white'>
            Course not found
          </h1>
          <p className='mt-1 text-[13px] text-gray-500 dark:text-gray-400'>
            {error || (
              <>
                No course matches the ID{' '}
                <span className='font-medium text-gray-700 dark:text-gray-300'>
                  {id}
                </span>
                .
              </>
            )}
          </p>
        </div>
      </section>
    )
  }

  const teachers = course.courseTeachers || []
  const students = course.courseStudents || []
  const classItem =
    typeof course.courseClass === 'object' && course.courseClass
      ? course.courseClass
      : null
  const className = classItem?.className || 'Unassigned'
  const classId = classItem?._id || null
  const courseId = course._id || course.id
  const materialsCount = getCount(course.courseMaterials)
  const assignmentsCount = getCount(course.courseAssignments)
  const quizzesCount = getCount(course.courseQuizzes)
  const examsCount = getCount(course.courseExams)

  const metaParts = [
    course.courseCode || null,
    course.courseType || null,
    className !== 'Unassigned' ? className : null,
    course.createdAt ? `Created ${formatDate(course.createdAt)}` : null,
  ].filter(Boolean)

  return (
    <section className='flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-3 sm:px-4'>
      <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
        <Link
          to='/courses'
          className='inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-500 transition-colors hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:text-gray-400 dark:hover:text-blue-400'
        >
          <ArrowLeft className='size-3.5' strokeWidth={1.75} />
          Back to courses
        </Link>

        <Button type='button' variant='primary' size='sm' onClick={handleEditCourse}>
          <Pencil className='size-3.5' strokeWidth={1.75} />
          Edit Course
        </Button>
      </div>

      {/* Identity */}
      <div className={`mb-4 ${surface} p-4 sm:p-5`} style={cardRadius}>
        <div className='flex flex-col gap-5 sm:flex-row sm:items-stretch'>
          <CourseAvatar course={course} />

          <div className='flex min-w-0 flex-1 flex-col justify-between gap-4'>
            <div>
              <div className='flex flex-wrap items-start justify-between gap-3'>
                <div className='min-w-0'>
                  <h1 className='truncate text-[22px] font-semibold tracking-tight text-gray-900 dark:text-white sm:text-[26px]'>
                    {course.courseName}
                  </h1>
                  <p className='mt-1 font-mono text-[12px] tracking-wide text-gray-400 dark:text-gray-500'>
                    {courseId}
                  </p>
                </div>

                <div className='flex flex-wrap items-center gap-1.5'>
                  <span
                    className={`inline-flex shrink-0 px-2.5 py-1 text-[11px] font-medium ${statusClass(course.courseStatus)}`}
                    style={chipRadius}
                  >
                    {course.courseStatus}
                  </span>
                  <span
                    className={`inline-flex shrink-0 px-2.5 py-1 text-[11px] font-medium ${typeClass(course.courseType)}`}
                    style={chipRadius}
                  >
                    {course.courseType}
                  </span>
                </div>
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

              {course.courseDescription ? (
                <p className='mt-3 text-[13px] leading-relaxed text-gray-600 dark:text-gray-300'>
                  {course.courseDescription}
                </p>
              ) : null}
            </div>

            <div className='flex flex-wrap items-center gap-x-1 gap-y-2 border-t border-gray-100 pt-3 dark:border-white/8'>
              <span className='inline-flex items-center gap-1.5 rounded-[0.85rem_0.25rem] px-2 py-1.5 text-[13px] text-gray-600 dark:text-gray-300'>
                <GraduationCap className='size-3.5 shrink-0' strokeWidth={1.75} />
                {className}
              </span>
              <span
                className='hidden text-gray-200 sm:inline dark:text-gray-700'
                aria-hidden='true'
              >
                |
              </span>
              <span className='inline-flex items-center gap-1.5 rounded-[0.85rem_0.25rem] px-2 py-1.5 text-[13px] text-gray-600 dark:text-gray-300'>
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
              <span className='inline-flex items-center gap-1.5 rounded-[0.85rem_0.25rem] px-2 py-1.5 text-[13px] text-gray-600 dark:text-gray-300'>
                <UserRound className='size-3.5 shrink-0' strokeWidth={1.75} />
                {teachers.length}{' '}
                {teachers.length === 1 ? 'teacher' : 'teachers'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className='mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4'>
        <StatCard label='Students' value={students.length} />
        <StatCard label='Materials' value={materialsCount} />
        <StatCard label='Assignments' value={assignmentsCount} />
        <StatCard label='Assessments' value={quizzesCount + examsCount} />
      </div>

      <div className='grid grid-cols-1 gap-3 lg:grid-cols-2'>
        <SectionCard title='Course information'>
          <dl className='flex flex-col gap-3'>
            <DetailRow label='Course name' value={course.courseName} />
            <DetailRow label='Course code' value={course.courseCode} />
            <DetailRow label='Course type' value={course.courseType} />
            <DetailRow label='Status' value={course.courseStatus} />
            <DetailRow label='Created' value={formatDate(course.createdAt)} />
            <DetailRow label='Updated' value={formatDate(course.updatedAt)} />
          </dl>
        </SectionCard>

        <SectionCard title='Class'>
          <dl className='flex flex-col gap-3'>
            <DetailRow
              label='Assigned class'
              value={
                classId ? (
                  <Link
                    to={`/classes/${classId}`}
                    className='inline-flex items-center gap-1.5 text-[#20509b] transition-colors hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200'
                  >
                    <GraduationCap className='size-3.5' strokeWidth={1.75} />
                    {className}
                  </Link>
                ) : (
                  className
                )
              }
            />
            <DetailRow label='Class code' value={classItem?.classCode} />
            <DetailRow
              label='Enrolled students'
              value={students.length.toString()}
            />
          </dl>
        </SectionCard>

        <SectionCard title='Learning resources'>
          <dl className='flex flex-col gap-3'>
            <DetailRow
              label='Materials'
              value={
                <span className='inline-flex items-center gap-1.5'>
                  <FileText className='size-3.5 text-gray-400' strokeWidth={1.75} />
                  {materialsCount} items
                </span>
              }
            />
            <DetailRow
              label='Assignments'
              value={
                <span className='inline-flex items-center gap-1.5'>
                  <ClipboardList
                    className='size-3.5 text-gray-400'
                    strokeWidth={1.75}
                  />
                  {assignmentsCount} items
                </span>
              }
            />
            <DetailRow
              label='Quizzes'
              value={
                <span className='inline-flex items-center gap-1.5'>
                  <BookOpen className='size-3.5 text-gray-400' strokeWidth={1.75} />
                  {quizzesCount} items
                </span>
              }
            />
            <DetailRow label='Exams' value={`${examsCount} items`} />
          </dl>
        </SectionCard>

        <SectionCard title='Teachers'>
          {teachers.length === 0 ? (
            <p className='text-[13px] text-gray-500 dark:text-gray-400'>
              No teachers assigned yet.
            </p>
          ) : (
            <ul className='flex flex-col gap-2'>
              {teachers.map((teacher) => (
                <li key={teacher._id}>
                  {teacher._id ? (
                    <PersonLink
                      to={`/teachers/${teacher._id}`}
                      name={getTeacherName(teacher)}
                      subtitle={teacher.email}
                    />
                  ) : (
                    <span className='text-[13px] text-gray-500'>
                      {getTeacherName(teacher)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title='Students'>
          {students.length === 0 ? (
            <p className='text-[13px] text-gray-500 dark:text-gray-400'>
              No students linked to this course yet.
            </p>
          ) : (
            <ul className='flex flex-col gap-2'>
              {students.map((student) => (
                <li key={student._id}>
                  <PersonLink
                    to={`/students/${student._id}`}
                    name={`${student.firstName} ${student.lastName}`}
                    subtitle={student.email}
                  />
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </section>
  )
}

export default CourseDetails

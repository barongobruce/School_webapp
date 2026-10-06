import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  Pencil,
  UserRound,
  Users,
} from 'lucide-react'
import { getClassById } from '../../lib/class.requests'
import useModal from '../../hooks/useModal'
import Button from '../../components/Button'
import EditClass from './components/EditClass'
import ClassDetailsSkeleton from './components/ClassDetailsSkeleton'

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

const getTeacherName = (teacher) =>
  [teacher.firstName, teacher.lastName].filter(Boolean).join(' ') ||
  teacher.email ||
  '—'

const getCourseName = (course) =>
  typeof course === 'string' ? course : course?.courseName || '—'

const getCourseCode = (course) =>
  typeof course === 'string' ? '' : course?.courseCode || ''

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

const SectionCard = ({ title, children, className = '' }) => (
  <section className={`${surface} p-5 ${className}`} style={cardRadius}>
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

const ClassCover = ({ classItem, className = 'size-28 sm:size-32' }) => {
  const initial =
    classItem.className?.[0]?.toUpperCase() ||
    classItem.classCode?.[0]?.toUpperCase() ||
    '?'

  if (classItem.coverImage) {
    return (
      <img
        src={classItem.coverImage}
        alt=''
        className={`${className} shrink-0 object-cover ring-1 ring-gray-200/80 dark:ring-white/10`}
        style={avatarRadius}
      />
    )
  }

  return (
    <div
      className={`${className} flex shrink-0 items-center justify-center bg-blue-50 text-2xl font-semibold text-blue-800 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20`}
      style={avatarRadius}
    >
      {initial}
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

const ClassDetails = () => {
  const { id } = useParams()
  const { open } = useModal()
  const [classItem, setClassItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadClass = async () => {
      setLoading(true)
      setError('')

      try {
        const data = await getClassById(id)
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

  const handleEditClass = () => {
    if (!classItem) return
    open({
      title: 'Edit Class',
      description: `Update the class profile for ${classItem.className}.`,
      size: 'full',
      content: (
        <EditClass
          classItem={classItem}
          onSuccess={(updated) => setClassItem(updated)}
        />
      ),
    })
  }

  if (loading) {
    return <ClassDetailsSkeleton />
  }

  if (!classItem) {
    return (
      <section className='flex flex-1 flex-col items-start gap-4 overflow-y-auto px-3 py-5 sm:px-4'>
        <Link
          to='/classes'
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
            {error || (
              <>
                No class matches the ID{' '}
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

  const status = getStatus(classItem)
  const courses = classItem.courses || []
  const teachers = classItem.teachers || []
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
      <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
        <Link
          to='/classes'
          className='inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-500 transition-colors hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:text-gray-400 dark:hover:text-blue-400'
        >
          <ArrowLeft className='size-3.5' strokeWidth={1.75} />
          Back to classes
        </Link>

        <Button type='button' variant='primary' size='sm' onClick={handleEditClass}>
          <Pencil className='size-3.5' strokeWidth={1.75} />
          Edit Class
        </Button>
      </div>

      {/* Identity */}
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
              <span className='inline-flex items-center gap-1.5 rounded-[0.85rem_0.25rem] px-2 py-1.5 text-[13px] text-gray-600 dark:text-gray-300'>
                <GraduationCap className='size-3.5 shrink-0' strokeWidth={1.75} />
                {courses.length} {courses.length === 1 ? 'course' : 'courses'}
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

      <div className='mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3'>
        <StatCard label='Students' value={students.length} />
        <StatCard label='Courses' value={courses.length} />
        <StatCard label='Teachers' value={teachers.length} />
      </div>

      <div className='grid grid-cols-1 gap-3 lg:grid-cols-2'>
        <SectionCard title='Class information'>
          <dl className='flex flex-col gap-3'>
            <DetailRow label='Class name' value={classItem.className} />
            <DetailRow label='Class code' value={classItem.classCode} />
            <DetailRow
              label='Grade / Level'
              value={classItem.grade != null ? classItem.grade : '—'}
            />
            <DetailRow label='Academic year' value={classItem.academicYear} />
            <DetailRow label='Status' value={status} />
            <DetailRow label='Created' value={formatDate(classItem.createdAt)} />
            <DetailRow label='Updated' value={formatDate(classItem.updatedAt)} />
          </dl>
        </SectionCard>

        <SectionCard title='Courses'>
          {courses.length === 0 ? (
            <p className='text-[13px] text-gray-500 dark:text-gray-400'>
              No courses linked to this class yet.
            </p>
          ) : (
            <ul className='flex flex-wrap gap-2'>
              {courses.map((course, index) => {
                const name = getCourseName(course)
                const code = getCourseCode(course)
                const courseId = course?._id
                const key = courseId || code || `${name}-${index}`
                const content = (
                  <>
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
                  </>
                )
                const chipClass =
                  'inline-flex max-w-full items-center gap-2 border border-gray-200/70 bg-gray-50/80 px-3 py-2 text-[13px] font-medium text-gray-700 transition-colors dark:border-white/10 dark:bg-white/5 dark:text-gray-200'

                return (
                  <li key={key}>
                    {courseId ? (
                      <Link
                        to={`/courses/${courseId}`}
                        className={`${chipClass} hover:border-blue-200 hover:bg-blue-50/50 hover:text-blue-700 dark:hover:border-blue-500/30 dark:hover:bg-blue-500/10 dark:hover:text-blue-300`}
                        style={chipRadius}
                      >
                        {content}
                      </Link>
                    ) : (
                      <span className={chipClass} style={chipRadius}>
                        {content}
                      </span>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
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
                  <PersonLink
                    to={`/teachers/${teacher._id}`}
                    name={getTeacherName(teacher)}
                    subtitle={teacher.email}
                  />
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title='Students'>
          {students.length === 0 ? (
            <p className='text-[13px] text-gray-500 dark:text-gray-400'>
              No students linked to this class yet.
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

export default ClassDetails

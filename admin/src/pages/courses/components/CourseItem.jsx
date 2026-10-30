import React from 'react'
import {
  Bookmark,
  BookOpen,
  ClipboardList,
  FileText,
  GraduationCap,
  UserRound,
  Users,
} from 'lucide-react'
import Button from '../../../components/Button'

const statusClass = (status) =>
  status === 'Active'
    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
    : 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'

const typeClass = (type) => {
  switch (type) {
    case 'Core':
      return 'bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300'
    case 'Elective':
      return 'bg-teal-100 text-teal-800 dark:bg-teal-500/20 dark:text-teal-300'
    case 'Optional':
      return 'bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-300'
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-200'
  }
}

const getCourseId = (course) => course._id || course.id

const getClassName = () => 'All classes'

const getTeacherLabel = (course) => {
  const teachers = course.courseTeachers || course.teachers || []
  if (!teachers.length) return 'No teacher assigned'

  return (
    teachers
      .map((teacher) => {
        if (typeof teacher === 'string') return null
        if (teacher.name) return teacher.name
        return [teacher.firstName, teacher.lastName].filter(Boolean).join(' ')
      })
      .filter(Boolean)
      .join(', ') || 'No teacher assigned'
  )
}

const getCount = (value, fallback = 0) => {
  if (typeof value === 'number') return value
  if (Array.isArray(value)) return value.length
  return fallback
}

const cardRadius = { borderRadius: '1.5rem 0.5rem 1.5rem 0.5rem' }
const avatarRadius = { borderRadius: '0.95rem 0.3rem 0.95rem 0.3rem' }
const chipRadius = { borderRadius: '0.85rem 0.25rem 0.85rem 0.25rem' }

const CourseAvatar = ({ course, className = 'size-11' }) => {
  const code = String(course.courseCode || '')
  const parts = code.split('-')
  const prefix = parts[0] || 'CRS'
  const suffix = parts.slice(1).join('-')

  return (
    <div
      className={`${className} flex shrink-0 flex-col items-center justify-center bg-blue-100 shadow-[var(--shadow-soft)] dark:bg-blue-500/20`}
      style={avatarRadius}
    >
      <span className='max-w-full truncate px-0.5 text-[8px] font-semibold tracking-wide text-blue-700/70 uppercase dark:text-blue-300/70'>
        {prefix}
      </span>
      <span className='max-w-full truncate px-0.5 text-[11px] leading-none font-semibold text-blue-800 dark:text-blue-300'>
        {suffix || code.slice(0, 3) || '?'}
      </span>
    </div>
  )
}

const CourseItem = ({ course, view = 'grid' }) => {
  const id = getCourseId(course)
  const className = getClassName(course)
  const teacherLabel = getTeacherLabel(course)
  const studentsCount = getCount(
    course.studentsCount ?? course.courseStudents,
  )
  const studentAccessLabel = course.courseType === 'Core'
    ? 'All class students'
    : `${studentsCount} enrolled`
  const materialsCount = getCount(
    course.materialsCount ?? course.courseMaterials,
  )
  const assignmentsCount = getCount(
    course.assignmentsCount ?? course.courseAssignments,
  )
  const quizzesCount = getCount(course.quizzesCount ?? course.courseQuizzes)
  const examsCount = getCount(course.examsCount ?? course.courseExams)

  if (view === 'list') {
    return (
      <article
        className='flex items-center gap-3 bg-white p-3 shadow-[var(--shadow-soft)] transition-shadow duration-200 hover:shadow-[var(--shadow-lift)] dark:bg-[#152238] sm:gap-4 sm:px-4'
        style={cardRadius}
      >
        <CourseAvatar course={course} className='size-10 sm:size-11' />

        <div className='min-w-0 flex-1'>
          <div className='flex flex-wrap items-center gap-x-2 gap-y-0.5'>
            <h2 className='truncate text-[13px] font-semibold text-gray-900 dark:text-white'>
              {course.courseName}
            </h2>
            <span className='truncate text-[11px] text-gray-400 dark:text-gray-500'>
              {course.courseCode}
            </span>
          </div>
          <p className='mt-0.5 truncate text-[12px] text-gray-500 dark:text-gray-400'>
            {className || 'Unassigned class'}
            <span className='mx-1.5 text-gray-300 dark:text-gray-600'>·</span>
            {teacherLabel}
            <span className='mx-1.5 text-gray-300 dark:text-gray-600'>·</span>
            {studentsCount} enrolled
          </p>
        </div>

        <span
          className={`hidden shrink-0 px-2.5 py-1 text-[11px] font-medium sm:inline-flex ${typeClass(course.courseType)}`}
          style={chipRadius}
        >
          {course.courseType}
        </span>

        <span
          className={`hidden shrink-0 px-2.5 py-1 text-[11px] font-medium md:inline-flex ${statusClass(course.courseStatus)}`}
          style={chipRadius}
        >
          {course.courseStatus}
        </span>

        <Button to={`/courses/${id}`} variant='secondary' size='sm'>
          View
        </Button>
      </article>
    )
  }

  return (
    <article
      className='flex h-full flex-col bg-white p-4 shadow-[var(--shadow-soft)] transition-shadow duration-200 hover:shadow-[var(--shadow-lift)] dark:bg-[#152238]'
      style={cardRadius}
    >
      <div className='flex items-start gap-3'>
        <CourseAvatar course={course} />

        <div className='min-w-0 flex-1'>
          <h2 className='truncate text-[14px] font-semibold tracking-tight text-gray-900 dark:text-white'>
            {course.courseName}
          </h2>
          <p className='mt-0.5 flex items-center gap-1.5 truncate text-[12px] text-gray-500 dark:text-gray-400'>
            <UserRound className='size-3 shrink-0' strokeWidth={1.75} />
            <span className='truncate'>{teacherLabel}</span>
          </p>
        </div>

        <button
          type='button'
          aria-label={`Bookmark ${course.courseName}`}
          className='shrink-0 p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:hover:bg-white/8 dark:hover:text-gray-200'
          style={{ borderRadius: '0.7rem 0.2rem 0.7rem 0.2rem' }}
        >
          <Bookmark className='size-3.5' strokeWidth={1.75} />
        </button>
      </div>

      <div className='mt-3 flex flex-wrap gap-1.5'>
        <span
          className={`inline-flex px-2 py-1 text-[11px] font-medium ${statusClass(course.courseStatus)}`}
          style={chipRadius}
        >
          {course.courseStatus}
        </span>
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium ${typeClass(course.courseType)}`}
          style={chipRadius}
        >
          <BookOpen className='size-3' strokeWidth={2} />
          {course.courseType}
        </span>
        <span
          className='inline-flex items-center gap-1 bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-700 dark:bg-white/10 dark:text-gray-200'
          style={chipRadius}
        >
          <GraduationCap className='size-3' strokeWidth={2} />
          {className || 'Unassigned'}
        </span>
        <span
          className='inline-flex items-center gap-1 bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-700 dark:bg-white/10 dark:text-gray-200'
          style={chipRadius}
        >
          <Users className='size-3' strokeWidth={2} />
          {studentsCount} enrolled
        </span>
      </div>

      {course.courseDescription ? (
        <p className='mt-3 line-clamp-2 text-[12px] leading-relaxed text-gray-500 dark:text-gray-400'>
          {course.courseDescription}
        </p>
      ) : null}

      <div className='mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-gray-500 dark:text-gray-400'>
        <span className='inline-flex items-center gap-1'>
          <FileText className='size-3 shrink-0' strokeWidth={1.75} />
          {materialsCount} materials
        </span>
        <span className='inline-flex items-center gap-1'>
          <ClipboardList className='size-3 shrink-0' strokeWidth={1.75} />
          {assignmentsCount} assignments
        </span>
      </div>

      <div className='mt-auto flex items-center justify-between gap-3 pt-4'>
        <p className='truncate text-[12px] text-gray-400 dark:text-gray-500'>
          {quizzesCount} quizzes · {examsCount} exams
        </p>
        <Button to={`/courses/${id}`} variant='secondary' size='sm'>
          View Course
        </Button>
      </div>
    </article>
  )
}

export default CourseItem

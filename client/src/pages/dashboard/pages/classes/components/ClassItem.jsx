import React from 'react'
import {
  Bookmark,
  BookOpen,
  Calendar,
  GraduationCap,
  Users,
} from 'lucide-react'
import Button from '../../../../../components/Button'

const statusClass = (status) =>
  status === 'Active'
    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
    : 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'

const getClassId = (classItem) => classItem._id || classItem.id

const getStatus = (classItem) => {
  if (typeof classItem.isActive === 'boolean') {
    return classItem.isActive ? 'Active' : 'Inactive'
  }
  return classItem.status || 'Active'
}

const getCourseCount = (classItem) => classItem.courses?.length ?? 0

const getEnrolledCount = (classItem) => {
  if (typeof classItem.enrolledCount === 'number') return classItem.enrolledCount
  return classItem.students?.length ?? 0
}

const cardRadius = { borderRadius: '1.5rem 0.5rem 1.5rem 0.5rem' }
const avatarRadius = { borderRadius: '0.95rem 0.3rem 0.95rem 0.3rem' }
const chipRadius = { borderRadius: '0.85rem 0.25rem 0.85rem 0.25rem' }

const ClassCover = ({ classItem, className = 'size-11' }) => {
  const initial =
    classItem.className?.[0]?.toUpperCase() ||
    classItem.classCode?.[0]?.toUpperCase() ||
    '?'

  return (
    <div
      className={`${className} shrink-0 overflow-hidden shadow-[var(--shadow-soft)]`}
      style={avatarRadius}
    >
      {classItem.coverImage ? (
        <img
          src={classItem.coverImage}
          alt=''
          className='!h-full !w-full object-cover'
        />
      ) : (
        <div className='flex !h-full !w-full flex-col items-center justify-center bg-blue-100 dark:bg-blue-500/20'>
          {classItem.grade != null ? (
            <>
              <span className='text-[8px] font-semibold tracking-wide text-blue-700/70 uppercase dark:text-blue-300/70'>
                Gr
              </span>
              <span className='text-[13px] leading-none font-semibold text-blue-800 dark:text-blue-300'>
                {classItem.grade}
              </span>
            </>
          ) : (
            <span className='text-xs font-semibold text-blue-800 dark:text-blue-300'>
              {initial}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

const ClassItem = ({ classItem, view = 'grid' }) => {
  const id = getClassId(classItem)
  const status = getStatus(classItem)
  const courseCount = getCourseCount(classItem)
  const enrolledCount = getEnrolledCount(classItem)
  const name = classItem.className || classItem.name
  const code = classItem.classCode || classItem.id
  const yearLabel = classItem.academicYear
    ? `${classItem.academicYear} academic year`
    : null

  if (view === 'list') {
    return (
      <article
        className='flex items-center gap-3 bg-white p-3 shadow-[var(--shadow-soft)] transition-shadow duration-200 hover:shadow-[var(--shadow-lift)] dark:bg-[#152238] sm:gap-4 sm:px-4'
        style={cardRadius}
      >
        <ClassCover classItem={classItem} className='size-10 sm:size-11' />

        <div className='min-w-0 flex-1'>
          <div className='flex flex-wrap items-center gap-x-2 gap-y-0.5'>
            <h2 className='truncate text-[13px] font-semibold text-gray-900 dark:text-white'>
              {name}
            </h2>
            <span className='truncate text-[11px] text-gray-400 dark:text-gray-500'>
              {code}
            </span>
          </div>
          <p className='mt-0.5 truncate text-[12px] text-gray-500 dark:text-gray-400'>
            {enrolledCount} enrolled
            <span className='mx-1.5 text-gray-300 dark:text-gray-600'>·</span>
            {courseCount} {courseCount === 1 ? 'course' : 'courses'}
          </p>
        </div>

        <span
          className={`hidden shrink-0 px-2.5 py-1 text-[11px] font-medium sm:inline-flex ${statusClass(status)}`}
          style={chipRadius}
        >
          {status}
        </span>

        <Button to={`/dashboard/classes/${id}`} variant='secondary' size='sm'>
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
        <ClassCover classItem={classItem} />

        <div className='min-w-0 flex-1'>
          <h2 className='truncate text-[14px] font-semibold tracking-tight text-gray-900 dark:text-white'>
            {name}
          </h2>
          <p className='mt-0.5 truncate font-mono text-[12px] text-gray-500 dark:text-gray-400'>
            {code}
          </p>
        </div>

        <button
          type='button'
          aria-label={`Bookmark ${name}`}
          className='shrink-0 p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:hover:bg-white/8 dark:hover:text-gray-200'
          style={{ borderRadius: '0.7rem 0.2rem 0.7rem 0.2rem' }}
        >
          <Bookmark className='size-3.5' strokeWidth={1.75} />
        </button>
      </div>

      <div className='mt-3 flex flex-wrap gap-1.5'>
        <span
          className={`inline-flex px-2 py-1 text-[11px] font-medium ${statusClass(status)}`}
          style={chipRadius}
        >
          {status}
        </span>
        {classItem.grade != null && (
          <span
            className='inline-flex items-center gap-1 bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-700 dark:bg-white/10 dark:text-gray-200'
            style={chipRadius}
          >
            <GraduationCap className='size-3' strokeWidth={2} />
            Grade {classItem.grade}
          </span>
        )}
        <span
          className='inline-flex items-center gap-1 bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-700 dark:bg-white/10 dark:text-gray-200'
          style={chipRadius}
        >
          <Users className='size-3' strokeWidth={2} />
          {enrolledCount} enrolled
        </span>
        <span
          className='inline-flex items-center gap-1 bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-700 dark:bg-white/10 dark:text-gray-200'
          style={chipRadius}
        >
          <BookOpen className='size-3' strokeWidth={2} />
          {courseCount} {courseCount === 1 ? 'course' : 'courses'}
        </span>
      </div>

      {yearLabel && (
        <p className='mt-3 flex items-center gap-1.5 text-[12px] text-gray-500 dark:text-gray-400'>
          <Calendar className='size-3 shrink-0' strokeWidth={1.75} />
          {yearLabel}
        </p>
      )}

      <div className='mt-auto flex items-center justify-between gap-3 pt-4'>
        <p className='truncate text-[12px] text-gray-400 dark:text-gray-500'>
          {enrolledCount}{' '}
          {enrolledCount === 1 ? 'student' : 'students'}
        </p>
        <Button to={`/dashboard/classes/${id}`} variant='secondary' size='sm'>
          View Class
        </Button>
      </div>
    </article>
  )
}

export default ClassItem

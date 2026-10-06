import React, { useEffect, useMemo, useState } from 'react'
import { LayoutGrid, List } from 'lucide-react'
import { getCourses } from '../../../lib/course.requests'
import CourseItem from './CourseItem'
import CoursesSkeleton from './CoursesSkeleton'

const viewToggleBtn =
  'grid size-8 place-items-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500'

const getClassName = (course) => {
  if (typeof course.courseClass === 'object' && course.courseClass) {
    return course.courseClass.className || ''
  }
  return course.className || ''
}

const getTeacherNames = (course) => {
  const teachers = course.courseTeachers || course.teachers || []
  return teachers
    .map((teacher) => {
      if (typeof teacher === 'string') return null
      if (teacher.name) return teacher.name
      return [teacher.firstName, teacher.lastName].filter(Boolean).join(' ')
    })
    .filter(Boolean)
    .join(' ')
}

const getSubjectNames = (course) => {
  const subjects = course.courseSubjects || course.subjects || []
  return subjects
    .map((subject) =>
      typeof subject === 'string'
        ? subject
        : subject?.name || subject?.subjectName,
    )
    .filter(Boolean)
}

const matchesQuery = (course, query) => {
  const q = query.trim().toLowerCase()
  if (!q) return true

  const haystack = [
    course._id,
    course.id,
    course.courseName,
    course.courseCode,
    course.courseDescription,
    course.courseType,
    course.courseStatus,
    getClassName(course),
    getTeacherNames(course),
    getSubjectNames(course).join(' '),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return haystack.includes(q)
}

const CourseList = ({
  search = '',
  statusFilter = 'All',
  typeFilter = 'All',
  refreshKey = 0,
}) => {
  const [view, setView] = useState('grid')
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadCourses = async () => {
      setLoading(true)
      setError('')

      try {
        const data = await getCourses()
        if (!cancelled) setCourses(data.courses || [])
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load courses.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadCourses()

    return () => {
      cancelled = true
    }
  }, [refreshKey])

  const filtered = useMemo(() => {
    return courses.filter((course) => {
      const statusOk =
        statusFilter === 'All' ? true : course.courseStatus === statusFilter
      const typeOk =
        typeFilter === 'All' ? true : course.courseType === typeFilter
      return statusOk && typeOk && matchesQuery(course, search)
    })
  }, [courses, search, statusFilter, typeFilter])

  if (loading) {
    return <CoursesSkeleton />
  }

  if (error) {
    return (
      <section className='px-3 pb-4 sm:px-4'>
        <div
          className='bg-red-50 px-4 py-3 text-[13px] text-red-700 shadow-[var(--shadow-soft)] dark:bg-red-500/15 dark:text-red-300'
          style={{ borderRadius: '1.25rem 0.4rem 1.25rem 0.4rem' }}
        >
          {error}
        </div>
      </section>
    )
  }

  return (
    <section className='px-3 pb-4 sm:px-4'>
      <div className='mb-4 flex items-center justify-between gap-3'>
        <p className='text-[13px] text-gray-500 dark:text-gray-400'>
          Showing{' '}
          <span className='font-semibold text-gray-800 dark:text-gray-200'>
            {filtered.length}
          </span>{' '}
          {filtered.length === 1 ? 'course' : 'courses'}
          {search ? (
            <span className='text-gray-400 dark:text-gray-500'>
              {' '}
              for “{search}”
            </span>
          ) : null}
          {statusFilter !== 'All' ? (
            <span className='text-gray-400 dark:text-gray-500'>
              {' '}
              · {statusFilter}
            </span>
          ) : null}
          {typeFilter !== 'All' ? (
            <span className='text-gray-400 dark:text-gray-500'>
              {' '}
              · {typeFilter}
            </span>
          ) : null}
        </p>

        <div
          className='flex items-center gap-0.5 bg-gray-100 p-0.5 shadow-[var(--shadow-soft)] dark:bg-[#152238]'
          style={{ borderRadius: '0.95rem 0.3rem 0.95rem 0.3rem' }}
          role='group'
          aria-label='Change course list layout'
        >
          <button
            type='button'
            aria-label='Grid view'
            aria-pressed={view === 'grid'}
            onClick={() => setView('grid')}
            className={`${viewToggleBtn} ${
              view === 'grid'
                ? 'brand-gradient text-white shadow-[var(--shadow-brand)]'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200'
            }`}
            style={{ borderRadius: '0.8rem 0.25rem 0.8rem 0.25rem' }}
          >
            <LayoutGrid className='size-3.5' strokeWidth={1.75} />
          </button>
          <button
            type='button'
            aria-label='List view'
            aria-pressed={view === 'list'}
            onClick={() => setView('list')}
            className={`${viewToggleBtn} ${
              view === 'list'
                ? 'brand-gradient text-white shadow-[var(--shadow-brand)]'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200'
            }`}
            style={{ borderRadius: '0.8rem 0.25rem 0.8rem 0.25rem' }}
          >
            <List className='size-3.5' strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div
          className='bg-white px-6 py-12 text-center shadow-[var(--shadow-soft)] dark:bg-[#152238]'
          style={{ borderRadius: '1.6rem 0.55rem 1.6rem 0.55rem' }}
        >
          <p className='text-[13px] font-semibold text-gray-900 dark:text-gray-100'>
            {courses.length === 0
              ? 'No courses yet'
              : search
                ? 'No matching courses'
                : 'No courses found'}
          </p>
          <p className='mt-1 text-[13px] text-gray-500 dark:text-gray-400'>
            {courses.length === 0
              ? 'Add a course to get started.'
              : 'Try a different search, status, or type filter.'}
          </p>
        </div>
      ) : (
        <ul
          className={
            view === 'grid'
              ? 'grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3'
              : 'flex flex-col gap-2'
          }
        >
          {filtered.map((course) => (
            <li key={course._id || course.id}>
              <CourseItem course={course} view={view} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default CourseList

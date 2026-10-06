import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { LayoutGrid, List } from 'lucide-react'
import {
  getMaterialFileName,
  getMyHomeworks,
} from '../../../../../lib/homework.requests'
import { USER_ROLES } from '../../../../../store/slices/uiSlice'
import HomeworkItem from './HomeworkItem'
import HomeworksSkeleton from './HomeworksSkeleton'

const viewToggleBtn =
  'grid size-8 place-items-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500'

const matchesQuery = (homework, query) => {
  const q = query.trim().toLowerCase()
  if (!q) return true

  const haystack = [
    homework.id,
    homework._id,
    homework.title,
    homework.subject,
    homework.courseName,
    homework.courseCode,
    homework.className,
    homework.instructions,
    ...(homework.materials || []).map(getMaterialFileName),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return haystack.includes(q)
}

const matchesCourse = (homework, courseFilter) => {
  if (!courseFilter || courseFilter === 'All') return true

  const homeworkCourseId = String(
    homework.courseId || homework.course?._id || homework.course || '',
  )
  return Boolean(homeworkCourseId && homeworkCourseId === String(courseFilter))
}

const HomeworkList = ({
  search = '',
  courseFilter = 'All',
  refreshKey = 0,
}) => {
  const userRole = useSelector((state) => state.user.user?.role)
  const isTeacher = userRole === USER_ROLES.TEACHER

  const [view, setView] = useState('grid')
  const [homeworks, setHomeworks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadHomeworks = async () => {
      setLoading(true)
      setError('')

      try {
        const data = await getMyHomeworks()
        if (!cancelled) setHomeworks(data.homeworks || [])
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load homeworks.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadHomeworks()

    return () => {
      cancelled = true
    }
  }, [refreshKey])

  const filtered = useMemo(() => {
    return homeworks
      .filter(
        (homework) =>
          matchesCourse(homework, courseFilter) &&
          matchesQuery(homework, search),
      )
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
  }, [homeworks, search, courseFilter])

  if (loading) {
    return <HomeworksSkeleton />
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

  const emptyTitle = (() => {
    if (homeworks.length === 0) {
      if (isTeacher) return 'No homeworks yet'
      if (userRole === USER_ROLES.GUARDIAN || userRole === USER_ROLES.PARENT) {
        return 'No homework for your ward'
      }
      return 'No homework available'
    }
    if (search) return 'No matching homeworks'
    return 'No homeworks found'
  })()

  const emptyHint = (() => {
    if (homeworks.length === 0) {
      if (isTeacher) return 'Create homework for your students to get started.'
      if (userRole === USER_ROLES.GUARDIAN || userRole === USER_ROLES.PARENT) {
        return 'Homework for your ward’s classes will appear here.'
      }
      return 'Homework for your class will appear here.'
    }
    return 'Try a different search or subject / course filter.'
  })()

  const selectedCourseLabel =
    courseFilter !== 'All'
      ? homeworks.find(
          (homework) =>
            String(
              homework.courseId || homework.course?._id || homework.course,
            ) === String(courseFilter),
        )?.courseName ||
        homeworks.find(
          (homework) =>
            String(
              homework.courseId || homework.course?._id || homework.course,
            ) === String(courseFilter),
        )?.subject
      : null

  return (
    <section className='px-3 pb-4 sm:px-4'>
      <div className='mb-4 flex items-center justify-between gap-3'>
        <p className='text-[13px] text-gray-500 dark:text-gray-400'>
          Showing{' '}
          <span className='font-semibold text-gray-800 dark:text-gray-200'>
            {filtered.length}
          </span>{' '}
          {filtered.length === 1 ? 'homework' : 'homeworks'}
          {search ? (
            <span className='text-gray-400 dark:text-gray-500'>
              {' '}
              for “{search}”
            </span>
          ) : null}
          {courseFilter !== 'All' ? (
            <span className='text-gray-400 dark:text-gray-500'>
              {' '}
              · {selectedCourseLabel || 'Selected course'}
            </span>
          ) : null}
        </p>

        <div
          className='flex items-center gap-0.5 bg-gray-100 p-0.5 shadow-[var(--shadow-soft)] dark:bg-[#152238]'
          style={{ borderRadius: '0.95rem 0.3rem 0.95rem 0.3rem' }}
          role='group'
          aria-label='Change homework list layout'
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
            {emptyTitle}
          </p>
          <p className='mt-1 text-[13px] text-gray-500 dark:text-gray-400'>
            {emptyHint}
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
          {filtered.map((homework) => (
            <li key={homework._id || homework.id}>
              <HomeworkItem homework={homework} view={view} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default HomeworkList

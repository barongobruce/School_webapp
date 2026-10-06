import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { LayoutGrid, List } from 'lucide-react'
import {
  getMaterialFileName,
  getMyLessons,
} from '../../../../../lib/lesson.requests'
import { USER_ROLES } from '../../../../../store/slices/uiSlice'
import LessonItem from './LessonItem'
import LessonsSkeleton from './LessonsSkeleton'

const viewToggleBtn =
  'grid size-8 place-items-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500'

const matchesQuery = (lesson, query) => {
  const q = query.trim().toLowerCase()
  if (!q) return true

  const haystack = [
    lesson.id,
    lesson._id,
    lesson.title,
    lesson.subject,
    lesson.courseName,
    lesson.courseCode,
    lesson.className,
    lesson.notes,
    ...(lesson.materials || []).map(getMaterialFileName),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return haystack.includes(q)
}

const matchesCourse = (lesson, courseFilter) => {
  if (!courseFilter || courseFilter === 'All') return true

  const lessonCourseId = String(
    lesson.courseId || lesson.course?._id || lesson.course || '',
  )
  return Boolean(lessonCourseId && lessonCourseId === String(courseFilter))
}

const LessonList = ({
  search = '',
  courseFilter = 'All',
  refreshKey = 0,
}) => {
  const userRole = useSelector((state) => state.user.user?.role)
  const isTeacher = userRole === USER_ROLES.TEACHER

  const [view, setView] = useState('grid')
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadLessons = async () => {
      setLoading(true)
      setError('')

      try {
        const data = await getMyLessons()
        if (!cancelled) setLessons(data.lessons || [])
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load lessons.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadLessons()

    return () => {
      cancelled = true
    }
  }, [refreshKey])

  const filtered = useMemo(() => {
    return lessons
      .filter(
        (lesson) =>
          matchesCourse(lesson, courseFilter) && matchesQuery(lesson, search),
      )
      .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
  }, [lessons, search, courseFilter])

  if (loading) {
    return <LessonsSkeleton />
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
    if (lessons.length === 0) {
      if (isTeacher) return 'No lessons yet'
      if (userRole === USER_ROLES.GUARDIAN || userRole === USER_ROLES.PARENT) {
        return 'No lessons for your ward'
      }
      return 'No lessons available'
    }
    if (search) return 'No matching lessons'
    return 'No lessons found'
  })()

  const emptyHint = (() => {
    if (lessons.length === 0) {
      if (isTeacher) return 'Create a lesson plan to get started.'
      if (userRole === USER_ROLES.GUARDIAN || userRole === USER_ROLES.PARENT) {
        return 'Lessons for your ward’s classes will appear here.'
      }
      return 'Lessons for your class will appear here.'
    }
    return 'Try a different search or subject / course filter.'
  })()

  const selectedCourseLabel =
    courseFilter !== 'All'
      ? lessons.find(
          (lesson) =>
            String(lesson.courseId || lesson.course?._id || lesson.course) ===
            String(courseFilter),
        )?.courseName ||
        lessons.find(
          (lesson) =>
            String(lesson.courseId || lesson.course?._id || lesson.course) ===
            String(courseFilter),
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
          {filtered.length === 1 ? 'lesson' : 'lessons'}
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
          aria-label='Change lesson list layout'
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
          {filtered.map((lesson) => (
            <li key={lesson._id || lesson.id}>
              <LessonItem lesson={lesson} view={view} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default LessonList

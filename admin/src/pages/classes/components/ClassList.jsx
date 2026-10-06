import React, { useEffect, useMemo, useState } from 'react'
import { LayoutGrid, List } from 'lucide-react'
import { getClasses } from '../../../lib/class.requests'
import ClassItem from './ClassItem'
import ClassesSkeleton from './ClassesSkeleton'

const viewToggleBtn =
  'grid size-8 place-items-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500'

const getStatus = (classItem) =>
  typeof classItem.isActive === 'boolean'
    ? classItem.isActive
      ? 'Active'
      : 'Inactive'
    : classItem.status || 'Active'

const getCourseNames = (classItem) => {
  if (Array.isArray(classItem.courses) && classItem.courses.length) {
    return classItem.courses
      .map((course) =>
        typeof course === 'string' ? course : course?.courseName,
      )
      .filter(Boolean)
  }
  return classItem.subjects || []
}

const getTeacherNames = (classItem) => {
  if (classItem.classTeacher?.name) return classItem.classTeacher.name

  return (classItem.teachers || [])
    .map((teacher) => {
      if (typeof teacher === 'string') return null
      return [teacher.firstName, teacher.lastName].filter(Boolean).join(' ')
    })
    .filter(Boolean)
    .join(' ')
}

const matchesQuery = (classItem, query) => {
  const q = query.trim().toLowerCase()
  if (!q) return true

  const haystack = [
    classItem._id,
    classItem.classCode,
    classItem.className,
    classItem.name,
    classItem.id,
    classItem.grade,
    classItem.academicYear,
    classItem.description,
    getStatus(classItem),
    getTeacherNames(classItem),
    getCourseNames(classItem).join(' '),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return haystack.includes(q)
}

const ClassList = ({ search = '', statusFilter = 'All', refreshKey = 0 }) => {
  const [view, setView] = useState('grid')
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadClasses = async () => {
      setLoading(true)
      setError('')

      try {
        const data = await getClasses()
        if (!cancelled) setClasses(data.classes || [])
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load classes.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadClasses()

    return () => {
      cancelled = true
    }
  }, [refreshKey])

  const filtered = useMemo(() => {
    return classes.filter((classItem) => {
      const status = getStatus(classItem)
      const statusOk = statusFilter === 'All' ? true : status === statusFilter
      return statusOk && matchesQuery(classItem, search)
    })
  }, [classes, search, statusFilter])

  if (loading) {
    return <ClassesSkeleton />
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
          {filtered.length === 1 ? 'class' : 'classes'}
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
        </p>

        <div
          className='flex items-center gap-0.5 bg-gray-100 p-0.5 shadow-[var(--shadow-soft)] dark:bg-[#152238]'
          style={{ borderRadius: '0.95rem 0.3rem 0.95rem 0.3rem' }}
          role='group'
          aria-label='Change class list layout'
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
            {classes.length === 0
              ? 'No classes yet'
              : search
                ? 'No matching classes'
                : 'No classes found'}
          </p>
          <p className='mt-1 text-[13px] text-gray-500 dark:text-gray-400'>
            {classes.length === 0
              ? 'Add a class to get started.'
              : 'Try a different search or status filter.'}
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
          {filtered.map((classItem) => (
            <li key={classItem._id || classItem.id}>
              <ClassItem classItem={classItem} view={view} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default ClassList

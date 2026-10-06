import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, LayoutGrid, List, LoaderCircle } from 'lucide-react'
import { getMyStudents } from '../../../../../lib/student.requests'
import StudentItem from './StudentItem'
import StudentsSkeleton from './StudentsSkeleton'

const viewToggleBtn =
  'grid size-8 place-items-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500'

const StudentList = ({ search = '' }) => {
  const [view, setView] = useState('grid')
  const [students, setStudents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadStudents = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await getMyStudents({ search })
      setStudents(data.students || [])
    } catch (err) {
      setStudents([])
      setError(err.message || 'Failed to load students.')
    } finally {
      setIsLoading(false)
    }
  }, [search])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadStudents()
    }, search ? 250 : 0)
    return () => clearTimeout(timer)
  }, [loadStudents, search])

  const visibleStudents = useMemo(() => students, [students])

  if (isLoading) {
    return <StudentsSkeleton />
  }

  return (
    <section className='px-3 pb-4 sm:px-4'>
      <div className='mb-4 flex items-center justify-between gap-3'>
        <p className='text-[13px] text-gray-500 dark:text-gray-400'>
          Showing{' '}
          <span className='font-semibold text-gray-800 dark:text-gray-200'>
            {visibleStudents.length}
          </span>{' '}
          {visibleStudents.length === 1 ? 'student' : 'students'}
          {search ? (
            <span className='text-gray-400 dark:text-gray-500'>
              {' '}
              for “{search}”
            </span>
          ) : null}
        </p>

        <div
          className='flex items-center gap-0.5 bg-gray-100 p-0.5 shadow-[var(--shadow-soft)] dark:bg-[#152238]'
          style={{ borderRadius: '0.95rem 0.3rem 0.95rem 0.3rem' }}
          role='group'
          aria-label='Change student list layout'
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

      {error ? (
        <div
          className='bg-white px-6 py-12 text-center shadow-[var(--shadow-soft)] dark:bg-[#152238]'
          style={{ borderRadius: '1.6rem 0.55rem 1.6rem 0.55rem' }}
        >
          <AlertCircle
            className='mx-auto size-8 text-rose-400'
            strokeWidth={1.5}
          />
          <p className='mt-3 text-[13px] font-semibold text-gray-900 dark:text-gray-100'>
            Couldn’t load students
          </p>
          <p className='mt-1 text-[13px] text-gray-500 dark:text-gray-400'>
            {error}
          </p>
          <button
            type='button'
            onClick={loadStudents}
            className='mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-blue-600 hover:underline dark:text-blue-400'
          >
            <LoaderCircle className='size-3.5' strokeWidth={1.75} />
            Try again
          </button>
        </div>
      ) : visibleStudents.length === 0 ? (
        <div
          className='bg-white px-6 py-12 text-center shadow-[var(--shadow-soft)] dark:bg-[#152238]'
          style={{ borderRadius: '1.6rem 0.55rem 1.6rem 0.55rem' }}
        >
          <p className='text-[13px] font-semibold text-gray-900 dark:text-gray-100'>
            {search ? 'No matching students' : 'No students yet'}
          </p>
          <p className='mt-1 text-[13px] text-gray-500 dark:text-gray-400'>
            {search
              ? 'Try a different name or email.'
              : 'Students linked to your guardian account will appear here.'}
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
          {visibleStudents.map((student) => (
            <li key={student._id || student.id}>
              <StudentItem student={student} view={view} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default StudentList

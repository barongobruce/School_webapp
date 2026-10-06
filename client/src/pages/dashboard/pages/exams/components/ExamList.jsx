import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { LayoutGrid, List } from 'lucide-react'
import { getMyExams, EXAM_STATUS_OPTIONS } from '../../../../../lib/exam.requests'
import { USER_ROLES } from '../../../../../store/slices/uiSlice'
import ExamItem from './ExamItem'
import ExamsSkeleton from './ExamsSkeleton'

const viewToggleBtn =
  'grid size-8 place-items-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500'

const matchesQuery = (exam, query) => {
  const q = query.trim().toLowerCase()
  if (!q) return true

  const haystack = [
    exam.id,
    exam._id,
    exam.title,
    exam.subject,
    exam.className,
    exam.classCode,
    exam.examTypeLabel,
    exam.statusLabel,
    exam.venue,
    exam.instructions,
    exam.description,
    exam.teacher,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return haystack.includes(q)
}

const matchesStatus = (exam, statusFilter) => {
  if (!statusFilter || statusFilter === 'All') return true
  return String(exam.status || '') === String(statusFilter)
}

const ExamList = ({ search = '', statusFilter = 'All', refreshKey = 0 }) => {
  const userRole = useSelector((state) => state.user.user?.role)
  const isTeacher = userRole === USER_ROLES.TEACHER

  const [view, setView] = useState('grid')
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadExams = async () => {
      setLoading(true)
      setError('')

      try {
        const data = await getMyExams()
        if (!cancelled) setExams(data.exams || [])
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load exams.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadExams()

    return () => {
      cancelled = true
    }
  }, [refreshKey])

  const filtered = useMemo(() => {
    return exams
      .filter(
        (exam) =>
          matchesStatus(exam, statusFilter) && matchesQuery(exam, search),
      )
      .sort((a, b) => {
        const dateDiff = new Date(a.examDate) - new Date(b.examDate)
        if (dateDiff !== 0) return dateDiff
        return String(a.startTime || '').localeCompare(String(b.startTime || ''))
      })
  }, [exams, search, statusFilter])

  if (loading) {
    return <ExamsSkeleton />
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
    if (exams.length === 0) {
      if (isTeacher) return 'No exams yet'
      if (userRole === USER_ROLES.GUARDIAN || userRole === USER_ROLES.PARENT) {
        return 'No exams for your ward'
      }
      return 'No exams available'
    }
    if (search || statusFilter !== 'All') return 'No matching exams'
    return 'No exams found'
  })()

  const emptyHint = (() => {
    if (exams.length === 0) {
      if (isTeacher) return 'Schedule an exam for one of your classes to get started.'
      if (userRole === USER_ROLES.GUARDIAN || userRole === USER_ROLES.PARENT) {
        return 'Exams for your ward’s classes will appear here.'
      }
      return 'Exams for your class will appear here.'
    }
    return 'Try a different search or status filter.'
  })()

  return (
    <section className='px-3 pb-4 sm:px-4'>
      <div className='mb-4 flex items-center justify-between gap-3'>
        <p className='text-[13px] text-gray-500 dark:text-gray-400'>
          Showing{' '}
          <span className='font-semibold text-gray-800 dark:text-gray-200'>
            {filtered.length}
          </span>{' '}
          {filtered.length === 1 ? 'exam' : 'exams'}
          {search ? (
            <span className='text-gray-400 dark:text-gray-500'>
              {' '}
              for “{search}”
            </span>
          ) : null}
          {statusFilter !== 'All' ? (
            <span className='text-gray-400 dark:text-gray-500'>
              {' '}
              ·{' '}
              {EXAM_STATUS_OPTIONS.find((item) => item.value === statusFilter)
                ?.label || statusFilter}
            </span>
          ) : null}
        </p>

        <div
          className='flex items-center gap-0.5 bg-gray-100 p-0.5 shadow-[var(--shadow-soft)] dark:bg-[#152238]'
          style={{ borderRadius: '0.95rem 0.3rem 0.95rem 0.3rem' }}
          role='group'
          aria-label='Change exam list layout'
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
          {filtered.map((exam) => (
            <li key={exam._id || exam.id}>
              <ExamItem exam={exam} view={view} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default ExamList

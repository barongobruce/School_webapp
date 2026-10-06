import React, { useEffect, useState } from 'react'
import { LayoutGrid, List } from 'lucide-react'
import { getGuardians } from '../../../lib/guardian.requests'
import GuardianItem from './GuardianItem'
import GuardiansSkeleton from './GuardiansSkeleton'

const viewToggleBtn =
  'grid size-8 place-items-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500'

const GuardianList = ({ refreshKey = 0, search = '' }) => {
  const [view, setView] = useState('grid')
  const [guardians, setGuardians] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadGuardians = async () => {
      setLoading(true)
      setError('')

      try {
        const data = await getGuardians({ search })
        if (!cancelled) setGuardians(data.guardians || [])
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load guardians.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadGuardians()

    return () => {
      cancelled = true
    }
  }, [refreshKey, search])

  if (loading) {
    return <GuardiansSkeleton />
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
            {guardians.length}
          </span>{' '}
          {guardians.length === 1 ? 'guardian' : 'guardians'}
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
          aria-label='Change guardian list layout'
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

      {guardians.length === 0 ? (
        <div
          className='bg-white px-6 py-12 text-center shadow-[var(--shadow-soft)] dark:bg-[#152238]'
          style={{ borderRadius: '1.6rem 0.55rem 1.6rem 0.55rem' }}
        >
          <p className='text-[13px] font-semibold text-gray-900 dark:text-gray-100'>
            {search ? 'No matching guardians' : 'No guardians yet'}
          </p>
          <p className='mt-1 text-[13px] text-gray-500 dark:text-gray-400'>
            {search
              ? 'Try a different name, email, or phone.'
              : 'Guardians appear here when students are enrolled.'}
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
          {guardians.map((guardian) => (
            <li key={guardian._id || guardian.id}>
              <GuardianItem guardian={guardian} view={view} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default GuardianList

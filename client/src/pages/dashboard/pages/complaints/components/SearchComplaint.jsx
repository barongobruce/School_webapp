import React, { useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown, Plus, Search, Signal } from 'lucide-react'
import useModal from '../../../../../hooks/useModal'
import Button from '../../../../../components/Button'
import MakeComplaint from './MakeComplaint'

const STATUS_FILTERS = ['All', 'Open', 'Under Review', 'Resolved']

const URGENCY_FILTERS = [
  { value: 'All', label: 'All urgencies', hint: 'Show every priority' },
  { value: 'High', label: 'High', hint: 'Important and time-sensitive' },
  { value: 'Medium', label: 'Medium', hint: 'Standard follow-up' },
  { value: 'Low', label: 'Low', hint: 'Can wait if needed' },
]

const chipRadius = { borderRadius: '0.85rem 0.25rem 0.85rem 0.25rem' }
const dropdownRadius = { borderRadius: '1.1rem 0.35rem 1.1rem 0.35rem' }
const menuRadius = { borderRadius: '1.2rem 0.4rem 1.2rem 0.4rem' }
const iconRadius = { borderRadius: '0.75rem 0.22rem 0.75rem 0.22rem' }

const UrgencyDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const listId = useId()
  const selected =
    URGENCY_FILTERS.find((option) => option.value === value) ?? URGENCY_FILTERS[0]

  useEffect(() => {
    if (!open) return undefined

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className='relative w-full shrink-0 lg:w-56'>
      <button
        type='button'
        aria-haspopup='listbox'
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((prev) => !prev)}
        className='flex w-full items-center gap-2.5 bg-white px-3 py-2 text-left shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-lift)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:bg-[#152238]'
        style={dropdownRadius}
      >
        <span
          className='grid size-8 shrink-0 place-items-center bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400'
          style={iconRadius}
        >
          <Signal className='size-3.5' strokeWidth={1.75} aria-hidden='true' />
        </span>
        <span className='min-w-0 flex-1'>
          <span className='block text-[10px] font-medium tracking-[0.06em] text-gray-400 uppercase dark:text-gray-500'>
            Urgency
          </span>
          <span className='block truncate text-[13px] font-medium text-gray-900 dark:text-gray-100'>
            {selected.label}
          </span>
        </span>
        <ChevronDown
          className={`size-4 shrink-0 text-gray-400 transition-transform duration-200 dark:text-gray-500 ${
            open ? 'rotate-180' : ''
          }`}
          strokeWidth={1.75}
          aria-hidden='true'
        />
      </button>

      {open && (
        <ul
          id={listId}
          role='listbox'
          aria-label='Filter by urgency'
          className='absolute top-[calc(100%+0.5rem)] left-0 z-20 w-full min-w-[16rem] overflow-hidden bg-white py-1.5 shadow-[var(--shadow-lift)] dark:bg-[#152238]'
          style={menuRadius}
        >
          {URGENCY_FILTERS.map((option) => {
            const isSelected = option.value === value
            return (
              <li key={option.value} role='option' aria-selected={isSelected}>
                <button
                  type='button'
                  onClick={() => {
                    onChange(option.value)
                    setOpen(false)
                  }}
                  className={`flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors ${
                    isSelected
                      ? 'bg-gray-50 dark:bg-white/8'
                      : 'hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
                >
                  <span className='min-w-0 flex-1'>
                    <span
                      className={`block text-[13px] ${
                        isSelected
                          ? 'font-semibold text-gray-900 dark:text-gray-100'
                          : 'font-medium text-gray-700 dark:text-gray-200'
                      }`}
                    >
                      {option.label}
                    </span>
                    <span className='mt-0.5 block text-[11px] text-gray-400 dark:text-gray-500'>
                      {option.hint}
                    </span>
                  </span>
                  {isSelected && (
                    <Check
                      className='mt-0.5 size-4 shrink-0 text-gray-700 dark:text-gray-200'
                      strokeWidth={2}
                      aria-hidden='true'
                    />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

const SearchComplaint = ({
  onSearch,
  statusFilter,
  onStatusFilterChange,
  urgencyFilter,
  onUrgencyFilterChange,
  onComplaintCreated,
}) => {
  const { open } = useModal()
  const [query, setQuery] = useState('')

  const handleMakeComplaint = () => {
    open({
      title: 'Make Complaint',
      description: 'File a new incident report for review.',
      size: 'lg',
      content: <MakeComplaint onSuccess={onComplaintCreated} />,
    })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSearch?.(query.trim())
  }

  return (
    <section className='px-3 pt-3 pb-4 sm:px-4'>
      <div className='mb-5'>
        <h1 className='text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100'>
          Complaints
        </h1>
        <p className='mt-1 text-[13px] text-gray-500 dark:text-gray-400'>
          Search and review incidents between students, teachers, and guardians
        </p>
      </div>

      <div className='flex flex-col gap-2.5 lg:flex-row lg:items-center'>
        <UrgencyDropdown
          value={urgencyFilter}
          onChange={onUrgencyFilterChange}
        />

        <form onSubmit={handleSubmit} className='min-w-0 flex-1'>
          <div
            className='flex items-center gap-1.5 bg-gray-100 p-1 shadow-[var(--shadow-soft)] transition-all focus-within:bg-white focus-within:ring-3 focus-within:ring-blue-500/20 dark:bg-[#152238] dark:focus-within:bg-[#1a2740] dark:focus-within:ring-blue-400/25'
            style={{ borderRadius: '1.1rem 0.35rem 1.1rem 0.35rem' }}
          >
            <label className='relative flex min-w-0 flex-1 items-center'>
              <span className='sr-only'>Search complaints</span>
              <Search
                className='pointer-events-none absolute left-2.5 size-3.5 text-gray-400 dark:text-gray-500'
                strokeWidth={1.75}
                aria-hidden='true'
              />
              <input
                type='search'
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder='Search by title, ID, person, or category…'
                className='h-7 w-full bg-transparent py-1.5 pr-2 pl-8 text-[13px] text-gray-900 placeholder:text-gray-400 outline-none dark:text-gray-100 dark:placeholder:text-gray-500'
              />
            </label>

            <Button type='submit' variant='primary' size='sm' className='shrink-0'>
              <Search className='size-3.5' strokeWidth={2} aria-hidden='true' />
              Search
            </Button>
          </div>
        </form>

        <Button
          type='button'
          variant='primary'
          size='sm'
          onClick={handleMakeComplaint}
          className='shrink-0'
        >
          <Plus className='size-3.5' strokeWidth={2} aria-hidden='true' />
          Make complaint
        </Button>
      </div>

      <div
        className='mt-3 flex flex-wrap gap-1.5'
        role='group'
        aria-label='Filter complaints by status'
      >
        {STATUS_FILTERS.map((status) => {
          const isActive = statusFilter === status
          return (
            <button
              key={status}
              type='button'
              aria-pressed={isActive}
              onClick={() => onStatusFilterChange(status)}
              className={`px-3 py-1.5 text-[11px] font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${
                isActive
                  ? 'brand-gradient text-white shadow-[var(--shadow-brand)]'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 dark:bg-[#152238] dark:text-gray-300 dark:hover:bg-white/8 dark:hover:text-gray-100'
              }`}
              style={chipRadius}
            >
              {status}
            </button>
          )
        })}
      </div>
    </section>
  )
}

export default SearchComplaint

import React, { useEffect, useId, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { Check, ChevronDown, Filter, Plus, Search } from 'lucide-react'
import useModal from '../../../../../hooks/useModal'
import {
  EXAM_STATUS_OPTIONS,
} from '../../../../../lib/exam.requests'
import { USER_ROLES } from '../../../../../store/slices/uiSlice'
import Button from '../../../../../components/Button'
import MakeExam from './MakeExam'

const dropdownRadius = { borderRadius: '1.1rem 0.35rem 1.1rem 0.35rem' }
const menuRadius = { borderRadius: '1.2rem 0.4rem 1.2rem 0.4rem' }
const iconRadius = { borderRadius: '0.75rem 0.22rem 0.75rem 0.22rem' }

const StatusDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const listId = useId()

  const filterOptions = [
    {
      value: 'All',
      label: 'All statuses',
      hint: 'Show every exam',
    },
    ...EXAM_STATUS_OPTIONS.map((status) => ({
      value: status.value,
      label: status.label,
      hint: `Only ${status.label.toLowerCase()} exams`,
    })),
  ]

  const selected =
    filterOptions.find((option) => option.value === value) ?? filterOptions[0]

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
          <Filter className='size-3.5' strokeWidth={1.75} aria-hidden='true' />
        </span>
        <span className='min-w-0 flex-1'>
          <span className='block text-[10px] font-medium tracking-[0.06em] text-gray-400 uppercase dark:text-gray-500'>
            Status
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
          aria-label='Filter by status'
          className='absolute top-[calc(100%+0.5rem)] left-0 z-20 max-h-72 w-full min-w-[14rem] overflow-y-auto bg-white py-1.5 shadow-[var(--shadow-lift)] dark:bg-[#152238]'
          style={menuRadius}
        >
          {filterOptions.map((option) => {
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
                  {isSelected ? (
                    <Check
                      className='mt-0.5 size-4 shrink-0 text-blue-600 dark:text-blue-400'
                      strokeWidth={2}
                      aria-hidden='true'
                    />
                  ) : null}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

const SearchExam = ({
  onSearch,
  statusFilter,
  onStatusFilterChange,
  onExamCreated,
}) => {
  const { open } = useModal()
  const [query, setQuery] = useState('')
  const userRole = useSelector((state) => state.user.user?.role)
  const isTeacher = userRole === USER_ROLES.TEACHER

  const handleCreateExam = () => {
    open({
      title: 'Schedule exam',
      description: 'Create an exam session for one of your classes.',
      size: 'xl',
      content: <MakeExam onSuccess={onExamCreated} />,
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
          Exams
        </h1>
        <p className='mt-1 text-[13px] text-gray-500 dark:text-gray-400'>
          Browse assessments, schedules, and exam sessions
        </p>
      </div>

      <div className='flex flex-col gap-3 lg:flex-row lg:items-stretch'>
        <form onSubmit={handleSubmit} className='min-w-0 flex-1'>
          <div
            className='flex items-center gap-1.5 bg-gray-100 p-1 shadow-[var(--shadow-soft)] transition-all focus-within:bg-white focus-within:ring-3 focus-within:ring-blue-500/20 dark:bg-[#152238] dark:focus-within:bg-[#1a2740] dark:focus-within:ring-blue-400/25'
            style={{ borderRadius: '1.1rem 0.35rem 1.1rem 0.35rem' }}
          >
            <label className='relative flex min-w-0 flex-1 items-center'>
              <span className='sr-only'>Search exams</span>
              <Search
                className='pointer-events-none absolute left-2.5 size-3.5 text-gray-400 dark:text-gray-500'
                strokeWidth={1.75}
                aria-hidden='true'
              />
              <input
                type='search'
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder='Search by title, subject, class, or venue…'
                className='h-7 w-full bg-transparent py-1.5 pr-2 pl-8 text-[13px] text-gray-900 placeholder:text-gray-400 outline-none dark:text-gray-100 dark:placeholder:text-gray-500'
              />
            </label>

            <Button type='submit' variant='primary' size='sm' className='shrink-0'>
              <Search className='size-3.5' strokeWidth={2} aria-hidden='true' />
              Search
            </Button>
          </div>
        </form>

        <StatusDropdown value={statusFilter} onChange={onStatusFilterChange} />

        {isTeacher ? (
          <Button
            type='button'
            variant='primary'
            size='sm'
            onClick={handleCreateExam}
            className='shrink-0'
          >
            <Plus className='size-3.5' strokeWidth={2} aria-hidden='true' />
            Schedule exam
          </Button>
        ) : null}
      </div>
    </section>
  )
}

export default SearchExam

import React, { useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown, Filter, Search, Users } from 'lucide-react'
import { softRadius } from '../attendanceUtils'

const menuRadius = { borderRadius: '1.2rem 0.4rem 1.2rem 0.4rem' }
const iconRadius = { borderRadius: '0.75rem 0.22rem 0.75rem 0.22rem' }

const FilterDropdown = ({
  label,
  value,
  onChange,
  options,
  icon: Icon = Filter,
}) => {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const listId = useId()

  const selected =
    options.find((option) => option.value === value) ?? options[0]

  useEffect(() => {
    if (!open) return undefined

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
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
    <div ref={rootRef} className='relative w-full shrink-0 sm:w-52'>
      <button
        type='button'
        aria-haspopup='listbox'
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((prev) => !prev)}
        className='flex w-full items-center gap-2.5 bg-white px-3 py-2 text-left shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-lift)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:bg-[#152238]'
        style={softRadius}
      >
        <span
          className='grid size-8 shrink-0 place-items-center bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400'
          style={iconRadius}
        >
          <Icon className='size-3.5' strokeWidth={1.75} aria-hidden='true' />
        </span>
        <span className='min-w-0 flex-1'>
          <span className='block text-[10px] font-medium tracking-[0.06em] text-gray-400 uppercase dark:text-gray-500'>
            {label}
          </span>
          <span className='block truncate text-[13px] font-medium text-gray-900 dark:text-gray-100'>
            {selected.label}
          </span>
        </span>
        <ChevronDown
          className={`size-4 shrink-0 text-gray-400 transition-transform dark:text-gray-500 ${
            open ? 'rotate-180' : ''
          }`}
          strokeWidth={1.75}
        />
      </button>

      {open ? (
        <ul
          id={listId}
          role='listbox'
          className='absolute top-[calc(100%+0.5rem)] left-0 z-20 max-h-64 w-full min-w-[14rem] overflow-y-auto bg-white py-1.5 shadow-[var(--shadow-lift)] dark:bg-[#152238]'
          style={menuRadius}
        >
          {options.map((option) => {
            const active = option.value === value
            return (
              <li key={option.value}>
                <button
                  type='button'
                  role='option'
                  aria-selected={active}
                  onClick={() => {
                    onChange(option.value)
                    setOpen(false)
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-800 dark:bg-blue-500/15 dark:text-blue-200'
                      : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/5'
                  }`}
                >
                  <span className='min-w-0 flex-1 truncate'>{option.label}</span>
                  {active ? (
                    <Check className='size-3.5 shrink-0' strokeWidth={2} />
                  ) : null}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}

const AttendanceToolbar = ({
  search,
  onSearch,
  statusFilter,
  onStatusFilterChange,
  studentFilter,
  onStudentFilterChange,
  studentOptions = [],
  showStudentFilter = false,
  markFilter,
  onMarkFilterChange,
  showMarkFilter = false,
}) => {
  const statusOptions = [
    { value: 'All', label: 'All statuses' },
    { value: 'present', label: 'Present' },
    { value: 'absent', label: 'Absent' },
    { value: 'late', label: 'Late' },
    { value: 'excused', label: 'Excused' },
  ]

  const markOptions = [
    { value: 'All', label: 'All lessons' },
    { value: 'unmarked', label: 'Needs marking' },
    { value: 'incomplete', label: 'Partially marked' },
    { value: 'complete', label: 'Fully marked' },
  ]

  return (
    <div className='sticky top-0 z-10 mb-4 flex flex-col gap-3 bg-[var(--color-bg)]/90 px-3 py-3 backdrop-blur-md sm:px-4 lg:flex-row lg:items-center'>
      <label className='relative min-w-0 flex-1'>
        <span className='sr-only'>Search attendance</span>
        <Search
          className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400'
          strokeWidth={1.75}
        />
        <input
          type='search'
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder='Search by lesson, subject, class, or student…'
          className='form-field w-full py-2.5 pr-3 pl-10 text-[13px] shadow-[var(--shadow-soft)]'
          style={softRadius}
        />
      </label>

      <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
        {showStudentFilter ? (
          <FilterDropdown
            label='Student'
            value={studentFilter}
            onChange={onStudentFilterChange}
            options={[
              { value: 'All', label: 'All students' },
              ...studentOptions.map((ward) => ({
                value: String(ward.id || ward._id),
                label: ward.name,
              })),
            ]}
            icon={Users}
          />
        ) : null}

        {showMarkFilter ? (
          <FilterDropdown
            label='Marking'
            value={markFilter}
            onChange={onMarkFilterChange}
            options={markOptions}
          />
        ) : (
          <FilterDropdown
            label='Status'
            value={statusFilter}
            onChange={onStatusFilterChange}
            options={statusOptions}
          />
        )}
      </div>
    </div>
  )
}

export default AttendanceToolbar

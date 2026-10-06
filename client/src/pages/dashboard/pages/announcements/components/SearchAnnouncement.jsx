import React, { useState } from 'react'
import { Search } from 'lucide-react'

const SEVERITY_FILTERS = [
  { value: 'All', label: 'All' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

const CATEGORY_FILTERS = [
  { value: 'All', label: 'All categories' },
  { value: 'general', label: 'General' },
  { value: 'academic', label: 'Academic' },
  { value: 'disciplinary', label: 'Disciplinary' },
  { value: 'other', label: 'Other' },
]

const chipRadius = { borderRadius: '0.85rem 0.25rem 0.85rem 0.25rem' }

const FilterChips = ({ label, options, value, onChange }) => (
  <div className='flex flex-wrap gap-1.5' role='group' aria-label={label}>
    {options.map((option) => {
      const isActive = value === option.value
      return (
        <button
          key={option.value}
          type='button'
          aria-pressed={isActive}
          onClick={() => onChange(option.value)}
          className={`px-3 py-1.5 text-[11px] font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${
            isActive
              ? 'brand-gradient text-white shadow-[var(--shadow-brand)]'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 dark:bg-[#152238] dark:text-gray-300 dark:hover:bg-white/8 dark:hover:text-gray-100'
          }`}
          style={chipRadius}
        >
          {option.label}
        </button>
      )
    })}
  </div>
)

const SearchAnnouncement = ({
  onSearch,
  severityFilter,
  onSeverityFilterChange,
  categoryFilter,
  onCategoryFilterChange,
}) => {
  const [query, setQuery] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    onSearch?.(query.trim())
  }

  return (
    <section className='px-3 pt-3 pb-4 sm:px-4'>
      <div className='mb-5'>
        <h1 className='text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100'>
          Announcements
        </h1>
        <p className='mt-1 text-[13px] text-gray-500 dark:text-gray-400'>
          School notices relevant to your account
        </p>
      </div>

      <form onSubmit={handleSubmit} className='min-w-0'>
        <div
          className='flex items-center gap-1.5 bg-gray-100 p-1 shadow-[var(--shadow-soft)] transition-all focus-within:bg-white focus-within:ring-3 focus-within:ring-blue-500/20 dark:bg-[#152238] dark:focus-within:bg-[#1a2740] dark:focus-within:ring-blue-400/25'
          style={{ borderRadius: '1.1rem 0.35rem 1.1rem 0.35rem' }}
        >
          <label className='relative flex min-w-0 flex-1 items-center'>
            <span className='sr-only'>Search announcements</span>
            <Search
              className='pointer-events-none absolute left-2.5 size-3.5 text-gray-400 dark:text-gray-500'
              strokeWidth={1.75}
              aria-hidden='true'
            />
            <input
              type='search'
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder='Search by title or details…'
              className='w-full bg-transparent py-2.5 pr-3 pl-9 text-[13px] text-gray-900 outline-none placeholder:text-gray-400 dark:text-gray-100 dark:placeholder:text-gray-500'
            />
          </label>
          <button
            type='submit'
            className='brand-gradient shrink-0 px-3.5 py-2 text-[12px] font-semibold text-white shadow-[var(--shadow-brand)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500'
            style={chipRadius}
          >
            Search
          </button>
        </div>
      </form>

      <div className='mt-3 flex flex-col gap-2.5'>
        <FilterChips
          label='Filter by severity'
          options={SEVERITY_FILTERS}
          value={severityFilter}
          onChange={onSeverityFilterChange}
        />
        <FilterChips
          label='Filter by category'
          options={CATEGORY_FILTERS}
          value={categoryFilter}
          onChange={onCategoryFilterChange}
        />
      </div>
    </section>
  )
}

export default SearchAnnouncement

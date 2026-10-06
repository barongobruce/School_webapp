import React, { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import useModal from '../../../hooks/useModal'
import Button from '../../../components/Button'
import AddStudent from './AddStudent'

const SearchStudent = ({ onSearch, onStudentAdded }) => {
  const { open } = useModal()
  const [query, setQuery] = useState('')

  const handleAddStudent = () => {
    open({
      title: 'Enroll Student',
      description: 'A guided enrollment flow for a polished new student record.',
      size: 'full',
      content: <AddStudent onSuccess={onStudentAdded} />,
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
          Students
        </h1>
        <p className='mt-1 text-[13px] text-gray-500 dark:text-gray-400'>
          Search, view, and manage student records
        </p>
      </div>

      <div className='flex flex-col gap-2.5 sm:flex-row sm:items-center'>
        <form onSubmit={handleSubmit} className='min-w-0 flex-1'>
          <div
            className='flex items-center gap-1.5 bg-gray-100 p-1 shadow-[var(--shadow-soft)] transition-all focus-within:bg-white focus-within:ring-3 focus-within:ring-blue-500/20 dark:bg-[#152238] dark:focus-within:bg-[#1a2740] dark:focus-within:ring-blue-400/25'
            style={{ borderRadius: '1.1rem 0.35rem 1.1rem 0.35rem' }}
          >
            <label className='relative flex min-w-0 flex-1 items-center'>
              <span className='sr-only'>Search students</span>
              <Search
                className='pointer-events-none absolute left-2.5 size-3.5 text-gray-400 dark:text-gray-500'
                strokeWidth={1.75}
                aria-hidden='true'
              />
              <input
                type='search'
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder='Search by name or student ID…'
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
          onClick={handleAddStudent}
          className='shrink-0'
        >
          <Plus className='size-3.5' strokeWidth={2} aria-hidden='true' />
          Add Student
        </Button>
      </div>
    </section>
  )
}

export default SearchStudent

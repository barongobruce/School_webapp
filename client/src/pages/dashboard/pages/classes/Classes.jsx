import React, { useState } from 'react'
import SearchClass from './components/SearchClass'
import ClassList from './components/ClassList'

const Classes = () => {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  return (
    <div className='flex min-h-0 flex-1 flex-col overflow-y-auto'>
      <SearchClass
        onSearch={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />
      <ClassList search={search} statusFilter={statusFilter} />
    </div>
  )
}

export default Classes

import React, { useState } from 'react'
import SearchGuardian from './components/SearchGuardian'
import GuardianList from './components/GuardianList'

const Guardians = () => {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  return (
    <div className='flex min-h-0 flex-1 flex-col overflow-y-auto'>
      <SearchGuardian
        onSearch={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />
      <GuardianList search={search} statusFilter={statusFilter} />
    </div>
  )
}

export default Guardians

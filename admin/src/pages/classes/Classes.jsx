import React, { useState } from 'react'
import SearchClass from './components/SearchClass'
import ClassList from './components/ClassList'

const Classes = () => {
  const [refreshKey, setRefreshKey] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  return (
    <div className='flex min-h-0 flex-1 flex-col overflow-y-auto'>
      <SearchClass
        onSearch={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onClassAdded={() => setRefreshKey((key) => key + 1)}
      />
      <ClassList
        refreshKey={refreshKey}
        search={search}
        statusFilter={statusFilter}
      />
    </div>
  )
}

export default Classes

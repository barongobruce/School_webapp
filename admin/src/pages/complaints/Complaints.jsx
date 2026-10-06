import React, { useState } from 'react'
import SearchComplaint from './components/SearchComplaint'
import ComplaintList from './components/ComplaintList'

const Complaints = () => {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [urgencyFilter, setUrgencyFilter] = useState('All')

  return (
    <div className='flex min-h-0 flex-1 flex-col overflow-y-auto'>
      <SearchComplaint
        onSearch={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        urgencyFilter={urgencyFilter}
        onUrgencyFilterChange={setUrgencyFilter}
      />
      <ComplaintList
        search={search}
        statusFilter={statusFilter}
        urgencyFilter={urgencyFilter}
      />
    </div>
  )
}

export default Complaints

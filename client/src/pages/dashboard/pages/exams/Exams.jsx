import React, { useState } from 'react'
import SearchExam from './components/SearchExam'
import ExamList from './components/ExamList'

const Exams = () => {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [refreshKey, setRefreshKey] = useState(0)

  const handleExamCreated = () => {
    setRefreshKey((key) => key + 1)
  }

  return (
    <div className='flex min-h-0 flex-1 flex-col overflow-y-auto'>
      <SearchExam
        onSearch={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onExamCreated={handleExamCreated}
      />
      <ExamList
        search={search}
        statusFilter={statusFilter}
        refreshKey={refreshKey}
      />
    </div>
  )
}

export default Exams

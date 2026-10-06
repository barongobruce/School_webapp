import React, { useState } from 'react'
import SearchCourse from './components/SearchCourse'
import CourseList from './components/CourseList'

const Courses = () => {
  const [refreshKey, setRefreshKey] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')

  return (
    <div className='flex min-h-0 flex-1 flex-col overflow-y-auto'>
      <SearchCourse
        onSearch={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        onCourseAdded={() => setRefreshKey((key) => key + 1)}
      />
      <CourseList
        refreshKey={refreshKey}
        search={search}
        statusFilter={statusFilter}
        typeFilter={typeFilter}
      />
    </div>
  )
}

export default Courses

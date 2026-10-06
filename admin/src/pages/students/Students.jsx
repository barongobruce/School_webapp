import React, { useState } from 'react'
import SearchStudent from './components/SearchStudent'
import StudentList from './components/StudentList'

const Students = () => {
  const [refreshKey, setRefreshKey] = useState(0)
  const [search, setSearch] = useState('')

  return (
    <div className='flex min-h-0 flex-1 flex-col overflow-y-auto'>
      <SearchStudent
        onSearch={setSearch}
        onStudentAdded={() => setRefreshKey((key) => key + 1)}
      />
      <StudentList refreshKey={refreshKey} search={search} />
    </div>
  )
}

export default Students

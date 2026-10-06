import React, { useState } from 'react'
import SearchTeacher from './components/SearchTeacher'
import TeacherList from './components/TeacherList'

const Teachers = () => {
  const [refreshKey, setRefreshKey] = useState(0)
  const [search, setSearch] = useState('')

  return (
    <div className='flex min-h-0 flex-1 flex-col overflow-y-auto'>
      <SearchTeacher
        onSearch={setSearch}
        onTeacherAdded={() => setRefreshKey((key) => key + 1)}
      />
      <TeacherList refreshKey={refreshKey} search={search} />
    </div>
  )
}

export default Teachers

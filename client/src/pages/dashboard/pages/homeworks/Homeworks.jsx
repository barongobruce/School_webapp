import React, { useState } from 'react'
import SearchHomework from './components/SearchHomework'
import HomeworkList from './components/HomeworkList'

const Homeworks = () => {
  const [search, setSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState('All')
  const [refreshKey, setRefreshKey] = useState(0)

  const handleHomeworkCreated = () => {
    setRefreshKey((key) => key + 1)
  }

  return (
    <div className='flex min-h-0 flex-1 flex-col overflow-y-auto'>
      <SearchHomework
        onSearch={setSearch}
        courseFilter={courseFilter}
        onCourseFilterChange={setCourseFilter}
        onHomeworkCreated={handleHomeworkCreated}
      />
      <HomeworkList
        search={search}
        courseFilter={courseFilter}
        refreshKey={refreshKey}
      />
    </div>
  )
}

export default Homeworks

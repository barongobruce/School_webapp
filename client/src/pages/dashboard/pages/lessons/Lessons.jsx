import React, { useState } from 'react'
import SearchLesson from './components/SearchLesson'
import LessonList from './components/LessonList'

const Lessons = () => {
  const [search, setSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState('All')
  const [refreshKey, setRefreshKey] = useState(0)

  const handleLessonCreated = () => {
    setRefreshKey((key) => key + 1)
  }

  return (
    <div className='flex min-h-0 flex-1 flex-col overflow-y-auto'>
      <SearchLesson
        onSearch={setSearch}
        courseFilter={courseFilter}
        onCourseFilterChange={setCourseFilter}
        onLessonCreated={handleLessonCreated}
      />
      <LessonList
        search={search}
        courseFilter={courseFilter}
        refreshKey={refreshKey}
      />
    </div>
  )
}

export default Lessons

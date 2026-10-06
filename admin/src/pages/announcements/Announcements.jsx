import React, { useState } from 'react'
import SearchAnnouncement from './components/SearchAnnouncement'
import AnnouncementList from './components/AnnouncementList'

const Announcements = () => {
  const [refreshKey, setRefreshKey] = useState(0)
  const [search, setSearch] = useState('')
  const [severityFilter, setSeverityFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')

  return (
    <div className='flex min-h-0 flex-1 flex-col overflow-y-auto'>
      <SearchAnnouncement
        onSearch={setSearch}
        severityFilter={severityFilter}
        onSeverityFilterChange={setSeverityFilter}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        onAnnouncementAdded={() => setRefreshKey((key) => key + 1)}
      />
      <AnnouncementList
        refreshKey={refreshKey}
        search={search}
        severityFilter={severityFilter}
        categoryFilter={categoryFilter}
      />
    </div>
  )
}

export default Announcements

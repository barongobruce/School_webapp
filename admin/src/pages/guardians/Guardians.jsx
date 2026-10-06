import React, { useState } from 'react'
import SearchGuardian from './components/SearchGuardian'
import GuardianList from './components/GuardianList'

const Guardians = () => {
  const [refreshKey, setRefreshKey] = useState(0)
  const [search, setSearch] = useState('')

  return (
    <div className='flex min-h-0 flex-1 flex-col overflow-y-auto'>
      <SearchGuardian
        onSearch={setSearch}
        onGuardianAdded={() => setRefreshKey((key) => key + 1)}
      />
      <GuardianList refreshKey={refreshKey} search={search} />
    </div>
  )
}

export default Guardians

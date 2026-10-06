import React, { useState } from 'react'
import SearchPayment from './components/SearchPayment'
import PaymentList from './components/PaymentList'

const Fees = () => {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [feeTypeFilter, setFeeTypeFilter] = useState('All')
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className='flex min-h-0 flex-1 flex-col overflow-y-auto'>
      <SearchPayment
        query={query}
        onQueryChange={setQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        feeTypeFilter={feeTypeFilter}
        onFeeTypeFilterChange={setFeeTypeFilter}
        onInvoiceCreated={() => setRefreshKey((key) => key + 1)}
      />
      <PaymentList
        query={query}
        statusFilter={statusFilter}
        feeTypeFilter={feeTypeFilter}
        refreshKey={refreshKey}
      />
    </div>
  )
}

export default Fees

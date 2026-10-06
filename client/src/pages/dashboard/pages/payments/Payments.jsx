import React, { useState } from 'react'
import SearchPayment from './components/SearchPayment'
import PaymentList from './components/PaymentList'

const Payments = () => {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [kindFilter, setKindFilter] = useState('All')
  const [feeTypeFilter, setFeeTypeFilter] = useState('All')

  return (
    <div className='flex min-h-0 flex-1 flex-col overflow-y-auto'>
      <SearchPayment
        onSearch={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        kindFilter={kindFilter}
        onKindFilterChange={setKindFilter}
        feeTypeFilter={feeTypeFilter}
        onFeeTypeFilterChange={setFeeTypeFilter}
      />
      <PaymentList
        search={search}
        statusFilter={statusFilter}
        kindFilter={kindFilter}
        feeTypeFilter={feeTypeFilter}
      />
    </div>
  )
}

export default Payments

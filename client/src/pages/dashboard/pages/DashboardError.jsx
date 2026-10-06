import React from 'react'
import RouteErrorView from '../../../components/RouteErrorView'

const DashboardError = () => (
  <RouteErrorView
    brandHint='School workspace'
    homeTo='/dashboard'
    homeLabel='Back to dashboard'
    notFoundMessage='This route doesn’t exist in your workspace — or it may have moved.'
  />
)

export default DashboardError

import React from 'react'
import RouteErrorView from '../components/RouteErrorView'

const ErrorPage = () => (
  <RouteErrorView
    brandHint='School portal'
    homeTo='/'
    homeLabel='Back home'
    notFoundMessage='This page doesn’t exist on the Adesua site — or it may have moved.'
  />
)

export default ErrorPage

import { Navigate } from 'react-router-dom'
import { isAuthenticated } from '../lib/auth'

const GuestRoute = ({ children }) => {
  if (isAuthenticated()) {
    return <Navigate to='/' replace />
  }

  return children
}

export default GuestRoute

import { Navigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import { LoaderCircle } from 'lucide-react'
import { isAuthenticated } from '../lib/auth'
import { fetchCurrentUser } from '../store/slices/userSlice'

const ProtectedRoute = ({ children }) => {
  const location = useLocation()
  const dispatch = useDispatch()
  const user = useSelector((state) => state.user.user)
  const status = useSelector((state) => state.user.status)

  useEffect(() => {
    if (isAuthenticated() && !user && status === 'idle') {
      dispatch(fetchCurrentUser())
    }
  }, [dispatch, user, status])

  if (!isAuthenticated()) {
    return <Navigate to='/login' replace state={{ from: location }} />
  }

  if (status === 'failed') {
    return <Navigate to='/login' replace state={{ from: location }} />
  }

  if (!user) {
    return (
      <div className='grid min-h-screen place-items-center bg-gray-100 dark:bg-[#060d1a]'>
        <LoaderCircle
          className='size-8 animate-spin text-[#20509b] dark:text-blue-400'
          strokeWidth={2}
          aria-label='Loading'
        />
      </div>
    )
  }

  return children
}

export default ProtectedRoute

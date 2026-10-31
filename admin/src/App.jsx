import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, Outlet } from 'react-router-dom'
import AppNavbar from './components/AppNavbar.jsx'
import AppSidebar from './components/AppSidebar.jsx'
import Modal from './components/Modal.jsx'
import { setSidebarOpen } from './store/slices/uiSlice'

const App = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const isSidebarOpen = useSelector((state) => state.ui.isSidebarOpen)

  useEffect(() => {
    if (window.matchMedia('(max-width: 767px)').matches) {
      dispatch(setSidebarOpen(false))
    }
  }, [dispatch, location.pathname])

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape' && window.matchMedia('(max-width: 767px)').matches) {
        dispatch(setSidebarOpen(false))
      }
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [dispatch])

  return (
    <>
      <main className='relative flex h-[100dvh] min-h-0 gap-2.5 overflow-hidden bg-gray-100 p-1.5 sm:p-2.5 dark:bg-[#060d1a]'>
        {isSidebarOpen && (
          <button
            type='button'
            aria-label='Close navigation menu'
            onClick={() => dispatch(setSidebarOpen(false))}
            className='fixed inset-0 z-40 bg-slate-950/55 md:hidden'
          />
        )}
        <div
          id='admin-navigation'
          className={`h-full shrink-0 border border-gray-200/80 bg-white p-3 shadow-[var(--shadow-soft)] transition-[width,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] dark:border-white/10 dark:bg-[#0c1528] ${
            isSidebarOpen
              ? 'fixed inset-y-1.5 left-1.5 z-50 w-[min(18rem,calc(100vw-3rem))] sm:inset-y-2.5 sm:left-2.5 md:static md:z-auto md:w-[fit-content] md:min-w-48 md:translate-x-0 lg:w-1/7'
              : 'hidden -translate-x-full md:block md:w-auto md:translate-x-0'
          }`}
          style={{ borderRadius: '2rem 0.7rem 2rem 0.7rem' }}
        >
          <AppSidebar />
        </div>
        <section className='flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[1.25rem] border border-gray-200/80 bg-white shadow-[var(--shadow-soft)] dark:border-white/10 dark:bg-[#0c1528]'>
          <div className='shrink-0 border-b border-gray-100/90 px-3 py-2.5 sm:px-4 dark:border-white/8'>
            <AppNavbar />
          </div>
          <div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
            <Outlet />
          </div>
        </section>
      </main>
      <Modal />
    </>
  )
}

export default App

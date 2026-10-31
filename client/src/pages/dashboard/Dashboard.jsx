import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Outlet, useLocation } from 'react-router-dom'
import DashboardSidebar from './components/DashboardSidebar'
import DashboardNavbar from './components/DashboardNavbar'
import Modal from './components/Modal'
import { setSidebarOpen } from '../../store/slices/uiSlice'

const Dashboard = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const isSidebarOpen = useSelector((state) => state.ui.isSidebarOpen)
  const previousPathname = useRef(location.pathname)

  useEffect(() => {
    if (previousPathname.current !== location.pathname) {
      previousPathname.current = location.pathname
      if (window.matchMedia('(max-width: 767px)').matches) {
        dispatch(setSidebarOpen(false))
      }
    }
  }, [dispatch, location.pathname])

  useEffect(() => {
    if (!isSidebarOpen || !window.matchMedia('(max-width: 767px)').matches) return

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') dispatch(setSidebarOpen(false))
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [dispatch, isSidebarOpen])

  return (
    <>
      <main className='relative flex h-[100dvh] min-h-0 gap-1.5 overflow-hidden bg-gray-100 p-1.5 dark:bg-[#060d1a] md:gap-2.5 md:p-2.5'>
        {isSidebarOpen && (
          <button
            type='button'
            aria-label='Close navigation menu'
            onClick={() => dispatch(setSidebarOpen(false))}
            className='fixed inset-0 z-40 bg-slate-950/55 backdrop-blur-[2px] md:hidden'
          />
        )}
        <div
          id='dashboard-navigation'
          className={`shrink-0 border border-gray-200/80 bg-white p-3 shadow-[var(--shadow-soft)] transition-[transform,width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] dark:border-white/10 dark:bg-[#0c1528] ${
            isSidebarOpen
              ? 'fixed inset-y-1.5 left-1.5 z-50 h-auto w-[min(18rem,calc(100vw-1rem))] md:static md:z-auto md:h-full md:w-[fit-content] md:min-w-48 lg:w-1/7'
              : 'hidden md:block md:h-full md:w-auto'
          }`}
          style={{ borderRadius: '2rem 0.7rem 2rem 0.7rem' }}
        >
          <DashboardSidebar />
        </div>
        <section className='flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[1.25rem] border border-gray-200/80 bg-white shadow-[var(--shadow-soft)] dark:border-white/10 dark:bg-[#0c1528]'>
          <div className='shrink-0 border-b border-gray-100/90 px-3 py-2.5 sm:px-4 dark:border-white/8'>
            <DashboardNavbar />
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

export default Dashboard

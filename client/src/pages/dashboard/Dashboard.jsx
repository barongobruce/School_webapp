import React from 'react'
import { useSelector } from 'react-redux'
import { Outlet } from 'react-router-dom'
import DashboardSidebar from './components/DashboardSidebar'
import DashboardNavbar from './components/DashboardNavbar'
import Modal from './components/Modal'

const Dashboard = () => {
  const isSidebarOpen = useSelector((state) => state.ui.isSidebarOpen)

  return (
    <>
      <main className='flex h-screen gap-2.5 bg-gray-100 p-2.5 dark:bg-[#060d1a]'>
        <div
          className={`h-full shrink-0 border border-gray-200/80 bg-white p-3 shadow-[var(--shadow-soft)] transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] dark:border-white/10 dark:bg-[#0c1528] ${
            isSidebarOpen ? 'w-[fit-content] min-w-48 lg:w-1/7' : 'w-auto'
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

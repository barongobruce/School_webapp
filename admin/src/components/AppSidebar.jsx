import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import LogoSm from '../assets/logo sm.png'
import {
  LayoutDashboard,
  FileText,
  GraduationCap,
  Users,
  Calendar,
  School,
  BookOpen,
  DollarSign,
  ClipboardList,
  Megaphone,
  LogOut,
  User,
} from 'lucide-react'
import { setSidebarOpen } from '../store/slices/uiSlice'
import { clearUser } from '../store/slices/userSlice'
import { clearToken } from '../lib/auth'

const sidebarMenu = [
  { id: 1, path: '/', icon: LayoutDashboard, label: 'Overview' },
  { id: 2, path: '/complaints', icon: FileText, label: 'Complaints' },
  { id: 3, path: '/students', icon: GraduationCap, label: 'Students' },
  { id: 4, path: '/teachers', icon: Users, label: 'Teachers' },
  { id: 6, path: '/guardians', icon: Users, label: 'Guardians' },
  { id: 7, path: '/classes', icon: School, label: 'Classes' },
  { id: 8, path: '/courses', icon: BookOpen, label: 'Courses' },
  { id: 11, path: '/announcements', icon: Megaphone, label: 'Announcements' },
  { id: 9, path: '/payments', icon: DollarSign, label: 'Payments' },
  // { id: 12, path: '/profile', icon: User, label: 'Profile' },
]

const AppSidebar = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const isSidebarOpen = useSelector((state) => state.ui.isSidebarOpen)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1023px)')

    const syncLabelsToViewport = () => {
      dispatch(setSidebarOpen(!mediaQuery.matches))
    }

    syncLabelsToViewport()
    mediaQuery.addEventListener('change', syncLabelsToViewport)
    return () => mediaQuery.removeEventListener('change', syncLabelsToViewport)
  }, [dispatch])

  const handleLogout = () => {
    clearToken()
    dispatch(clearUser())
    navigate('/login', { replace: true })
  }

  const linkClass = ({ isActive }) =>
    [
      'flex items-center text-[12px] font-medium tracking-[-0.01em] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
      isSidebarOpen ? 'gap-2.5 px-2.5 py-[13px]' : 'justify-center px-2 py-[13px]',
      isActive
        ? 'brand-gradient text-white shadow-[var(--shadow-brand)]'
        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200',
    ].join(' ')

  return (
    <aside className='flex h-full flex-col'>
      <Link
        to='/'
        className={`flex shrink-0 items-center ${
          isSidebarOpen ? 'gap-2.5 px-1' : 'justify-center'
        }`}
      >
        <img
          src={LogoSm}
          alt='Barongo'
          className='size-7 shrink-0 object-contain'
          style={{ borderRadius: '0.55rem 0.2rem 0.55rem 0.2rem' }}
        />

        {isSidebarOpen && (
          <span className='min-w-0'>
            <span className='block truncate text-[13px] font-bold tracking-[-0.02em] text-gray-900 uppercase dark:text-white'>
              Barongo
            </span>
            <span className='block truncate text-[10px] font-medium tracking-[0.06em] text-gray-400 uppercase'>
              Admin
            </span>
          </span>
        )}
      </Link>

      <div className='mt-4 mb-2 h-px shrink-0 bg-gray-100 dark:bg-white/8' />

      <nav className='min-h-0 flex-1'>
        <ul className='flex h-full flex-col gap-0.5 overflow-y-auto [scrollbar-width:thin]'>
          {sidebarMenu.map((item) => (
            <li key={item.id}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                title={!isSidebarOpen ? item.label : undefined}
                className={linkClass}
                style={{ borderRadius: '1.1rem 0.35rem 1.1rem 0.35rem' }}
              >
                <item.icon className='size-3.5 shrink-0' strokeWidth={1.75} />
                {isSidebarOpen && <span className='truncate'>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className='mt-2 shrink-0 border-t border-gray-100 pt-2 dark:border-white/8'>
        <button
          type='button'
          onClick={handleLogout}
          title={!isSidebarOpen ? 'Logout' : undefined}
          className={`flex w-full items-center text-[12px] font-medium text-red-500 transition-colors duration-150 hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300 ${
            isSidebarOpen ? 'gap-2.5 px-2.5 py-[13px]' : 'justify-center px-2 py-[13px]'
          }`}
          style={{ borderRadius: '1.1rem 0.35rem 1.1rem 0.35rem' }}
        >
          <LogOut className='size-3.5 shrink-0' strokeWidth={1.75} />
          {isSidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}

export default AppSidebar

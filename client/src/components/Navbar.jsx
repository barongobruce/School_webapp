import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useTheme } from 'next-themes'
import { Link, useLocation } from 'react-router-dom'
import { Menu, Moon, Sun, X } from 'lucide-react'
import LogoMark from '../assets/logo sm.png'
import { isAuthenticated } from '../lib/auth'
import Button from './Button'

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About' },
  { path: '/programs', label: 'Programs' },
  { path: '/Activities', label: 'Activities' },
  { path: '/contact', label: 'Contact' },
]

/* Cool radius — matches Button (TL·TR·BR·BL) */
const linkRadiusStyle = {
  borderRadius: '1.8rem 0.6rem 1.8rem 0.6rem',
}

const Navbar = () => {
  const pathname = useLocation().pathname
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const user = useSelector((state) => state.user.user)
  const signedIn = Boolean(user) || isAuthenticated()
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = mounted && resolvedTheme === 'dark'

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setIsMobileNavOpen(false)
  }, [pathname])

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') setIsMobileNavOpen(false)
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  useEffect(() => {
    if (!isMobileNavOpen) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isMobileNavOpen])

  const linkClass = (path) => {
    const active = pathname === path
    return [
      'px-3.5 py-2 text-sm transition-all duration-200 ease-spring text-ink',
      active
        ? 'font-semibold border-2 border-ink bg-transparent hover:opacity-70'
        : 'font-medium border-2 border-transparent hover:bg-surface-2',
    ].join(' ')
  }

  return (
    <>
      <header className='fixed inset-x-0 top-0 z-50 pt-3'>
        <div className='container relative'>
          {/* Cool radius — matches Button (TL·TR·BR·BL), scaled to navbar height */}
          <div className='relative flex w-full items-center justify-between rounded-[2rem_0.7rem_2rem_0.7rem] border border-line bg-surface px-4 py-2.5 shadow-[var(--shadow-soft)] sm:px-5'>
            <Link
              to='/'
              className='flex min-w-0 items-center gap-2.5 text-ink'
              onClick={() => setIsMobileNavOpen(false)}
            >
              <span className='flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-[var(--shadow-soft)] ring-1 ring-line'>
                <img
                  src={LogoMark}
                  alt=''
                  className='!h-full !w-full object-cover'
                  aria-hidden='true'
                />
              </span>
              <span className='font-heading truncate text-[1.05rem] font-bold tracking-tight'>
                BARONGO
              </span>
              <span className='hidden truncate text-[0.65rem] font-semibold tracking-[0.08em] text-gray-400 uppercase sm:inline'>
                Brighter Future
              </span>
            </Link>
              </span>
            </Link>

            <nav className='absolute left-1/2 hidden -translate-x-1/2 items-center gap-0.5 lg:flex'>
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={linkClass(link.path)}
                  style={linkRadiusStyle}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className='flex items-center gap-1.5 sm:gap-2'>
              <button
                type='button'
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className='inline-flex size-8 items-center justify-center rounded-full text-ink transition-opacity duration-200 hover:opacity-70'
              >
                <span className='relative grid size-4 place-items-center overflow-hidden'>
                  <Sun
                    className={`absolute size-4 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      isDark
                        ? 'translate-y-0 rotate-0 opacity-100'
                        : '-translate-y-3 rotate-45 opacity-0'
                    }`}
                    strokeWidth={1.75}
                  />
                  <Moon
                    className={`absolute size-4 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      isDark
                        ? 'translate-y-3 -rotate-45 opacity-0'
                        : 'translate-y-0 rotate-0 opacity-100'
                    }`}
                    strokeWidth={1.75}
                  />
                </span>
              </button>
              <div className='hidden items-center gap-1.5 sm:gap-2 lg:flex'>
                {signedIn ? (
                  <Button to='/dashboard' size='sm'>
                    Dashboard
                  </Button>
                ) : (
                  <>
                    <Button to='/contact' size='sm'>
                      Enroll now
                    </Button>
                    <Link
                      to='/login'
                      className='px-2 text-sm font-medium text-ink transition-colors hover:text-blue-600 dark:hover:text-blue-300'
                    >
                      Login
                    </Link>
                  </>
                )}
              </div>
              <button
                type='button'
                aria-label={isMobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={isMobileNavOpen}
                onClick={() => setIsMobileNavOpen((open) => !open)}
                className='inline-flex size-8 items-center justify-center rounded-full text-ink transition-opacity duration-200 hover:opacity-70 lg:hidden'
              >
                {isMobileNavOpen ? (
                  <X className='size-[1.875rem]' strokeWidth={1.75} />
                ) : (
                  <Menu className='size-5' strokeWidth={1.75} />
                )}
              </button>
            </div>
          </div>

          {isMobileNavOpen && (
            <div className='absolute inset-x-0 top-full z-50 mt-2 bg-transparent lg:hidden'>
              <nav
                className='mobile-nav-menu flex flex-col gap-1.5 rounded-[1.4rem] border border-white/20 bg-blue-900/40 p-2 shadow-[var(--shadow-soft)] backdrop-blur-xl backdrop-saturate-150 dark:border-white/10 dark:bg-[#0c1528]/85'
                aria-label='Mobile navigation'
              >
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileNavOpen(false)}
                    className={`mobile-nav-item bg-surface px-4 py-3.5 text-sm text-ink shadow-[var(--shadow-soft)] transition-opacity duration-200 hover:opacity-70 ${
                      pathname === link.path
                        ? 'font-semibold border-2 border-ink'
                        : 'font-medium border-2 border-transparent'
                    }`}
                    style={linkRadiusStyle}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className='mobile-nav-item mt-1 flex flex-col gap-2 rounded-[1.2rem] bg-surface p-3 shadow-[var(--shadow-soft)]'>
                  {signedIn ? (
                    <Button
                      to='/dashboard'
                      size='sm'
                      onClick={() => setIsMobileNavOpen(false)}
                    >
                      Dashboard
                    </Button>
                  ) : (
                    <>
                      <Button
                        to='/contact'
                        size='sm'
                        onClick={() => setIsMobileNavOpen(false)}
                      >
                        Enroll now
                      </Button>
                      <Button
                        to='/login'
                        size='sm'
                        onClick={() => setIsMobileNavOpen(false)}
                      >
                        Login
                      </Button>
                    </>
                  )}
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>
      {/* Offset content under fixed nav — skip on home so hero is full-bleed */}
      {pathname !== '/' && (
        <div className='h-[4.75rem]' aria-hidden='true' />
      )}
    </>
  )
}

export default Navbar

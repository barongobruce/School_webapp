import { Link } from 'react-router-dom'
import Logo from '../assets/logo.png'
import LogoMark from '../assets/logo sm.png'

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About Us' },
  { path: '/programs', label: 'Programs' },
  { path: '/Activities', label: 'Activities' },
  { path: '/contact', label: 'Contact Us' },
]

const socialLinks = [
  {
    href: 'https://facebook.com',
    label: 'Facebook',
    icon: (
      <path d='M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4z' />
    ),
  },
  {
    href: 'https://instagram.com',
    label: 'Instagram',
    icon: (
      <path d='M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153.509.5.902 1.105 1.153 1.772.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772c-.5.509-1.105.902-1.772 1.153-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6.5-.25a1.25 1.25 0 1 0-2.5 0 1.25 1.25 0 0 0 2.5 0zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z' />
    ),
  },
  {
    href: 'https://twitter.com',
    label: 'X (Twitter)',
    icon: (
      <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z' />
    ),
  },
  {
    href: 'https://youtube.com',
    label: 'YouTube',
    icon: (
      <path d='M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' />
    ),
  },
  {
    href: 'https://linkedin.com',
    label: 'LinkedIn',
    icon: (
      <path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1-.004-4.123 2.062 2.062 0 0 1 .004 4.123zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' />
    ),
  },
]

const Footer = () => {
  return (
    <footer className='relative overflow-hidden bg-surface pt-16 md:pt-20'>
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_top,rgba(61,118,198,0.08),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(61,118,198,0.16),transparent_70%)]'
      />

      <div className='container relative flex flex-col items-center text-center'>
        {/* Light: full wordmark · Dark: mark + type (logo.png text is dark-on-transparent) */}
        <Link
          to='/'
          className='mx-auto mb-1 block w-28 transition-opacity duration-200 hover:opacity-80 dark:hidden'
        >
          <img src={Logo} alt='BARONGO Academy' className='!h-auto !w-full object-contain' />
        </Link>
        <Link
          to='/'
          className='mx-auto mb-1 hidden items-center gap-3 transition-opacity duration-200 hover:opacity-80 dark:inline-flex'
        >
          <span className='flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl ring-1 ring-line'>
            <img
              src={LogoMark}
              alt=''
              className='!h-full !w-full object-cover'
              aria-hidden='true'
            />
          </span>
          <span className='text-left'>
            <span className='font-heading block text-lg font-bold tracking-tight text-ink'>
              BARONGO ACADEMY
            </span>
          </span>
        </Link>
        <p className='mt-2 max-w-sm text-xs font-semibold leading-relaxed text-muted md:text-sm'>
          Nurturing curious minds across Kenya — from kindergarten to highschool.
        </p>

        <nav
          aria-label='Footer'
          className='mt-8 flex flex-wrap items-center justify-center gap-x-1 gap-y-1'
        >
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className='px-3.5 py-2 text-sm font-semibold text-ink transition-colors duration-200 hover:text-blue-700 dark:hover:text-blue-300'
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <ul className='mt-8 flex flex-wrap items-center justify-center gap-2.5'>
          {socialLinks.map((social) => (
            <li key={social.label}>
              <a
                href={social.href}
                target='_blank'
                rel='noopener noreferrer'
                aria-label={social.label}
                className='grid size-10 place-items-center bg-blue-50 text-blue-800 ring-1 ring-blue-100 transition-all duration-200 ease-spring hover:-translate-y-0.5 hover:bg-blue-700 hover:text-white hover:ring-blue-700 hover:shadow-[var(--shadow-brand)] dark:bg-white/10 dark:text-blue-200 dark:ring-white/15 dark:hover:bg-blue-600 dark:hover:text-white dark:hover:ring-blue-500'
                style={{ borderRadius: '0.95rem 0.3rem 0.95rem 0.3rem' }}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                  className='size-4'
                  aria-hidden='true'
                >
                  {social.icon}
                </svg>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className='relative mt-12 border-t border-line'>
        <small className='mx-auto block py-5 text-center text-xs font-semibold text-muted md:text-sm'>
          &copy; {new Date().getFullYear()} Barongo Academy. All rights reserved.
        </small>
      </div>
    </footer>
  )
}

export default Footer

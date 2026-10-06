import React from 'react'
import {
  isRouteErrorResponse,
  useNavigate,
  useRouteError,
} from 'react-router-dom'
import { ArrowLeft, Home, RefreshCw } from 'lucide-react'
import LogoSm from '../assets/logo sm.png'
import Button from './Button'

const shellRadius = { borderRadius: '1.75rem 0.55rem 1.75rem 0.55rem' }
const logoRadius = { borderRadius: '0.95rem 0.3rem 0.95rem 0.3rem' }
const chipRadius = { borderRadius: '0.85rem 0.25rem 0.85rem 0.25rem' }

export const getErrorMeta = (error, { notFoundMessage } = {}) => {
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return {
        code: '404',
        title: 'Page not found',
        message:
          notFoundMessage ||
          'This page doesn’t exist — or it may have moved.',
      }
    }

    return {
      code: String(error.status || 'Error'),
      title: error.statusText || 'Something went wrong',
      message:
        (typeof error.data === 'string' && error.data) ||
        error.data?.message ||
        'An unexpected error stopped this page from loading.',
    }
  }

  if (error instanceof Error) {
    return {
      code: '500',
      title: 'Something went wrong',
      message:
        error.message || 'An unexpected error stopped this page from loading.',
    }
  }

  return {
    code: 'Error',
    title: 'Something went wrong',
    message: 'An unexpected error stopped this page from loading.',
  }
}

/**
 * Minimal full-viewport route error surface shared by public + dashboard apps.
 */
const RouteErrorView = ({
  brandHint = 'School portal',
  homeTo = '/',
  homeLabel = 'Back home',
  notFoundMessage,
}) => {
  const error = useRouteError()
  const navigate = useNavigate()
  const { code, title, message } = getErrorMeta(error, { notFoundMessage })

  return (
    <main className='relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--color-bg)] px-4 py-12'>
      <div className='pointer-events-none absolute inset-0' aria-hidden='true'>
        <div className='error-orb absolute -top-28 -left-20 size-[26rem] rounded-full bg-[#20509b]/[0.14] blur-3xl dark:bg-[#3d76c6]/[0.18]' />
        <div className='error-orb-delayed absolute -right-24 -bottom-32 size-[30rem] rounded-full bg-[#08214e]/[0.1] blur-3xl dark:bg-[#20509b]/25' />
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.72),transparent_58%)] dark:bg-[radial-gradient(circle_at_50%_35%,rgba(21,34,56,0.55),transparent_58%)]' />
      </div>

      <section
        className='error-panel relative w-full max-w-lg overflow-hidden border border-gray-200/70 bg-white/90 px-6 py-7 shadow-[var(--shadow-lift)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0c1528]/92 sm:px-8 sm:py-9'
        style={shellRadius}
      >
        <div
          aria-hidden='true'
          className='absolute inset-x-0 top-0 h-[3px] brand-gradient'
        />

        <div className='relative flex flex-col gap-7'>
          <div className='flex items-center justify-between gap-3'>
            <div className='flex min-w-0 items-center gap-2.5'>
              <span
                className='flex size-10 shrink-0 items-center justify-center overflow-hidden shadow-[var(--shadow-soft)] ring-1 ring-[#20509b]/15 dark:ring-blue-400/20'
                style={logoRadius}
              >
                <img
                  src={LogoSm}
                  alt=''
                  className='!h-full !w-full object-cover'
                  aria-hidden='true'
                />
              </span>
              <div className='min-w-0'>
                <p className='truncate text-[15px] font-semibold tracking-tight text-gray-900 dark:text-white'>
                  ADESUA
                </p>
                <p className='text-[11px] font-medium tracking-[0.08em] text-gray-400 uppercase dark:text-gray-500'>
                  {brandHint}
                </p>
              </div>
            </div>

            <span
              className='inline-flex shrink-0 items-center bg-gray-100 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-gray-600 dark:bg-white/8 dark:text-gray-300'
              style={chipRadius}
            >
              {code === '404' ? 'Not found' : 'Route error'}
            </span>
          </div>

          <div>
            <p
              className='error-code brand-gradient bg-clip-text text-[4.75rem] leading-none font-semibold tracking-tight text-transparent sm:text-[5.5rem]'
              aria-hidden='true'
            >
              {code}
            </p>
            <h1 className='mt-3 text-[1.55rem] font-semibold tracking-tight text-gray-900 dark:text-white sm:text-[1.75rem]'>
              {title}
            </h1>
            <p className='mt-2 max-w-sm text-[14px] leading-relaxed text-gray-500 dark:text-gray-400'>
              {message}
            </p>
          </div>

          <div className='flex flex-col gap-2.5 sm:flex-row sm:items-center'>
            <Button to={homeTo} variant='primary' size='md' className='w-full sm:w-auto'>
              <Home className='size-4' strokeWidth={1.75} />
              {homeLabel}
            </Button>
            <Button
              type='button'
              variant='secondary'
              size='md'
              className='w-full sm:w-auto dark:border-white/12 dark:bg-[#152238] dark:text-gray-100 dark:hover:bg-[#1a2c48]'
              onClick={() => window.location.reload()}
            >
              <RefreshCw className='size-4' strokeWidth={1.75} />
              Reload
            </Button>
            <Button
              type='button'
              variant='ghost'
              size='md'
              className='w-full text-gray-700 sm:w-auto dark:text-gray-300 dark:hover:bg-white/5 dark:hover:opacity-100'
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className='size-4' strokeWidth={1.75} />
              Go back
            </Button>
          </div>
        </div>
      </section>

      <style>{`
        .error-panel {
          animation: errorPanelIn 520ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .error-code {
          animation: errorCodeIn 700ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .error-orb {
          animation: errorOrbFloat 10s ease-in-out infinite;
        }

        .error-orb-delayed {
          animation: errorOrbFloat 12s ease-in-out infinite reverse;
        }

        @keyframes errorPanelIn {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.985);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes errorCodeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
            letter-spacing: 0.1em;
          }
          to {
            opacity: 1;
            transform: translateY(0);
            letter-spacing: -0.02em;
          }
        }

        @keyframes errorOrbFloat {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(14px, -18px, 0) scale(1.04);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .error-panel,
          .error-code,
          .error-orb,
          .error-orb-delayed {
            animation: none;
          }
        }
      `}</style>
    </main>
  )
}

export default RouteErrorView

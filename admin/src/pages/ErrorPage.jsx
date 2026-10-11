import React from 'react'
import {
  isRouteErrorResponse,
  useNavigate,
  useRouteError,
} from 'react-router-dom'
import { ArrowLeft, Home, RefreshCw } from 'lucide-react'
import LogoSm from '../assets/logo sm.png'
import Button from '../components/Button'

const softRadius = { borderRadius: '1.6rem 0.55rem 1.6rem 0.55rem' }
const logoRadius = { borderRadius: '0.95rem 0.3rem 0.95rem 0.3rem' }
const chipRadius = { borderRadius: '0.85rem 0.25rem 0.85rem 0.25rem' }

const getErrorMeta = (error) => {
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return {
        code: '404',
        title: 'Page not found',
        message:
          'This route doesn’t exist in the admin workspace — or it may have moved.',
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
      message: error.message || 'An unexpected error stopped this page from loading.',
    }
  }

  return {
    code: 'Error',
    title: 'Something went wrong',
    message: 'An unexpected error stopped this page from loading.',
  }
}

const ErrorPage = () => {
  const error = useRouteError()
  const navigate = useNavigate()
  const { code, title, message } = getErrorMeta(error)

  return (
    <main className='relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4f7fc] px-4 py-10 dark:bg-[#060d1a]'>
      <div className='pointer-events-none absolute inset-0' aria-hidden='true'>
        <div className='error-orb absolute -top-24 -left-16 size-[28rem] rounded-full bg-[#20509b]/18 blur-3xl dark:bg-[#3d76c6]/20' />
        <div className='error-orb-delayed absolute -right-20 -bottom-28 size-[32rem] rounded-full bg-[#08214e]/12 blur-3xl dark:bg-[#20509b]/25' />
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.75),transparent_55%)] dark:bg-[radial-gradient(circle_at_top,rgba(21,34,56,0.65),transparent_55%)]' />
        <div
          className='absolute inset-0 opacity-[0.35] dark:opacity-[0.2]'
          style={{
            backgroundImage:
              'linear-gradient(rgba(32,80,155,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(32,80,155,0.08) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            maskImage:
              'radial-gradient(circle at center, black 20%, transparent 75%)',
          }}
        />
      </div>

      <section
        className='error-panel relative w-full max-w-xl overflow-hidden border border-white/70 bg-white/85 p-6 shadow-[var(--shadow-lift)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0c1528]/90 sm:p-8'
        style={softRadius}
      >
        <div
          className='pointer-events-none absolute -top-16 right-0 size-44 rounded-full bg-[#3d76c6]/15 blur-2xl dark:bg-[#3d76c6]/20'
          aria-hidden='true'
        />

        <div className='relative flex flex-col items-start gap-6'>
          <div className='flex w-full items-center justify-between gap-3'>
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
                  BARONGO
                </p>
                <p className='text-[11px] font-medium tracking-[0.08em] text-gray-400 uppercase dark:text-gray-500'>
                  Admin workspace
                </p>
              </div>
            </div>

            <span
              className='inline-flex shrink-0 items-center bg-gray-100 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-gray-600 dark:bg-white/8 dark:text-gray-300'
              style={chipRadius}
            >
              Route error
            </span>
          </div>

          <div className='w-full'>
            <p
              className='error-code brand-gradient bg-clip-text text-[4.5rem] leading-none font-semibold tracking-tight text-transparent sm:text-[5.5rem]'
              aria-hidden='true'
            >
              {code}
            </p>
            <h1 className='mt-3 text-[1.65rem] font-semibold tracking-tight text-gray-900 dark:text-white sm:text-[1.85rem]'>
              {title}
            </h1>
            <p className='mt-2 max-w-md text-[14px] leading-relaxed text-gray-500 dark:text-gray-400'>
              {message}
            </p>
          </div>

          <div
            className='w-full border border-gray-100 bg-gray-50/80 px-3.5 py-3 dark:border-white/8 dark:bg-white/4'
            style={chipRadius}
          >
            <p className='text-[11px] font-medium tracking-[0.08em] text-gray-400 uppercase dark:text-gray-500'>
              What you can do
            </p>
            <p className='mt-1 text-[13px] leading-relaxed text-gray-600 dark:text-gray-300'>
              Head back to the dashboard, or reload this page if the issue was
              temporary.
            </p>
          </div>

          <div className='flex w-full flex-col gap-2.5 sm:flex-row sm:items-center'>
            <Button to='/' variant='primary' size='md' className='w-full sm:w-auto'>
              <Home className='size-4' strokeWidth={1.75} />
              Back to dashboard
            </Button>
            <Button
              type='button'
              variant='secondary'
              size='md'
              className='w-full sm:w-auto'
              onClick={() => window.location.reload()}
            >
              <RefreshCw className='size-4' strokeWidth={1.75} />
              Reload page
            </Button>
            <Button
              type='button'
              variant='ghost'
              size='md'
              className='w-full sm:w-auto'
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
            transform: translateY(18px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes errorCodeIn {
          from {
            opacity: 0;
            transform: translateY(12px);
            letter-spacing: 0.12em;
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
            transform: translate3d(18px, -22px, 0) scale(1.05);
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

export default ErrorPage

import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  X,
} from 'lucide-react'
import LogoSm from '../../assets/logo sm.png'
import Button from '../../components/Button'
import IconInput from '../../components/IconInput'
import { loginAdmin } from '../../lib/api'
import { setToken } from '../../lib/auth'
import { setUser } from '../../store/slices/userSlice'

const panelRadius = { borderRadius: '1.6rem 0.55rem 1.6rem 0.55rem' }
const chipRadius = { borderRadius: '1rem 0.3rem 1rem 0.3rem' }
const logoRadius = { borderRadius: '0.85rem 0.28rem 0.85rem 0.28rem' }

const labelClass =
  'mb-1.5 block text-[11px] font-medium tracking-[0.06em] text-gray-500 uppercase dark:text-gray-400'

const FormError = ({ message, onDismiss }) => (
  <div
    role='alert'
    className='login-error relative overflow-hidden border border-red-200/80 bg-gradient-to-br from-red-50 via-white to-orange-50/60 dark:border-red-500/25 dark:from-red-950/50 dark:via-[#0c1528] dark:to-orange-950/20'
    style={chipRadius}
  >
    <div
      className='absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-red-500 via-red-400 to-orange-400'
      aria-hidden
    />
    <div className='flex items-start gap-3 px-3.5 py-3 pl-4'>
      <span
        className='mt-0.5 grid size-8 shrink-0 place-items-center bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-[0_8px_18px_rgba(220,38,38,0.28)]'
        style={{ borderRadius: '0.7rem 0.2rem 0.7rem 0.2rem' }}
      >
        <AlertCircle className='size-3.5' strokeWidth={2.25} />
      </span>
      <p className='min-w-0 flex-1 pt-1 text-[13px] leading-relaxed font-medium text-red-800 dark:text-red-100'>
        {message}
      </p>
      {onDismiss ? (
        <button
          type='button'
          onClick={onDismiss}
          aria-label='Dismiss error'
          className='grid size-8 shrink-0 place-items-center text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-600 dark:hover:bg-red-500/15 dark:hover:text-red-200'
          style={{ borderRadius: '0.7rem 0.2rem 0.7rem 0.2rem' }}
        >
          <X className='size-3.5' strokeWidth={2.25} />
        </button>
      ) : null}
    </div>
  </div>
)

const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!form.email.trim() || !form.password) {
      setError('Enter your email and password to continue.')
      return
    }

    setIsSubmitting(true)

    try {
      const data = await loginAdmin({
        email: form.email.trim(),
        password: form.password,
      })
      setToken(data.token)
      dispatch(setUser(data.admin))
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className='relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f3f6fb] px-4 py-10 dark:bg-[#070d18]'>
      <div className='pointer-events-none absolute inset-0' aria-hidden>
        <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(61,118,198,0.16),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(8,33,78,0.1),_transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top,_rgba(61,118,198,0.22),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(8,33,78,0.45),_transparent_50%)]' />
        <div className='absolute -top-24 -right-16 size-72 rounded-full bg-[#3d76c6]/20 blur-3xl dark:bg-[#3d76c6]/25' />
        <div className='absolute top-1/3 -left-20 size-64 rounded-full bg-[#08214e]/10 blur-3xl dark:bg-[#20509b]/20' />
        <div className='absolute right-1/4 bottom-0 size-56 rounded-full bg-[#20509b]/10 blur-3xl dark:bg-[#08214e]/40' />
      </div>

      <div className='login-shell relative z-10 w-full max-w-[26rem]'>
        <div className='mb-7 text-center'>
          <div
            className='mx-auto mb-5 grid size-14 place-items-center border border-white/70 bg-white/90 shadow-[var(--shadow-soft)] dark:border-white/10 dark:bg-[#0f1a30]'
            style={logoRadius}
          >
            <img
              src={LogoSm}
              alt=''
              className='size-8 object-contain'
              aria-hidden
            />
          </div>

          <p className='text-[11px] font-semibold tracking-[0.18em] text-[#20509b] uppercase dark:text-blue-300'>
            Admin workspace
          </p>
          <h1 className='mt-2 text-[2rem] font-bold tracking-[-0.03em] text-[#08214e] dark:text-white'>
            BARONGO
          </h1>
          <p className='mx-auto mt-2 max-w-xs text-[13px] leading-relaxed text-gray-500 dark:text-gray-400'>
            Sign in to manage school operations.
          </p>
        </div>

        <div
          className='relative overflow-hidden border border-gray-200/70 bg-gradient-to-br from-white via-white to-blue-50/50 p-5 shadow-[var(--shadow-soft)] dark:border-white/8 dark:from-[#0f1a30] dark:via-[#0c1528] dark:to-[#152848]/60 sm:p-6'
          style={panelRadius}
        >
          <div
            className='pointer-events-none absolute -top-10 right-0 size-28 rounded-full bg-[#3d76c6]/10 blur-2xl dark:bg-[#3d76c6]/15'
            aria-hidden
          />

          <div className='relative mb-5 flex items-center gap-3'>
            <span
              className='grid size-9 shrink-0 place-items-center brand-gradient text-white shadow-[0_8px_18px_rgba(32,80,155,0.28)]'
              style={chipRadius}
            >
              <ShieldCheck className='size-4' strokeWidth={2} />
            </span>
            <div className='min-w-0'>
              <p className='text-[13px] font-semibold text-gray-900 dark:text-white'>
                Secure sign in
              </p>
              <p className='text-[12px] text-gray-500 dark:text-gray-400'>
                Use your admin account credentials
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate className='relative space-y-4'>
            {error ? (
              <FormError message={error} onDismiss={() => setError('')} />
            ) : null}

            <div>
              <label htmlFor='email' className={labelClass}>
                Email
              </label>
              <IconInput
                id='email'
                name='email'
                type='email'
                icon={Mail}
                autoComplete='email'
                required
                value={form.email}
                onChange={handleChange}
                placeholder='admin@school.edu'
              />
            </div>

            <div>
              <label htmlFor='password' className={labelClass}>
                Password
              </label>
              <div className='relative'>
                <IconInput
                  id='password'
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  icon={Lock}
                  autoComplete='current-password'
                  required
                  minLength={8}
                  value={form.password}
                  onChange={handleChange}
                  placeholder='Enter your password'
                  className='pr-12'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword((prev) => !prev)}
                  className='absolute top-1/2 right-3 z-10 -translate-y-1/2 p-1.5 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200'
                  style={{ borderRadius: '0.65rem 0.2rem 0.65rem 0.2rem' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className='size-4' strokeWidth={1.75} />
                  ) : (
                    <Eye className='size-4' strokeWidth={1.75} />
                  )}
                </button>
              </div>
            </div>

            <Button
              type='submit'
              variant='primary'
              size='lg'
              loading={isSubmitting}
              className='mt-2 w-full'
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </div>

        <p className='mt-6 text-center text-[12px] text-gray-400 dark:text-gray-500'>
          Authorized administrators only
        </p>
      </div>

      <style>{`
        .login-shell {
          animation: loginIn 420ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .login-error {
          animation: loginErrorIn 280ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes loginIn {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes loginErrorIn {
          from {
            opacity: 0;
            transform: translateY(-6px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </section>
  )
}

export default Login

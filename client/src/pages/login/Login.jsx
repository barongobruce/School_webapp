import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import LogoMark from '../../assets/logo sm.png'
import CampusImage from '../../assets/graduate4.jpg'
import Button from '../../components/Button'
import { loginUser } from '../../lib/api'
import { setToken } from '../../lib/auth'
import { cn } from '../../lib/utils'
import { setUser } from '../../store/slices/userSlice'

const fieldRadius = { borderRadius: '1.1rem 0.35rem 1.1rem 0.35rem' }

const inputClass =
  'w-full border border-line bg-white px-3.5 py-3 text-sm text-ink placeholder:text-faint outline-none transition-colors duration-200 ease-spring hover:border-blue-300 focus:border-blue-600 focus:ring-3 focus:ring-blue-600/15 dark:border-white/10 dark:bg-[#0c1528] dark:text-white dark:placeholder:text-gray-500 dark:hover:border-white/20 dark:focus:border-blue-400 dark:focus:ring-blue-400/20'

const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'
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
      const data = await loginUser({
        email: form.email.trim(),
        password: form.password,
      })
      setToken(data.token)
      dispatch(setUser(data.user))
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message || 'Sign in failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className='relative min-h-screen overflow-hidden bg-[var(--color-bg)]'>
      <div className='grid min-h-screen lg:grid-cols-2'>
        {/* Brand panel */}
        <motion.aside
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className='brand-atmosphere relative hidden min-h-screen overflow-hidden lg:block'
        >
          <img
            src={CampusImage}
            alt=''
            className='absolute inset-0 !h-full !w-full object-cover opacity-45 mix-blend-luminosity'
            aria-hidden='true'
          />
          <div className='absolute inset-0 bg-gradient-to-t from-[#041536] via-[#041536]/55 to-transparent' />

          <div className='relative z-10 flex h-full flex-col justify-between p-10 xl:p-14'>
            <Link to='/' className='flex w-fit items-center gap-2.5 text-white'>
              <span
                className='flex size-9 shrink-0 items-center justify-center overflow-hidden ring-1 ring-white/20'
                style={{ borderRadius: '0.55rem 0.2rem 0.55rem 0.2rem' }}
              >
                <img
                  src={LogoMark}
                  alt=''
                  className='!h-full !w-full object-cover'
                  aria-hidden='true'
                />
              </span>
              <span className='min-w-0'>
                <span className='block text-[13px] font-bold tracking-[-0.02em] uppercase'>
                  Barongo
                </span>
                <span className='block text-[10px] font-medium tracking-[0.06em] text-white/55 uppercase'>
                  Achiever
                </span>
              </span>
            </Link>

            <div className='max-w-md'>
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                className='font-heading text-4xl font-bold tracking-tight text-white xl:text-5xl'
              >
                Your campus portal starts here.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                className='mt-4 text-[15px] leading-relaxed text-white/70'
              >
                Sign in to classes, assignments, attendance, fees, and everything
                that keeps learning moving.
              </motion.p>
            </div>
          </div>
        </motion.aside>

        {/* Form panel */}
        <div className='relative flex min-h-screen items-center justify-center px-5 py-12 sm:px-8'>
          <div
            className='pointer-events-none absolute inset-0 opacity-70 lg:opacity-100'
            aria-hidden='true'
          >
            <div className='absolute -top-24 -right-16 size-72 rounded-full bg-blue-200/40 blur-3xl dark:bg-blue-500/10' />
            <div className='absolute -bottom-28 -left-20 size-80 rounded-full bg-yellow-200/35 blur-3xl dark:bg-yellow-500/5' />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className='relative z-10 w-full max-w-[24rem]'
          >
            <Link
              to='/'
              className='mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-ink dark:text-gray-400 dark:hover:text-white'
            >
              <ArrowLeft className='size-4' strokeWidth={1.75} />
              Back to home
            </Link>

            <div className='mb-8 flex items-center gap-2.5 lg:hidden'>
              <span
                className='flex size-9 shrink-0 items-center justify-center overflow-hidden shadow-[var(--shadow-soft)] ring-1 ring-line'
                style={{ borderRadius: '0.55rem 0.2rem 0.55rem 0.2rem' }}
              >
                <img
                  src={LogoMark}
                  alt=''
                  className='!h-full !w-full object-cover'
                  aria-hidden='true'
                />
              </span>
              <span className='min-w-0'>
                <span className='block text-[13px] font-bold tracking-[-0.02em] text-ink uppercase dark:text-white'>
                  Barongo
                </span>
                <span className='block text-[10px] font-medium tracking-[0.06em] text-faint uppercase'>
                  Achiever
                </span>
              </span>
            </div>

            <h1 className='font-heading text-2xl font-bold tracking-tight text-ink dark:text-white sm:text-[1.75rem]'>
              Sign in
            </h1>
            <p className='mt-2 text-sm leading-relaxed text-muted dark:text-gray-400'>
              Use the email and password issued during your registration. Check
              your email inbox for that.
            </p>

            <form onSubmit={handleSubmit} className='mt-8 flex flex-col gap-5'>
              {error && (
                <div
                  role='alert'
                  className='border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300'
                  style={fieldRadius}
                >
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor='email'
                  className='mb-1.5 block text-xs font-medium text-muted dark:text-gray-400'
                >
                  Email
                </label>
                <input
                  id='email'
                  name='email'
                  type='email'
                  autoComplete='email'
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder='you@adesuaacademy.edu'
                  className={inputClass}
                  style={fieldRadius}
                />
              </div>

              <div>
                <div className='mb-1.5 flex items-center justify-between gap-3'>
                  <label
                    htmlFor='password'
                    className='block text-xs font-medium text-muted dark:text-gray-400'
                  >
                    Password
                  </label>
                  <Link
                    to='/contact'
                    className='text-xs font-medium text-blue-700 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
                  >
                    Need help?
                  </Link>
                </div>
                <div className='relative'>
                  <input
                    id='password'
                    name='password'
                    type={showPassword ? 'text' : 'password'}
                    autoComplete='current-password'
                    required
                    minLength={6}
                    value={form.password}
                    onChange={handleChange}
                    placeholder='••••••••'
                    className={cn(inputClass, 'pr-11')}
                    style={fieldRadius}
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword((prev) => !prev)}
                    className='absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-1.5 text-faint transition-colors hover:text-ink dark:hover:text-white'
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
                size='lg'
                loading={isSubmitting}
                className='mt-1 w-full'
              >
                {isSubmitting ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>

            <p className='mt-8 text-center text-sm text-muted dark:text-gray-400'>
              New to ADESUA?{' '}
              <Link
                to='/contact'
                className='font-semibold text-blue-700 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
              >
                Contact admissions
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Login

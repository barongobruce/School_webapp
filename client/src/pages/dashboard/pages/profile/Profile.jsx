import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useTheme } from 'next-themes'
import {
  AtSign,
  Bell,
  Briefcase,
  Check,
  Eye,
  EyeOff,
  Fingerprint,
  KeyRound,
  Lock,
  LoaderCircle,
  LogOut,
  Mail,
  MapPin,
  Monitor,
  Moon,
  Phone,
  Shield,
  Sun,
  UserRound,
} from 'lucide-react'
import { changeUserPassword } from '../../../../lib/api'
import { clearToken, formatUserRole } from '../../../../lib/auth'
import { clearUser } from '../../../../store/slices/userSlice'
import { getInitials } from '../../../../utils/avatar'

const SECTIONS = [
  { id: 'profile', label: 'Profile', hint: 'Name & contact', icon: UserRound },
  { id: 'security', label: 'Security', hint: 'Password & 2FA', icon: Shield },
  { id: 'notifications', label: 'Notifications', hint: 'Email & SMS', icon: Bell },
  { id: 'appearance', label: 'Appearance', hint: 'Theme', icon: Monitor },
]

const ACCESS_LABELS = {
  student: 'Student access',
  teacher: 'Teacher access',
  guardian: 'Guardian access',
}

const buildFormFromUser = (user) => ({
  firstName: user?.firstName || '',
  lastName: user?.lastName || '',
  email: user?.email || '',
  phone: user?.contactInfo?.phone || '',
  role: formatUserRole(user?.role),
  bio: '',
  location: user?.address?.city || '',
  emailAlerts: true,
  smsAlerts: false,
  weeklyDigest: true,
  reportUpdates: true,
})

const shellRadius = { borderRadius: '1.5rem 0.5rem 1.5rem 0.5rem' }
const chipRadius = { borderRadius: '0.85rem 0.25rem 0.85rem 0.25rem' }
const itemRadius = { borderRadius: '1.1rem 0.35rem 1.1rem 0.35rem' }
const softRadius = { borderRadius: '0.95rem 0.3rem 0.95rem 0.3rem' }
const avatarRadius = { borderRadius: '1.35rem 0.4rem 1.35rem 0.4rem' }

const labelClass =
  'mb-1.5 block text-[11px] font-medium tracking-[0.06em] text-gray-500 uppercase dark:text-gray-400'

const controlClass =
  'form-field w-full min-h-[2.75rem] px-3.5 py-2.5 text-[13px] leading-snug text-gray-900 placeholder:text-gray-400 dark:text-gray-100'

const Field = ({ label, htmlFor, hint, children, className = '' }) => (
  <div className={className}>
    <label htmlFor={htmlFor} className={labelClass}>
      {label}
    </label>
    {children}
    {hint ? (
      <p className='mt-1.5 text-[11px] leading-relaxed text-gray-500 dark:text-gray-500'>
        {hint}
      </p>
    ) : null}
  </div>
)

const IconField = ({
  icon: Icon,
  className = '',
  trailing = null,
  children,
}) => (
  <div className={`relative ${className}`}>
    {Icon ? (
      <span className='pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2 text-gray-400 dark:text-gray-500'>
        <Icon className='size-3.5' strokeWidth={1.75} />
      </span>
    ) : null}
    {children}
    {trailing}
  </div>
)

const Toggle = ({ checked, onChange, label, description, id }) => (
  <div
    className='flex items-start justify-between gap-4 px-3.5 py-3.5 transition-colors duration-200 hover:bg-gray-50/80 dark:hover:bg-white/[0.03]'
    style={itemRadius}
  >
    <div className='min-w-0'>
      <p
        id={`${id}-label`}
        className='text-sm font-medium text-gray-900 dark:text-gray-100'
      >
        {label}
      </p>
      <p className='mt-0.5 text-[12px] leading-relaxed text-gray-500 dark:text-gray-400'>
        {description}
      </p>
    </div>
    <button
      id={id}
      type='button'
      role='switch'
      aria-checked={checked}
      aria-labelledby={`${id}-label`}
      onClick={() => onChange(!checked)}
      className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#20509b] ${
        checked
          ? 'bg-[#20509b] dark:bg-[#3d76c6]'
          : 'bg-gray-200 dark:bg-white/15'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  </div>
)

const greetingForHour = (hour) => {
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

const THEME_OPTIONS = [
  {
    id: 'light',
    label: 'Light',
    icon: Sun,
    preview: 'bg-gradient-to-br from-white via-gray-50 to-blue-50/60 ring-gray-200/80',
  },
  {
    id: 'dark',
    label: 'Dark',
    icon: Moon,
    preview: 'bg-gradient-to-br from-[#060d1a] via-[#0c1528] to-[#152238] ring-white/10',
  },
  {
    id: 'system',
    label: 'System',
    icon: Monitor,
    preview:
      'bg-[linear-gradient(135deg,#f8fafc_48%,#0c1528_52%)] ring-gray-300/80 dark:ring-white/15',
  },
]

const Profile = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((state) => state.user.user)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [section, setSection] = useState('profile')
  const [form, setForm] = useState(() => buildFormFromUser(user))
  const [baseline, setBaseline] = useState(() => buildFormFromUser(user))
  const [savedFlash, setSavedFlash] = useState(false)
  const [password, setPassword] = useState({
    current: '',
    next: '',
    confirm: '',
  })
  const [showPassword, setShowPassword] = useState({
    current: false,
    next: false,
    confirm: false,
  })
  const [passwordError, setPasswordError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!user) return
    const next = buildFormFromUser(user)
    setForm(next)
    setBaseline(next)
  }, [user])

  const greeting = useMemo(() => greetingForHour(new Date().getHours()), [])
  const statusLabel = user?.isActive === false ? 'Inactive' : 'Active'
  const initials = getInitials(form.firstName, form.lastName)
  const accessLabel = ACCESS_LABELS[user?.role] || 'Portal access'
  const photoUrl = user?.photo || ''

  const passwordDirty =
    Boolean(password.current) ||
    Boolean(password.next) ||
    Boolean(password.confirm)

  const isDirty =
    JSON.stringify(form) !== JSON.stringify(baseline) || passwordDirty

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async (event) => {
    event.preventDefault()
    setPasswordError('')

    if (passwordDirty) {
      if (!password.current || !password.next || !password.confirm) {
        setSection('security')
        setPasswordError('Enter your current password and confirm the new one.')
        return
      }
      if (password.next.length < 8) {
        setSection('security')
        setPasswordError('New password must be at least 8 characters.')
        return
      }
      if (password.next !== password.confirm) {
        setSection('security')
        setPasswordError('New password and confirmation do not match.')
        return
      }
      if (password.current === password.next) {
        setSection('security')
        setPasswordError('New password must be different from your current password.')
        return
      }

      setIsSaving(true)
      try {
        await changeUserPassword({
          currentPassword: password.current,
          newPassword: password.next,
          confirmPassword: password.confirm,
        })
        clearToken()
        dispatch(clearUser())
        navigate('/login', { replace: true })
        return
      } catch (err) {
        setSection('security')
        setPasswordError(err.message || 'Could not update password. Please try again.')
        return
      } finally {
        setIsSaving(false)
      }
    }

    setBaseline(form)
    setSavedFlash(true)
    window.setTimeout(() => setSavedFlash(false), 2200)
  }

  const handleDiscard = () => {
    setForm(baseline)
    setPassword({ current: '', next: '', confirm: '' })
    setPasswordError('')
  }

  const activeTheme = mounted ? theme : 'system'
  const activeSection = SECTIONS.find((item) => item.id === section)

  return (
    <section className='relative flex flex-1 flex-col overflow-y-auto'>
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 -z-10 overflow-hidden'
      >
        <div className='absolute -top-24 -left-16 size-72 rounded-full bg-[#20509b]/[0.07] blur-3xl dark:bg-[#3d76c6]/[0.12]' />
        <div className='absolute top-40 -right-20 size-80 rounded-full bg-[#08214e]/[0.05] blur-3xl dark:bg-[#08214e]/40' />
      </div>

      <div className='flex w-full flex-col gap-4 px-3 py-3 sm:px-4'>
        {/* Identity header */}
        <header
          className='relative overflow-hidden border border-gray-200/70 bg-white dark:border-white/10 dark:bg-[#0c1528]'
          style={shellRadius}
        >
          <div
            aria-hidden='true'
            className='absolute inset-x-0 top-0 h-[3px] brand-gradient'
          />
          <div
            aria-hidden='true'
            className='pointer-events-none absolute -right-8 -top-10 size-48 rounded-full bg-[#20509b]/[0.08] blur-2xl dark:bg-[#3d76c6]/15'
          />

          <div className='relative flex flex-col gap-5 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-6'>
            <div className='flex min-w-0 items-start gap-4 sm:items-center'>
              <div
                className='relative grid size-[4.75rem] shrink-0 place-items-center overflow-hidden brand-gradient text-[1.35rem] font-semibold tracking-wide text-white shadow-[var(--shadow-soft)] ring-1 ring-blue-100/80 sm:size-[5.25rem] sm:text-[1.5rem] dark:ring-blue-400/20'
                style={avatarRadius}
                aria-hidden='true'
              >
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt=''
                    className='absolute inset-0 size-full object-cover'
                  />
                ) : (
                  initials
                )}
              </div>

              <div className='min-w-0 pt-0.5'>
                <p className='text-[12px] font-medium tracking-[0.04em] text-[#20509b] dark:text-blue-300'>
                  {greeting}, {form.firstName}
                </p>
                <h1 className='mt-0.5 truncate text-[1.4rem] font-semibold tracking-tight text-gray-950 sm:text-[1.55rem] dark:text-white'>
                  {form.firstName} {form.lastName}
                </h1>
                <p className='mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-gray-500 dark:text-gray-400'>
                  <span className='font-medium text-gray-700 dark:text-gray-300'>
                    {form.role}
                  </span>
                  {form.location ? (
                    <>
                      <span className='hidden text-gray-300 sm:inline dark:text-white/20'>
                        ·
                      </span>
                      <span className='inline-flex items-center gap-1'>
                        <MapPin className='size-3 opacity-70' strokeWidth={2} />
                        {form.location}
                      </span>
                    </>
                  ) : null}
                </p>
                <div className='mt-3 flex flex-wrap gap-2'>
                  <span
                    className='inline-flex items-center gap-1.5 bg-[#08214e]/[0.06] px-2.5 py-1 text-[11px] font-medium text-[#08214e] dark:bg-blue-500/10 dark:text-blue-300'
                    style={chipRadius}
                  >
                    <AtSign className='size-3' strokeWidth={2} />
                    {accessLabel}
                  </span>
                  <span
                    className='inline-flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300'
                    style={chipRadius}
                  >
                    <Fingerprint className='size-3' strokeWidth={2} />
                    2FA enabled
                  </span>
                </div>
              </div>
            </div>

            <div
              className={`flex items-center gap-2 self-start px-3 py-2 text-[11px] font-medium sm:self-center ${
                user?.isActive === false
                  ? 'border border-amber-200/70 bg-amber-50/90 text-amber-800 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-300'
                  : 'border border-emerald-200/70 bg-emerald-50/90 text-emerald-800 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300'
              }`}
              style={chipRadius}
            >
              <span className='relative flex size-2'>
                {user?.isActive !== false ? (
                  <span className='absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-50' />
                ) : null}
                <span
                  className={`relative inline-flex size-2 rounded-full ${
                    user?.isActive === false ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                />
              </span>
              {statusLabel}
            </div>
          </div>
        </header>

        <div className='grid grid-cols-1 gap-4 lg:grid-cols-[13.5rem_minmax(0,1fr)] lg:gap-5'>
          {/* Section nav */}
          <nav
            aria-label='Account sections'
            className='flex gap-1.5 overflow-x-auto pb-0.5 lg:flex-col lg:overflow-visible lg:pb-0'
          >
            {SECTIONS.map((item) => {
              const active = section === item.id
              return (
                <button
                  key={item.id}
                  type='button'
                  onClick={() => setSection(item.id)}
                  className={`group relative flex min-w-[10rem] items-center gap-3 px-3 py-3 text-left transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#20509b] lg:min-w-0 ${
                    active
                      ? 'bg-white text-gray-950 shadow-[var(--shadow-soft)] ring-1 ring-gray-200/80 dark:bg-[#152238] dark:text-white dark:ring-white/10'
                      : 'text-gray-600 hover:bg-white/80 dark:text-gray-400 dark:hover:bg-white/[0.04]'
                  }`}
                  style={itemRadius}
                >
                  {active ? (
                    <span
                      aria-hidden='true'
                      className='absolute top-2 bottom-2 left-0 w-[3px] brand-gradient lg:top-2.5 lg:bottom-2.5'
                      style={{ borderRadius: '0 2px 2px 0' }}
                    />
                  ) : null}
                  <span
                    className={`grid size-9 shrink-0 place-items-center transition-colors duration-300 ${
                      active
                        ? 'brand-gradient text-white shadow-[0_8px_18px_rgba(32,80,155,0.28)]'
                        : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200/80 dark:bg-white/8 dark:text-gray-400 dark:group-hover:bg-white/12'
                    }`}
                    style={chipRadius}
                  >
                    <item.icon className='size-4' strokeWidth={1.75} />
                  </span>
                  <span className='min-w-0 flex-1'>
                    <span className='block text-[13px] font-semibold tracking-tight'>
                      {item.label}
                    </span>
                    <span className='mt-0.5 hidden text-[11px] text-gray-500 sm:block dark:text-gray-500'>
                      {item.hint}
                    </span>
                  </span>
                </button>
              )
            })}
          </nav>

          {/* Editor panel */}
          <form
            onSubmit={handleSave}
            className='flex min-h-0 flex-col overflow-hidden border border-gray-200/70 bg-white/95 shadow-[var(--shadow-soft)] backdrop-blur-sm dark:border-white/10 dark:bg-[#0c1528]/95'
            style={shellRadius}
          >
            <div className='flex items-end justify-between gap-4 border-b border-gray-100 px-5 py-4 sm:px-6 dark:border-white/8'>
              <div className='min-w-0'>
                <p className='text-[11px] font-semibold tracking-[0.08em] text-gray-400 uppercase dark:text-gray-500'>
                  Settings
                </p>
                <h2 className='mt-1 text-base font-semibold tracking-tight text-gray-950 dark:text-white'>
                  {activeSection?.label}
                </h2>
                <p className='mt-0.5 text-[13px] text-gray-500 dark:text-gray-400'>
                  {section === 'profile' &&
                    'How others recognize you across the school portal.'}
                  {section === 'security' &&
                    'Password strength and two-factor protection for your account.'}
                  {section === 'notifications' &&
                    'Choose what reaches your inbox and phone.'}
                  {section === 'appearance' &&
                    'Match the console to your workspace lighting.'}
                </p>
              </div>
              <p className='hidden shrink-0 text-[11px] text-gray-400 sm:block dark:text-gray-500'>
                {form.email}
              </p>
            </div>

            <div className='min-h-[22rem] flex-1 space-y-6 px-5 py-5 sm:px-6 sm:py-6'>
              {section === 'profile' && (
                <div
                  key='profile'
                  className='animate-[fadeSlide_0.35s_cubic-bezier(0.16,1,0.3,1)] space-y-5'
                >
                  <div
                    className='border border-gray-100 bg-gray-50/40 p-4 sm:p-5 dark:border-white/8 dark:bg-white/[0.02]'
                    style={itemRadius}
                  >
                    <p className='mb-4 text-[11px] font-semibold tracking-[0.08em] text-gray-400 uppercase dark:text-gray-500'>
                      Identity
                    </p>
                    <div className='grid grid-cols-1 gap-3.5 sm:grid-cols-6'>
                      <Field
                        label='First name'
                        htmlFor='firstName'
                        className='sm:col-span-3'
                      >
                        <IconField icon={UserRound}>
                          <input
                            id='firstName'
                            value={form.firstName}
                            onChange={(e) => update('firstName', e.target.value)}
                            className={`${controlClass} pl-9`}
                            style={softRadius}
                          />
                        </IconField>
                      </Field>
                      <Field
                        label='Last name'
                        htmlFor='lastName'
                        className='sm:col-span-3'
                      >
                        <input
                          id='lastName'
                          value={form.lastName}
                          onChange={(e) => update('lastName', e.target.value)}
                          className={controlClass}
                          style={softRadius}
                        />
                      </Field>
                      <Field
                        label='Role'
                        htmlFor='role'
                        className='sm:col-span-3'
                        hint='Managed by the system'
                      >
                        <IconField icon={Briefcase}>
                          <input
                            id='role'
                            value={form.role}
                            readOnly
                            className={`${controlClass} cursor-default bg-gray-50 pl-9 dark:bg-white/5`}
                            style={softRadius}
                          />
                        </IconField>
                      </Field>
                      <Field
                        label='Location'
                        htmlFor='location'
                        className='sm:col-span-3'
                      >
                        <IconField icon={MapPin}>
                          <input
                            id='location'
                            value={form.location}
                            onChange={(e) => update('location', e.target.value)}
                            className={`${controlClass} pl-9`}
                            style={softRadius}
                          />
                        </IconField>
                      </Field>
                    </div>
                  </div>

                  <div
                    className='border border-gray-100 bg-gray-50/40 p-4 sm:p-5 dark:border-white/8 dark:bg-white/[0.02]'
                    style={itemRadius}
                  >
                    <p className='mb-4 text-[11px] font-semibold tracking-[0.08em] text-gray-400 uppercase dark:text-gray-500'>
                      Contact
                    </p>
                    <div className='grid grid-cols-1 gap-3.5 sm:grid-cols-2'>
                      <Field
                        label='Work email'
                        htmlFor='email'
                        hint='Used for password resets and system alerts'
                      >
                        <IconField icon={Mail}>
                          <input
                            id='email'
                            type='email'
                            value={form.email}
                            onChange={(e) => update('email', e.target.value)}
                            className={`${controlClass} pl-9`}
                            style={softRadius}
                          />
                        </IconField>
                      </Field>
                      <Field label='Phone' htmlFor='phone'>
                        <IconField icon={Phone}>
                          <input
                            id='phone'
                            type='tel'
                            value={form.phone}
                            onChange={(e) => update('phone', e.target.value)}
                            className={`${controlClass} pl-9`}
                            style={softRadius}
                          />
                        </IconField>
                      </Field>
                    </div>
                  </div>

                  <div
                    className='border border-gray-100 bg-gray-50/40 p-4 sm:p-5 dark:border-white/8 dark:bg-white/[0.02]'
                    style={itemRadius}
                  >
                    <div className='mb-4 flex items-end justify-between gap-3'>
                      <p className='text-[11px] font-semibold tracking-[0.08em] text-gray-400 uppercase dark:text-gray-500'>
                        Short bio
                      </p>
                      <p className='text-[11px] tabular-nums text-gray-400 dark:text-gray-500'>
                        {form.bio.length}/240
                      </p>
                    </div>
                    <textarea
                      id='bio'
                      rows={4}
                      maxLength={240}
                      value={form.bio}
                      onChange={(e) => update('bio', e.target.value)}
                      placeholder='A short line about your role at the school…'
                      className={`${controlClass} min-h-[6.5rem] resize-none`}
                      style={softRadius}
                      aria-label='Short bio'
                    />
                    <p className='mt-1.5 text-[11px] leading-relaxed text-gray-500 dark:text-gray-500'>
                      Optional · shown on your school profile
                    </p>
                  </div>
                </div>
              )}

              {section === 'security' && (
                <div
                  key='security'
                  className='animate-[fadeSlide_0.35s_cubic-bezier(0.16,1,0.3,1)] space-y-6'
                >
                  <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                    <div
                      className='border border-gray-100 bg-gradient-to-br from-gray-50/90 via-white to-emerald-50/40 p-4 dark:border-white/8 dark:from-[#152238] dark:via-[#0c1528] dark:to-emerald-950/20'
                      style={itemRadius}
                    >
                      <div className='flex items-center gap-2.5'>
                        <span
                          className='grid size-8 place-items-center bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                          style={chipRadius}
                        >
                          <Shield className='size-3.5' strokeWidth={1.75} />
                        </span>
                        <p className='text-sm font-semibold text-gray-900 dark:text-gray-100'>
                          Two-factor auth
                        </p>
                      </div>
                      <p className='mt-2.5 text-[12px] leading-relaxed text-gray-500 dark:text-gray-400'>
                        Authenticator app connected. Codes required at each new
                        login.
                      </p>
                      <button
                        type='button'
                        className='mt-3 text-[12px] font-semibold text-[#20509b] transition-colors hover:text-[#08214e] dark:text-blue-300 dark:hover:text-blue-200'
                      >
                        Manage 2FA
                      </button>
                    </div>

                    <div
                      className='border border-gray-100 bg-gradient-to-br from-gray-50/90 via-white to-blue-50/40 p-4 dark:border-white/8 dark:from-[#152238] dark:via-[#0c1528] dark:to-blue-950/20'
                      style={itemRadius}
                    >
                      <div className='flex items-center gap-2.5'>
                        <span
                          className='grid size-8 place-items-center bg-blue-50 text-[#20509b] dark:bg-blue-500/15 dark:text-blue-300'
                          style={chipRadius}
                        >
                          <KeyRound className='size-3.5' strokeWidth={1.75} />
                        </span>
                        <p className='text-sm font-semibold text-gray-900 dark:text-gray-100'>
                          Password
                        </p>
                      </div>
                      <p className='mt-2.5 text-[12px] leading-relaxed text-gray-500 dark:text-gray-400'>
                        Last changed 18 Jan 2025. Aim to rotate every 90 days.
                      </p>
                    </div>
                  </div>

                  <div
                    className='border border-gray-100 bg-gray-50/40 p-4 sm:p-5 dark:border-white/8 dark:bg-white/[0.02]'
                    style={itemRadius}
                  >
                    <p className='mb-4 text-[11px] font-semibold tracking-[0.08em] text-gray-400 uppercase dark:text-gray-500'>
                      Change password
                    </p>
                    {passwordError ? (
                      <div
                        role='alert'
                        className='mb-3.5 border border-red-200/80 bg-red-50 px-3.5 py-2.5 text-[12px] leading-relaxed text-red-700 dark:border-red-500/25 dark:bg-red-950/40 dark:text-red-300'
                        style={softRadius}
                      >
                        {passwordError}
                      </div>
                    ) : null}
                    <div className='grid grid-cols-1 gap-3.5 sm:grid-cols-3'>
                      {(
                        [
                          {
                            key: 'current',
                            id: 'currentPassword',
                            label: 'Current password',
                            autoComplete: 'current-password',
                          },
                          {
                            key: 'next',
                            id: 'newPassword',
                            label: 'New password',
                            autoComplete: 'new-password',
                          },
                          {
                            key: 'confirm',
                            id: 'confirmPassword',
                            label: 'Confirm new',
                            autoComplete: 'new-password',
                          },
                        ]
                      ).map((field) => (
                        <Field
                          key={field.key}
                          label={field.label}
                          htmlFor={field.id}
                          hint={
                            field.key === 'next'
                              ? 'At least 8 characters'
                              : undefined
                          }
                        >
                          <IconField
                            icon={Lock}
                            trailing={
                              <button
                                type='button'
                                aria-label={
                                  showPassword[field.key]
                                    ? 'Hide password'
                                    : 'Show password'
                                }
                                onClick={() =>
                                  setShowPassword((prev) => ({
                                    ...prev,
                                    [field.key]: !prev[field.key],
                                  }))
                                }
                                className='absolute top-1/2 right-2.5 z-10 -translate-y-1/2 rounded-md p-1 text-gray-400 transition-colors hover:text-[#20509b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#20509b] dark:hover:text-blue-300'
                              >
                                {showPassword[field.key] ? (
                                  <EyeOff className='size-3.5' strokeWidth={1.75} />
                                ) : (
                                  <Eye className='size-3.5' strokeWidth={1.75} />
                                )}
                              </button>
                            }
                          >
                            <input
                              id={field.id}
                              type={
                                showPassword[field.key] ? 'text' : 'password'
                              }
                              autoComplete={field.autoComplete}
                              value={password[field.key]}
                              onChange={(e) => {
                                setPassword((p) => ({
                                  ...p,
                                  [field.key]: e.target.value,
                                }))
                                if (passwordError) setPasswordError('')
                              }}
                              placeholder='••••••••'
                              className={`${controlClass} pr-10 pl-9`}
                              style={softRadius}
                            />
                          </IconField>
                        </Field>
                      ))}
                    </div>
                  </div>

                  <div
                    className='border border-rose-200/70 bg-gradient-to-r from-rose-50/80 via-white to-rose-50/40 p-4 dark:border-rose-500/20 dark:from-rose-950/30 dark:via-[#0c1528] dark:to-rose-950/15'
                    style={itemRadius}
                  >
                    <div className='flex items-start gap-3'>
                      <span
                        className='mt-0.5 grid size-8 shrink-0 place-items-center bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
                        style={chipRadius}
                      >
                        <LogOut className='size-3.5' strokeWidth={1.75} />
                      </span>
                      <div className='min-w-0 flex-1'>
                        <p className='text-sm font-semibold text-rose-950 dark:text-rose-100'>
                          Sign out other devices
                        </p>
                        <p className='mt-0.5 text-[12px] text-rose-700/80 dark:text-rose-300/80'>
                          Ends 1 other active session on a laptop in Kampala.
                        </p>
                      </div>
                      <button
                        type='button'
                        className='shrink-0 border border-rose-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-rose-700 transition-colors hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 dark:border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950/70'
                        style={chipRadius}
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {section === 'notifications' && (
                <div
                  key='notifications'
                  className='animate-[fadeSlide_0.35s_cubic-bezier(0.16,1,0.3,1)]'
                >
                  <div className='-mx-1 space-y-0.5 divide-y divide-gray-100 dark:divide-white/8'>
                    <Toggle
                      id='emailAlerts'
                      label='Email alerts'
                      description='Reports, fee updates, and announcement publishes'
                      checked={form.emailAlerts}
                      onChange={(v) => update('emailAlerts', v)}
                    />
                    <Toggle
                      id='smsAlerts'
                      label='SMS for urgent items'
                      description='Critical school notices only — evenings muted'
                      checked={form.smsAlerts}
                      onChange={(v) => update('smsAlerts', v)}
                    />
                    <Toggle
                      id='weeklyDigest'
                      label='Weekly digest'
                      description='Sunday summary of activity across the school'
                      checked={form.weeklyDigest}
                      onChange={(v) => update('weeklyDigest', v)}
                    />
                    <Toggle
                      id='reportUpdates'
                      label='Report case updates'
                      description='When a filed report changes status or assignee'
                      checked={form.reportUpdates}
                      onChange={(v) => update('reportUpdates', v)}
                    />
                  </div>
                </div>
              )}

              {section === 'appearance' && (
                <div
                  key='appearance'
                  className='animate-[fadeSlide_0.35s_cubic-bezier(0.16,1,0.3,1)]'
                >
                  <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
                    {THEME_OPTIONS.map((option) => {
                      const selected = activeTheme === option.id
                      return (
                        <button
                          key={option.id}
                          type='button'
                          onClick={() => setTheme(option.id)}
                          className={`group p-3 text-left transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#20509b] ${
                            selected
                              ? 'border border-[#20509b]/45 bg-blue-50/50 shadow-[0_10px_24px_rgba(32,80,155,0.12)] dark:border-blue-400/40 dark:bg-blue-500/10'
                              : 'border border-gray-200/80 hover:border-[#20509b]/30 hover:bg-gray-50/80 dark:border-white/10 dark:hover:border-blue-400/25 dark:hover:bg-white/[0.03]'
                          }`}
                          style={itemRadius}
                        >
                          <div
                            className={`mb-3 h-[4.25rem] ring-1 ${option.preview}`}
                            style={chipRadius}
                          />
                          <div className='flex items-center justify-between gap-2'>
                            <span className='flex items-center gap-2'>
                              <option.icon
                                className={`size-4 transition-colors ${
                                  selected
                                    ? 'text-[#20509b] dark:text-blue-300'
                                    : 'text-gray-400'
                                }`}
                                strokeWidth={1.75}
                              />
                              <span className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                                {option.label}
                              </span>
                            </span>
                            {selected ? (
                              <span
                                className='grid size-5 place-items-center brand-gradient text-white'
                                style={{ borderRadius: '0.45rem 0.15rem 0.45rem 0.15rem' }}
                              >
                                <Check className='size-3' strokeWidth={2.5} />
                              </span>
                            ) : null}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky footer actions */}
            <div className='flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:border-white/8 dark:bg-[#080f1c]/60'>
              <p className='flex min-h-5 items-center gap-1.5 text-[12px] text-gray-500 dark:text-gray-400'>
                {savedFlash ? (
                  <>
                    <span
                      className='grid size-5 place-items-center bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                      style={{ borderRadius: '0.45rem 0.15rem 0.45rem 0.15rem' }}
                    >
                      <Check className='size-3' strokeWidth={2.5} />
                    </span>
                    <span className='font-medium text-emerald-700 dark:text-emerald-300'>
                      Changes saved
                    </span>
                  </>
                ) : isDirty ? (
                  <span className='inline-flex items-center gap-2'>
                    <span className='size-1.5 rounded-full bg-amber-500' />
                    You have unsaved changes
                  </span>
                ) : (
                  'All changes saved'
                )}
              </p>
              <div className='flex gap-2'>
                <button
                  type='button'
                  onClick={handleDiscard}
                  disabled={!isDirty || isSaving}
                  className='border border-gray-200 bg-white px-4 py-2.5 text-[13px] font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#20509b] dark:border-white/12 dark:bg-[#152238] dark:text-gray-200 dark:hover:bg-[#1a2c48]'
                  style={chipRadius}
                >
                  Discard
                </button>
                <button
                  type='submit'
                  disabled={!isDirty || isSaving}
                  className='inline-flex items-center justify-center gap-2 brand-gradient px-4 py-2.5 text-[13px] font-medium text-white shadow-[0_10px_24px_rgba(32,80,155,0.28)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:brightness-110 hover:shadow-[0_12px_28px_rgba(32,80,155,0.36)] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#20509b]'
                  style={chipRadius}
                >
                  {isSaving ? (
                    <>
                      <LoaderCircle className='size-3.5 animate-spin' strokeWidth={2} />
                      Saving…
                    </>
                  ) : (
                    'Save changes'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlide {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  )
}

export default Profile

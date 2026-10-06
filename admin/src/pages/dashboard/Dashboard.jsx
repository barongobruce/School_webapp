import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  FileWarning,
  GraduationCap,
  Megaphone,
  RefreshCw,
  School,
  Users,
} from 'lucide-react'
import Button from '../../components/Button'
import { getAdminDashboard } from '../../lib/dashboard.requests'

const cardRadius = { borderRadius: '1.5rem 0.5rem 1.5rem 0.5rem' }
const softRadius = { borderRadius: '0.95rem 0.3rem 0.95rem 0.3rem' }
const chipRadius = { borderRadius: '0.85rem 0.25rem 0.85rem 0.25rem' }
const avatarRadius = { borderRadius: '0.95rem 0.3rem 0.95rem 0.3rem' }

const surface =
  'border border-gray-200/70 bg-white dark:border-white/10 dark:bg-[#0c1528]'

const POPULATION_COLORS = {
  student: '#20509b',
  teacher: '#3d76c6',
  guardian: '#7aa7e0',
}

const STATUS_LABEL = {
  pending: 'Open',
  in_progress: 'Under Review',
  resolved: 'Resolved',
}

const STATUS_CLASS = {
  pending:
    'bg-blue-50 text-blue-700 ring-1 ring-blue-200/80 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/25',
  in_progress:
    'bg-amber-50 text-amber-700 ring-1 ring-amber-200/80 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/25',
  resolved:
    'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/25',
}

const SEVERITY_CLASS = {
  low: 'bg-gray-50 text-gray-600 ring-1 ring-gray-200/80 dark:bg-white/5 dark:text-gray-300 dark:ring-white/10',
  medium:
    'bg-sky-50 text-sky-700 ring-1 ring-sky-200/80 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/25',
  high: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200/80 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/25',
}

const greetingForNow = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

const formatDate = (value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const formatShortDate = (value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  })
}

const initialsFromName = (name = '') => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return 'A'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null

  return (
    <div
      className='border border-gray-200/80 bg-white px-3 py-2 shadow-[var(--shadow-lift)] dark:border-white/10 dark:bg-[#152238]'
      style={softRadius}
    >
      {label ? (
        <p className='mb-1 text-[11px] font-medium text-gray-500 dark:text-gray-400'>
          {label}
        </p>
      ) : null}
      {payload.map((entry) => (
        <p
          key={entry.dataKey || entry.name}
          className='text-[12px] font-medium text-gray-900 dark:text-white'
        >
          <span className='text-gray-500 dark:text-gray-400'>
            {entry.name}:{' '}
          </span>
          <span className='tabular-nums'>{entry.value}</span>
        </p>
      ))}
    </div>
  )
}

const StatCard = ({ label, value, hint, to, icon: Icon, tone = 'blue' }) => {
  const tones = {
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
    amber:
      'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    rose: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
    emerald:
      'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  }

  return (
    <Link
      to={to}
      className={`${surface} group flex items-start gap-3 p-4 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-lift)]`}
      style={softRadius}
    >
      <span
        className={`grid size-10 shrink-0 place-items-center ${tones[tone]}`}
        style={chipRadius}
      >
        <Icon className='size-4' strokeWidth={1.75} />
      </span>
      <span className='min-w-0 flex-1'>
        <span className='block text-[11px] font-medium tracking-[0.06em] text-gray-400 uppercase dark:text-gray-500'>
          {label}
        </span>
        <span className='mt-1 block text-[22px] font-semibold tracking-tight text-gray-900 tabular-nums dark:text-white'>
          {value}
        </span>
        {hint ? (
          <span className='mt-0.5 block text-[11px] text-gray-500 dark:text-gray-400'>
            {hint}
          </span>
        ) : null}
      </span>
      <ArrowRight
        className='mt-1 size-3.5 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-600 dark:text-gray-600 dark:group-hover:text-blue-400'
        strokeWidth={1.75}
      />
    </Link>
  )
}

const SectionCard = ({
  title,
  actionLabel,
  actionTo,
  children,
  empty,
  className = '',
}) => (
  <section
    className={`${surface} p-4 shadow-[var(--shadow-soft)] sm:p-5 ${className}`}
    style={cardRadius}
  >
    <div className='mb-4 flex items-center justify-between gap-3'>
      <h2 className='text-[13px] font-semibold tracking-tight text-gray-900 dark:text-white'>
        {title}
      </h2>
      {actionTo ? (
        <Link
          to={actionTo}
          className='inline-flex items-center gap-1 text-[12px] font-medium text-blue-700 transition-colors hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200'
        >
          {actionLabel}
          <ArrowRight className='size-3' strokeWidth={2} />
        </Link>
      ) : null}
    </div>
    {empty ? (
      <p className='py-8 text-center text-[13px] text-gray-500 dark:text-gray-400'>
        {empty}
      </p>
    ) : (
      children
    )}
  </section>
)

const PersonRow = ({ person, meta, to }) => (
  <Link
    to={to}
    className='flex items-center gap-3 px-2.5 py-2.5 transition-colors hover:bg-gray-50/80 dark:hover:bg-white/[0.03]'
    style={softRadius}
  >
    {person.photo ? (
      <img
        src={person.photo}
        alt=''
        className='size-9 shrink-0 object-cover'
        style={avatarRadius}
      />
    ) : (
      <span
        className='grid size-9 shrink-0 place-items-center bg-blue-50 text-[11px] font-semibold text-blue-700 dark:bg-blue-500/15 dark:text-blue-300'
        style={avatarRadius}
      >
        {initialsFromName(person.name)}
      </span>
    )}
    <span className='min-w-0 flex-1'>
      <span className='block truncate text-[13px] font-medium text-gray-900 dark:text-white'>
        {person.name}
      </span>
      <span className='block truncate text-[11px] text-gray-500 dark:text-gray-400'>
        {meta}
      </span>
    </span>
    <ArrowRight
      className='size-3.5 shrink-0 text-gray-300 dark:text-gray-600'
      strokeWidth={1.75}
    />
  </Link>
)

const DashboardSkeleton = () => (
  <section
    className='flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-3 py-3 sm:px-4'
    aria-busy='true'
    aria-label='Loading dashboard'
  >
    <div
      className='h-40 animate-pulse bg-gray-200 dark:bg-white/10'
      style={cardRadius}
    />
    <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className='h-24 animate-pulse bg-gray-200 dark:bg-white/10'
          style={softRadius}
        />
      ))}
    </div>
    <div className='grid gap-4 xl:grid-cols-3'>
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className='h-72 animate-pulse bg-gray-200 dark:bg-white/10'
          style={cardRadius}
        />
      ))}
    </div>
  </section>
)

const Dashboard = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const payload = await getAdminDashboard()
        if (!cancelled) setData(payload)
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load dashboard')
          setData(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  const stats = data?.stats || {}
  const firstName = data?.admin?.firstName || 'Admin'

  const populationChart = useMemo(
    () =>
      (data?.population || [])
        .map((item) => ({
          ...item,
          value: item.count || 0,
          color: POPULATION_COLORS[item.role] || '#93a0b4',
        }))
        .filter((item) => item.value > 0),
    [data?.population],
  )

  const populationTotal = useMemo(
    () => populationChart.reduce((sum, item) => sum + item.value, 0),
    [populationChart],
  )

  const enrollmentChart = useMemo(
    () => data?.enrollmentTrend || [],
    [data?.enrollmentTrend],
  )

  const hasEnrollment = enrollmentChart.some((item) => (item.count || 0) > 0)

  const classChart = useMemo(
    () =>
      (data?.classSizes || []).map((item) => ({
        ...item,
        label:
          item.name?.length > 14 ? `${item.name.slice(0, 13)}…` : item.name,
      })),
    [data?.classSizes],
  )

  const complaintStatusChart = useMemo(
    () =>
      (data?.complaintsByStatus || []).map((item) => ({
        ...item,
        name: item.label,
        value: item.count || 0,
        color:
          item.status === 'pending'
            ? '#20509b'
            : item.status === 'in_progress'
              ? '#f4ae17'
              : '#10b981',
      })),
    [data?.complaintsByStatus],
  )

  const severityChart = useMemo(
    () =>
      (data?.complaintsBySeverity || []).filter((item) => (item.count || 0) > 0),
    [data?.complaintsBySeverity],
  )

  if (loading) return <DashboardSkeleton />

  if (error) {
    return (
      <section className='flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-4 py-10'>
        <div
          className={`${surface} max-w-md px-6 py-8 text-center shadow-[var(--shadow-soft)]`}
          style={cardRadius}
        >
          <p className='text-[15px] font-semibold text-gray-900 dark:text-white'>
            Couldn’t load overview
          </p>
          <p className='mt-2 text-[13px] text-gray-500 dark:text-gray-400'>
            {error}
          </p>
          <Button
            className='mt-5'
            size='sm'
            onClick={() => setReloadKey((key) => key + 1)}
          >
            <RefreshCw className='size-3.5' strokeWidth={1.75} />
            Try again
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section className='flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-3 py-3 sm:px-4'>
      <div
        className='brand-gradient relative overflow-hidden px-5 py-6 text-white shadow-[var(--shadow-brand)] sm:px-6'
        style={cardRadius}
      >
        <div
          aria-hidden='true'
          className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_45%)]'
        />
        <div
          aria-hidden='true'
          className='pointer-events-none absolute -right-8 -bottom-10 size-44 rounded-full bg-white/10 blur-2xl'
        />
        <div className='relative z-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div className='min-w-0'>
            <p className='text-[11px] font-medium tracking-[0.08em] text-white/70 uppercase'>
              {greetingForNow()}
            </p>
            <h1 className='mt-1 text-[26px] font-semibold tracking-tight sm:text-[30px]'>
              {firstName}
            </h1>
            <p className='mt-1.5 max-w-xl text-[13px] text-white/85'>
              School operations at a glance — people, classes, complaints, and
              what needs attention this week.
            </p>
            <div className='mt-4 flex flex-wrap gap-2'>
              <span
                className='inline-flex items-center gap-1.5 bg-white/15 px-3 py-1.5 text-[11px] font-medium text-white ring-1 ring-white/20'
                style={chipRadius}
              >
                <GraduationCap className='size-3.5' strokeWidth={1.75} />
                {stats.students ?? 0} students
              </span>
              <span
                className='inline-flex items-center gap-1.5 bg-white/15 px-3 py-1.5 text-[11px] font-medium text-white ring-1 ring-white/20'
                style={chipRadius}
              >
                <School className='size-3.5' strokeWidth={1.75} />
                {stats.classes ?? 0}{' '}
                {(stats.classes ?? 0) === 1 ? 'class' : 'classes'}
              </span>
              {(stats.openComplaints ?? 0) > 0 ? (
                <span
                  className='inline-flex items-center gap-1.5 bg-yellow-400/95 px-3 py-1.5 text-[11px] font-semibold text-[#1a1a1a]'
                  style={chipRadius}
                >
                  {stats.openComplaints} open complaints
                </span>
              ) : (
                <span
                  className='inline-flex items-center gap-1.5 bg-white/15 px-3 py-1.5 text-[11px] font-medium text-white ring-1 ring-white/20'
                  style={chipRadius}
                >
                  No open complaints
                </span>
              )}
            </div>
          </div>
          <div className='flex flex-wrap gap-2'>
            <Button
              to='/students'
              size='sm'
              variant='secondary'
              className='bg-white'
            >
              Add student
            </Button>
            <Button
              to='/complaints'
              size='sm'
              variant='outline'
              className='border-white/30 text-white hover:bg-white/10'
            >
              Review cases
            </Button>
          </div>
        </div>
      </div>

      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        <StatCard
          label='Students'
          value={stats.students ?? 0}
          hint={`${stats.activeUsers ?? 0} active accounts`}
          to='/students'
          icon={GraduationCap}
        />
        <StatCard
          label='Teachers'
          value={stats.teachers ?? 0}
          hint={`${stats.guardians ?? 0} guardians`}
          to='/teachers'
          icon={Users}
        />
        <StatCard
          label='Classes'
          value={stats.classes ?? 0}
          hint={`${stats.activeCourses ?? 0} active courses`}
          to='/classes'
          icon={School}
          tone='emerald'
        />
        <StatCard
          label='Open complaints'
          value={stats.openComplaints ?? 0}
          hint={`${stats.complaints ?? 0} total filed`}
          to='/complaints'
          icon={FileWarning}
          tone='rose'
        />
      </div>

      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        <StatCard
          label='Courses'
          value={stats.courses ?? 0}
          hint='Catalog size'
          to='/courses'
          icon={BookOpen}
        />
        <StatCard
          label='Lessons this week'
          value={stats.lessonsThisWeek ?? 0}
          hint='Next 7 days'
          to='/classes'
          icon={CalendarCheck}
          tone='amber'
        />
        <StatCard
          label='Homework due'
          value={stats.homeworksDueSoon ?? 0}
          hint='Due within a week'
          to='/classes'
          icon={ClipboardList}
          tone='amber'
        />
        <StatCard
          label='Announcements'
          value={stats.announcements ?? 0}
          hint='Published notices'
          to='/announcements'
          icon={Megaphone}
        />
      </div>

      <div className='grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)_minmax(0,1fr)]'>
        <SectionCard
          title='Community mix'
          empty={
            populationChart.length === 0
              ? 'Add students, teachers, or guardians to see the mix.'
              : null
          }
        >
          <div className='relative mx-auto h-[210px] w-full max-w-[220px]'>
            <ResponsiveContainer width='100%' height='100%'>
              <PieChart>
                <Pie
                  data={populationChart}
                  dataKey='value'
                  nameKey='name'
                  innerRadius={58}
                  outerRadius={78}
                  paddingAngle={populationChart.length > 1 ? 3 : 0}
                  stroke='none'
                  cornerRadius={5}
                >
                  {populationChart.map((entry) => (
                    <Cell key={entry.role} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className='pointer-events-none absolute inset-0 grid place-items-center'>
              <div className='text-center'>
                <p className='text-[10px] font-medium tracking-[0.08em] text-gray-400 uppercase dark:text-gray-500'>
                  People
                </p>
                <p className='text-[28px] font-semibold tracking-tight text-gray-900 tabular-nums dark:text-white'>
                  {populationTotal}
                </p>
              </div>
            </div>
          </div>
          <div className='mt-2 grid gap-2'>
            {(data?.population || []).map((item) => (
              <div
                key={item.role}
                className='flex items-center justify-between gap-2 px-2.5 py-2 text-[12px]'
                style={chipRadius}
              >
                <span className='inline-flex items-center gap-2 text-gray-600 dark:text-gray-300'>
                  <span
                    className='size-2.5 shrink-0'
                    style={{
                      ...chipRadius,
                      backgroundColor:
                        POPULATION_COLORS[item.role] || '#93a0b4',
                    }}
                  />
                  {item.name}
                </span>
                <span className='font-semibold text-gray-900 tabular-nums dark:text-white'>
                  {item.count || 0}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title='Enrollment trend'
          empty={
            !hasEnrollment
              ? 'New student enrollments will appear here over the next months.'
              : null
          }
        >
          <div className='h-[250px] w-full'>
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart
                data={enrollmentChart}
                margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
              >
                <defs>
                  <linearGradient id='enrollFill' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='0%' stopColor='#20509b' stopOpacity={0.35} />
                    <stop offset='100%' stopColor='#20509b' stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray='3 3'
                  vertical={false}
                  stroke='rgba(148,163,184,0.25)'
                />
                <XAxis
                  dataKey='label'
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#93a0b4', fontSize: 11 }}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type='monotone'
                  dataKey='count'
                  name='Students'
                  stroke='#20509b'
                  strokeWidth={2.25}
                  fill='url(#enrollFill)'
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard
          title='Class sizes'
          actionLabel='All classes'
          actionTo='/classes'
          empty={
            classChart.length === 0
              ? 'Create classes to compare enrollment by section.'
              : null
          }
        >
          <div className='h-[250px] w-full'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart
                data={classChart}
                layout='vertical'
                margin={{ top: 4, right: 12, left: 4, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray='3 3'
                  horizontal={false}
                  stroke='rgba(148,163,184,0.25)'
                />
                <XAxis
                  type='number'
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#93a0b4', fontSize: 11 }}
                />
                <YAxis
                  type='category'
                  dataKey='label'
                  width={88}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(32,80,155,0.06)' }} />
                <Bar
                  dataKey='students'
                  name='Students'
                  fill='#3d76c6'
                  radius={[0, 6, 6, 0]}
                  barSize={14}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className='grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]'>
        <SectionCard
          title='Complaint pipeline'
          actionLabel='View all'
          actionTo='/complaints'
          empty={
            (stats.complaints ?? 0) === 0
              ? 'No complaints filed yet.'
              : null
          }
        >
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='h-[200px] w-full'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart
                  data={complaintStatusChart}
                  margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray='3 3'
                    vertical={false}
                    stroke='rgba(148,163,184,0.25)'
                  />
                  <XAxis
                    dataKey='name'
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#64748b', fontSize: 10 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#93a0b4', fontSize: 11 }}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(32,80,155,0.06)' }} />
                  <Bar dataKey='value' name='Cases' radius={[6, 6, 0, 0]} barSize={28}>
                    {complaintStatusChart.map((entry) => (
                      <Cell key={entry.status} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className='flex flex-col justify-center gap-3'>
              <p className='text-[11px] font-medium tracking-[0.06em] text-gray-400 uppercase dark:text-gray-500'>
                By severity
              </p>
              {severityChart.length === 0 ? (
                <p className='text-[13px] text-gray-500 dark:text-gray-400'>
                  No severity data yet.
                </p>
              ) : (
                severityChart.map((item) => {
                  const total = severityChart.reduce(
                    (sum, row) => sum + (row.count || 0),
                    0,
                  )
                  const pct = total
                    ? Math.round(((item.count || 0) / total) * 100)
                    : 0
                  return (
                    <div key={item.severity}>
                      <div className='mb-1 flex items-center justify-between text-[12px]'>
                        <span className='font-medium text-gray-700 dark:text-gray-200'>
                          {item.label}
                        </span>
                        <span className='tabular-nums text-gray-500 dark:text-gray-400'>
                          {item.count} · {pct}%
                        </span>
                      </div>
                      <div
                        className='h-2 overflow-hidden bg-gray-100 dark:bg-white/8'
                        style={chipRadius}
                      >
                        <div
                          className='h-full transition-[width] duration-500'
                          style={{
                            width: `${pct}%`,
                            backgroundColor: item.color,
                            ...chipRadius,
                          }}
                        />
                      </div>
                    </div>
                  )
                })
              )}
              <div className='mt-1 grid grid-cols-3 gap-2'>
                {complaintStatusChart.map((item) => (
                  <div
                    key={item.status}
                    className='px-2.5 py-2 text-center'
                    style={{
                      ...chipRadius,
                      backgroundColor: `${item.color}14`,
                    }}
                  >
                    <p className='text-[18px] font-semibold tabular-nums text-gray-900 dark:text-white'>
                      {item.value}
                    </p>
                    <p className='text-[10px] font-medium text-gray-500 dark:text-gray-400'>
                      {item.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title='This week'
          empty={null}
        >
          <div className='grid gap-2'>
            {[
              {
                label: 'Attendance marks',
                value: stats.attendanceWeek ?? 0,
                hint: 'Last 7 days',
                icon: CalendarCheck,
              },
              {
                label: 'Lessons scheduled',
                value: stats.lessonsThisWeek ?? 0,
                hint: 'Upcoming week',
                icon: BookOpen,
              },
              {
                label: 'Homework due soon',
                value: stats.homeworksDueSoon ?? 0,
                hint: 'Next 7 days',
                icon: ClipboardList,
              },
              {
                label: 'Inactive accounts',
                value: stats.inactiveUsers ?? 0,
                hint: 'Needs follow-up',
                icon: Users,
              },
            ].map((item) => (
              <div
                key={item.label}
                className='flex items-center gap-3 bg-gray-50/80 px-3 py-3 dark:bg-white/[0.03]'
                style={softRadius}
              >
                <span
                  className='grid size-9 place-items-center bg-white text-blue-700 shadow-[var(--shadow-soft)] dark:bg-[#152238] dark:text-blue-300'
                  style={chipRadius}
                >
                  <item.icon className='size-3.5' strokeWidth={1.75} />
                </span>
                <span className='min-w-0 flex-1'>
                  <span className='block text-[13px] font-medium text-gray-900 dark:text-white'>
                    {item.label}
                  </span>
                  <span className='block text-[11px] text-gray-500 dark:text-gray-400'>
                    {item.hint}
                  </span>
                </span>
                <span className='text-[20px] font-semibold tabular-nums text-gray-900 dark:text-white'>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className='grid gap-4 xl:grid-cols-3'>
        <SectionCard
          title='Recent complaints'
          actionLabel='All'
          actionTo='/complaints'
          empty={
            !(data?.recentComplaints || []).length
              ? 'No recent complaints.'
              : null
          }
        >
          <ul className='space-y-1'>
            {(data?.recentComplaints || []).map((complaint) => (
              <li key={complaint.id}>
                <Link
                  to={`/complaints/${complaint.id}`}
                  className='block px-2.5 py-2.5 transition-colors hover:bg-gray-50/80 dark:hover:bg-white/[0.03]'
                  style={softRadius}
                >
                  <div className='flex items-start justify-between gap-2'>
                    <p className='min-w-0 truncate text-[13px] font-medium text-gray-900 dark:text-white'>
                      {complaint.title}
                    </p>
                    <span
                      className={`shrink-0 px-2 py-0.5 text-[10px] font-medium ${STATUS_CLASS[complaint.status] || STATUS_CLASS.pending}`}
                      style={chipRadius}
                    >
                      {STATUS_LABEL[complaint.status] || 'Open'}
                    </span>
                  </div>
                  <div className='mt-1.5 flex flex-wrap items-center gap-1.5'>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-medium ${SEVERITY_CLASS[complaint.severity] || SEVERITY_CLASS.low}`}
                      style={chipRadius}
                    >
                      {(complaint.severity || 'low').replace(/^\w/, (c) =>
                        c.toUpperCase(),
                      )}
                    </span>
                    <span className='text-[11px] text-gray-400 dark:text-gray-500'>
                      {formatShortDate(complaint.dateFiled)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard
          title='Newest students'
          actionLabel='All'
          actionTo='/students'
          empty={
            !(data?.recentStudents || []).length
              ? 'No students enrolled yet.'
              : null
          }
        >
          <ul className='space-y-0.5'>
            {(data?.recentStudents || []).map((student) => (
              <li key={student.id}>
                <PersonRow
                  person={student}
                  to={`/students/${student.id}`}
                  meta={
                    [
                      student.className || 'Unassigned',
                      formatShortDate(student.createdAt),
                    ]
                      .filter(Boolean)
                      .join(' · ')
                  }
                />
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard
          title='Latest announcements'
          actionLabel='All'
          actionTo='/announcements'
          empty={
            !(data?.recentAnnouncements || []).length
              ? 'No announcements published yet.'
              : null
          }
        >
          <ul className='space-y-1'>
            {(data?.recentAnnouncements || []).map((item) => (
              <li key={item.id}>
                <Link
                  to={`/announcements/${item.id}`}
                  className='flex items-start gap-3 px-2.5 py-2.5 transition-colors hover:bg-gray-50/80 dark:hover:bg-white/[0.03]'
                  style={softRadius}
                >
                  <span
                    className='mt-0.5 grid size-8 shrink-0 place-items-center bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300'
                    style={chipRadius}
                  >
                    <Megaphone className='size-3.5' strokeWidth={1.75} />
                  </span>
                  <span className='min-w-0 flex-1'>
                    <span className='block truncate text-[13px] font-medium text-gray-900 dark:text-white'>
                      {item.title}
                    </span>
                    <span className='mt-0.5 block text-[11px] text-gray-500 capitalize dark:text-gray-400'>
                      {item.category || 'general'} · {formatDate(item.createdAt)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      {(data?.recentTeachers || []).length > 0 ? (
        <SectionCard
          title='Newest teachers'
          actionLabel='All faculty'
          actionTo='/teachers'
        >
          <div className='grid gap-1 sm:grid-cols-2 xl:grid-cols-5'>
            {(data.recentTeachers || []).map((teacher) => (
              <PersonRow
                key={teacher.id}
                person={teacher}
                to={`/teachers/${teacher.id}`}
                meta={`${teacher.classCount || 0} ${(teacher.classCount || 0) === 1 ? 'class' : 'classes'} · ${formatShortDate(teacher.createdAt)}`}
              />
            ))}
          </div>
        </SectionCard>
      ) : null}
    </section>
  )
}

export default Dashboard

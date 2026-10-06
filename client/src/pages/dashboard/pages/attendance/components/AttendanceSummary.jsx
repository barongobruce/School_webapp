import React, { useMemo, useState } from 'react'
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
  Tooltip,
} from 'recharts'
import { CheckCircle2, Clock3, ShieldCheck, UserX } from 'lucide-react'
import {
  STATUS_META,
  cardRadius,
  chipRadius,
  softRadius,
  surface,
} from '../attendanceUtils'

const STATUS_ICONS = {
  present: CheckCircle2,
  absent: UserX,
  late: Clock3,
  excused: ShieldCheck,
}

const ChartTooltip = ({ active, payload, total }) => {
  if (!active || !payload?.length) return null

  const item = payload[0]?.payload
  if (!item) return null

  const pct = total ? Math.round((item.value / total) * 100) : 0

  return (
    <div
      className='border border-gray-200/80 bg-white/95 px-3 py-2 shadow-[var(--shadow-lift)] backdrop-blur-md dark:border-white/10 dark:bg-[#152238]/95'
      style={chipRadius}
    >
      <div className='flex items-center gap-2'>
        <span
          className='size-2.5 shrink-0 rounded-full'
          style={{ backgroundColor: item.color }}
        />
        <p className='text-[12px] font-semibold text-gray-900 dark:text-white'>
          {item.name}
        </p>
      </div>
      <p className='mt-1 text-[11px] text-gray-500 dark:text-gray-400'>
        <span className='font-semibold text-gray-800 dark:text-gray-200'>
          {item.value}
        </span>{' '}
        record{item.value === 1 ? '' : 's'} · {pct}%
      </p>
    </div>
  )
}

const SectorShape = ({ activeIndex, ...props }) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    index,
    isActive,
  } = props

  const highlighted = Boolean(isActive || (activeIndex != null && index === activeIndex))

  if (!highlighted) {
    return (
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke='transparent'
        style={{ transition: 'all 200ms var(--ease-spring)' }}
      />
    )
  }

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={Math.max(innerRadius - 2, 0)}
        outerRadius={outerRadius + 5}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke='transparent'
      />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={outerRadius + 8}
        outerRadius={outerRadius + 11}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.28}
        stroke='transparent'
      />
    </g>
  )
}

const StatusRow = ({ status, count, total, active, onHover, onLeave }) => {
  const meta = STATUS_META[status]
  const Icon = STATUS_ICONS[status]
  const pct = total ? Math.round((count / total) * 100) : 0

  return (
    <button
      type='button'
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onFocus={onHover}
      onBlur={onLeave}
      className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${
        active
          ? 'bg-blue-50/80 dark:bg-blue-500/10'
          : 'hover:bg-gray-50 dark:hover:bg-white/5'
      }`}
      style={chipRadius}
    >
      <span
        className={`grid size-8 shrink-0 place-items-center ${meta.className}`}
        style={chipRadius}
      >
        <Icon className='size-3.5' strokeWidth={1.75} />
      </span>

      <span className='min-w-0 flex-1'>
        <span className='flex items-center justify-between gap-2'>
          <span className='text-[13px] font-medium text-gray-800 dark:text-gray-100'>
            {meta.label}
          </span>
          <span className='text-[13px] font-semibold tabular-nums text-gray-900 dark:text-white'>
            {count}
          </span>
        </span>
        <span className='mt-1.5 flex items-center gap-2'>
          <span className='h-1.5 min-w-0 flex-1 overflow-hidden bg-gray-100 dark:bg-white/10'
            style={{ borderRadius: '999px' }}
          >
            <span
              className='block h-full transition-all duration-500 ease-[var(--ease-spring)]'
              style={{
                width: `${pct}%`,
                backgroundColor: meta.chart,
                borderRadius: '999px',
              }}
            />
          </span>
          <span className='w-8 shrink-0 text-right text-[11px] tabular-nums text-gray-400 dark:text-gray-500'>
            {pct}%
          </span>
        </span>
      </span>
    </button>
  )
}

const AttendanceSummary = ({
  summary,
  title = 'Attendance overview',
  subtitle = 'Presence across recorded lessons',
}) => {
  const [activeIndex, setActiveIndex] = useState(null)

  const total = summary?.total || 0
  const presentRate = summary?.presentRate ?? 0

  const chartData = useMemo(
    () =>
      ['present', 'absent', 'late', 'excused']
        .map((status) => ({
          status,
          name: STATUS_META[status].label,
          value: summary?.[status] || 0,
          color: STATUS_META[status].chart,
        }))
        .filter((item) => item.value > 0),
    [summary],
  )

  const statusIndex = useMemo(() => {
    const map = {}
    chartData.forEach((item, index) => {
      map[item.status] = index
    })
    return map
  }, [chartData])

  const trackData = useMemo(() => [{ name: 'track', value: 1 }], [])

  return (
    <section className={`${surface} overflow-hidden p-4 sm:p-5`} style={cardRadius}>
      <div className='flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between'>
        <div className='min-w-0'>
          <p className='text-[11px] font-medium tracking-[0.06em] text-gray-400 uppercase dark:text-gray-500'>
            {title}
          </p>
          <h2 className='mt-1 text-[20px] font-semibold tracking-tight text-gray-900 dark:text-white'>
            Presence at a glance
          </h2>
          <p className='mt-1 text-[13px] text-gray-500 dark:text-gray-400'>
            {subtitle}
            {total ? ` · ${total} recorded` : ''}
          </p>
        </div>
      </div>

      <div className='mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.95fr)] lg:items-center'>
        <div
          className='relative mx-auto flex h-[220px] w-full max-w-[240px] items-center justify-center'
        >
          <div
            className='pointer-events-none absolute inset-[18%] bg-[radial-gradient(circle_at_center,rgba(32,80,155,0.12),transparent_68%)] dark:bg-[radial-gradient(circle_at_center,rgba(61,118,198,0.18),transparent_70%)]'
            aria-hidden='true'
          />

          {chartData.length === 0 ? (
            <div
              className='grid h-[180px] w-[180px] place-items-center border border-dashed border-gray-200 bg-gray-50/80 text-center dark:border-white/10 dark:bg-white/5'
              style={{ borderRadius: '999px' }}
            >
              <div>
                <p className='text-[28px] font-semibold tracking-tight text-gray-300 dark:text-gray-600'>
                  —
                </p>
                <p className='mt-1 text-[11px] text-gray-400 dark:text-gray-500'>
                  No records yet
                </p>
              </div>
            </div>
          ) : (
            <>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={trackData}
                    dataKey='value'
                    innerRadius={68}
                    outerRadius={86}
                    fill='currentColor'
                    className='text-gray-100 dark:text-white/8'
                    stroke='none'
                    isAnimationActive={false}
                  />
                  <Pie
                    data={chartData}
                    dataKey='value'
                    nameKey='name'
                    innerRadius={68}
                    outerRadius={86}
                    paddingAngle={chartData.length > 1 ? 3 : 0}
                    stroke='none'
                    cornerRadius={6}
                    shape={(props) => (
                      <SectorShape {...props} activeIndex={activeIndex} />
                    )}
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                    isAnimationActive
                    animationBegin={80}
                    animationDuration={700}
                  >
                    {chartData.map((entry) => (
                      <Cell
                        key={entry.status}
                        fill={entry.color}
                        className='outline-none'
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={<ChartTooltip total={total} />}
                    cursor={false}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className='pointer-events-none absolute inset-0 grid place-items-center'>
                <div className='text-center'>
                  <p className='text-[11px] font-medium tracking-[0.08em] text-gray-400 uppercase dark:text-gray-500'>
                    Present
                  </p>
                  <p className='mt-0.5 text-[34px] leading-none font-semibold tracking-tight text-gray-900 tabular-nums dark:text-white'>
                    {presentRate}
                    <span className='text-[18px] text-gray-400 dark:text-gray-500'>
                      %
                    </span>
                  </p>
                  <p className='mt-1.5 text-[11px] text-gray-400 dark:text-gray-500'>
                    {total} total
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        <div
          className='flex flex-col gap-1 bg-gray-50/70 p-2 dark:bg-white/[0.03]'
          style={softRadius}
        >
          {['present', 'absent', 'late', 'excused'].map((status) => (
            <StatusRow
              key={status}
              status={status}
              count={summary?.[status] || 0}
              total={total}
              active={
                activeIndex != null &&
                statusIndex[status] === activeIndex
              }
              onHover={() => {
                if (statusIndex[status] != null) {
                  setActiveIndex(statusIndex[status])
                }
              }}
              onLeave={() => setActiveIndex(null)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default AttendanceSummary

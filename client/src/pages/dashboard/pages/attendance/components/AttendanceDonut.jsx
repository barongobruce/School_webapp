import React, { useMemo } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import {
  STATUS_META,
  buildAttendanceChartData,
  chipRadius,
  presentRateFromSummary,
} from '../attendanceUtils'

const ChartTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null

  return (
    <div
      className='border border-gray-200/80 bg-white/95 px-3 py-2 text-[12px] shadow-[var(--shadow-lift)] backdrop-blur-md dark:border-white/10 dark:bg-[#152238]/95'
      style={chipRadius}
    >
      {payload.map((entry) => (
        <p key={entry.dataKey || entry.name} className='text-gray-600 dark:text-gray-300'>
          <span className='font-medium' style={{ color: entry.color || entry.fill }}>
            {entry.name}
          </span>
          : {entry.value}
        </p>
      ))}
    </div>
  )
}

/**
 * Accurate attendance donut from a real summary object:
 * { present, absent, late, excused, presentRate?, total? }
 */
const AttendanceDonut = ({
  summary,
  emptyLabel = 'No attendance recorded yet.',
  className = '',
}) => {
  const safeSummary = useMemo(
    () => ({
      present: Number(summary?.present) || 0,
      absent: Number(summary?.absent) || 0,
      late: Number(summary?.late) || 0,
      excused: Number(summary?.excused) || 0,
      presentRate: Number(summary?.presentRate),
      total: Number(summary?.total),
    }),
    [summary],
  )

  const chartData = useMemo(
    () => buildAttendanceChartData(safeSummary),
    [safeSummary],
  )

  const total =
    Number.isFinite(safeSummary.total) && safeSummary.total > 0
      ? safeSummary.total
      : safeSummary.present +
        safeSummary.absent +
        safeSummary.late +
        safeSummary.excused

  const presentRate = Number.isFinite(safeSummary.presentRate)
    ? safeSummary.presentRate
    : presentRateFromSummary(safeSummary)

  if (!total) {
    return (
      <div className={className}>
        <p className='py-10 text-center text-[13px] text-gray-500 dark:text-gray-400'>
          {emptyLabel}
        </p>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className='relative mx-auto h-[210px] w-full max-w-[220px]'>
        <ResponsiveContainer width='100%' height='100%'>
          <PieChart>
            <Pie
              data={chartData}
              dataKey='value'
              nameKey='name'
              innerRadius={58}
              outerRadius={78}
              paddingAngle={chartData.length > 1 ? 3 : 0}
              stroke='none'
              cornerRadius={5}
            >
              {chartData.map((entry) => (
                <Cell key={entry.status} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className='pointer-events-none absolute inset-0 grid place-items-center'>
          <div className='text-center'>
            <p className='text-[10px] font-medium tracking-[0.08em] text-gray-400 uppercase dark:text-gray-500'>
              Present
            </p>
            <p className='text-[28px] font-semibold tracking-tight text-gray-900 tabular-nums dark:text-white'>
              {presentRate}
              <span className='text-[14px] text-gray-400'>%</span>
            </p>
            <p className='mt-0.5 text-[10px] text-gray-400 tabular-nums dark:text-gray-500'>
              {total} records
            </p>
          </div>
        </div>
      </div>

      <div className='mt-2 grid grid-cols-2 gap-2'>
        {['present', 'absent', 'late', 'excused'].map((status) => {
          const meta = STATUS_META[status]
          const count = safeSummary[status] ?? 0
          return (
            <div
              key={status}
              className={`flex items-center justify-between gap-2 px-2.5 py-2 text-[11px] font-medium ${meta.className}`}
              style={chipRadius}
            >
              <span>{meta.label}</span>
              <span className='tabular-nums'>{count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AttendanceDonut

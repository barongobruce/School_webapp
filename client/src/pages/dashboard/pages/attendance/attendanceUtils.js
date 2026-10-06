export const STATUS_META = {
  present: {
    label: 'Present',
    short: 'P',
    className:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300',
    dot: 'bg-emerald-500',
    chart: '#10b981',
  },
  absent: {
    label: 'Absent',
    short: 'A',
    className:
      'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300',
    dot: 'bg-rose-500',
    chart: '#f43f5e',
  },
  late: {
    label: 'Late',
    short: 'L',
    className:
      'bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-300',
    dot: 'bg-amber-500',
    chart: '#f4ae17',
  },
  excused: {
    label: 'Excused',
    short: 'E',
    className:
      'bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300',
    dot: 'bg-sky-500',
    chart: '#3d76c6',
  },
}

const EMPTY_ATTENDANCE = {
  present: 0,
  late: 0,
  excused: 0,
  absent: 0,
}

export const buildAttendanceChartData = (summary = EMPTY_ATTENDANCE) =>
  ['present', 'absent', 'late', 'excused']
    .map((status) => ({
      status,
      name: STATUS_META[status].label,
      value: Number(summary?.[status]) || 0,
      color: STATUS_META[status].chart,
    }))
    .filter((item) => item.value > 0)

/** Matches API: presentRate = (present + late) / total */
export const presentRateFromSummary = (summary = EMPTY_ATTENDANCE) => {
  const present = Number(summary?.present) || 0
  const late = Number(summary?.late) || 0
  const absent = Number(summary?.absent) || 0
  const excused = Number(summary?.excused) || 0
  const total = present + late + absent + excused
  if (!total) return 0
  return Math.round(((present + late) / total) * 100)
}

export const cardRadius = { borderRadius: '1.5rem 0.5rem 1.5rem 0.5rem' }
export const chipRadius = { borderRadius: '0.85rem 0.25rem 0.85rem 0.25rem' }
export const softRadius = { borderRadius: '0.95rem 0.3rem 0.95rem 0.3rem' }

export const surface =
  'border border-gray-200/70 bg-white dark:border-white/10 dark:bg-[#0c1528]'

export const formatDate = (iso) => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export const formatDateLong = (iso) => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export const formatTime = (iso) => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const toISODateInput = (date = new Date()) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export const initialsFromName = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?'

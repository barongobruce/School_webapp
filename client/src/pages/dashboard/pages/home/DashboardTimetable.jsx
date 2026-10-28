import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const cardRadius = { borderRadius: '1.6rem 0.45rem 1.6rem 0.45rem' }
const chipRadius = { borderRadius: '0.85rem 0.25rem 0.85rem 0.25rem' }

const surface =
  'border border-gray-200/70 bg-white dark:border-white/10 dark:bg-[#0c1528]'

const HOUR_HEIGHT = 48
const WORK_DAYS = 5
const BLOCK_GAP = 2

const SUBJECT_TONES = [
  {
    bg: 'bg-[#e8f4fc] dark:bg-sky-500/15',
    text: 'text-sky-950 dark:text-sky-100',
    muted: 'text-sky-700/70 dark:text-sky-300/70',
  },
  {
    bg: 'bg-[#fbf3e0] dark:bg-amber-500/15',
    text: 'text-amber-950 dark:text-amber-100',
    muted: 'text-amber-800/65 dark:text-amber-300/70',
  },
  {
    bg: 'bg-[#eee8f8] dark:bg-violet-500/15',
    text: 'text-violet-950 dark:text-violet-100',
    muted: 'text-violet-700/70 dark:text-violet-300/70',
  },
  {
    bg: 'bg-[#fde8ec] dark:bg-rose-500/18',
    text: 'text-rose-950 dark:text-rose-100',
    muted: 'text-rose-700/70 dark:text-rose-300/70',
  },
  {
    bg: 'bg-[#e9f5ef] dark:bg-emerald-500/15',
    text: 'text-emerald-950 dark:text-emerald-100',
    muted: 'text-emerald-700/70 dark:text-emerald-300/70',
  },
  {
    bg: 'bg-[#eceef4] dark:bg-slate-500/20',
    text: 'text-slate-900 dark:text-slate-100',
    muted: 'text-slate-600/70 dark:text-slate-300/70',
  },
]

/** A few subjects use the danger tint; everything else stays on the palette hash. */
const DANGER_SUBJECTS = new Set(['history', 'music'])

const startOfDay = (date) => {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

const addDays = (date, days) => {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

const startOfWeekMonday = (date = new Date()) => {
  const day = startOfDay(date)
  const weekday = day.getDay()
  const diff = weekday === 0 ? -6 : 1 - weekday
  return addDays(day, diff)
}

const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

const dayKey = (date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const minutesOfDay = (date) => date.getHours() * 60 + date.getMinutes()

const formatHourLabel = (hour) => {
  const date = new Date()
  date.setHours(hour, 0, 0, 0)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    hour12: true,
  })
}

const formatRange = (start, end) => {
  const opts = { hour: 'numeric', minute: '2-digit', hour12: true }
  return `${start.toLocaleTimeString('en-US', opts)} – ${end.toLocaleTimeString('en-US', opts)}`
}

const formatWeekRange = (weekStart) => {
  const weekEnd = addDays(weekStart, 4)
  const sameMonth = weekStart.getMonth() === weekEnd.getMonth()
  const startLabel = weekStart.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  })
  const endLabel = weekEnd.toLocaleDateString('en-US', {
    month: sameMonth ? undefined : 'long',
    day: 'numeric',
  })
  return `${startLabel} – ${endLabel}`
}

const formatDayHeading = (date) =>
  date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

const subjectTone = (subject = '') => {
  const key = subject.trim().toLowerCase()
  if (!key) return SUBJECT_TONES[5]
  if (DANGER_SUBJECTS.has(key)) return SUBJECT_TONES[3]
  let hash = 0
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0
  }
  return SUBJECT_TONES[hash % SUBJECT_TONES.length]
}

const lessonLabel = (lesson) =>
  lesson.courseName || lesson.subject || lesson.title || 'Lesson'

const ViewToggle = ({ view, onChange }) => (
  <div
    className='inline-flex items-center border border-gray-200/80 bg-gray-50/80 p-0.5 dark:border-white/10 dark:bg-white/[0.04]'
    style={chipRadius}
    role='group'
    aria-label='Timetable view'
  >
    {[
      { id: 'week', label: 'This week' },
      { id: 'day', label: 'Day' },
    ].map((option) => {
      const active = view === option.id
      return (
        <button
          key={option.id}
          type='button'
          onClick={() => onChange(option.id)}
          className={`px-2.5 py-1 text-[11px] font-semibold transition-colors ${
            active
              ? 'bg-[#ebe4f7] text-[#4a3f6b] shadow-sm dark:bg-violet-500/25 dark:text-violet-100'
              : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
          style={chipRadius}
          aria-pressed={active}
        >
          {option.label}
        </button>
      )
    })}
  </div>
)

const LessonBlock = ({ lesson, top, height, showMeta = false }) => {
  const start = new Date(lesson.scheduledAt)
  const duration = Math.max(Number(lesson.durationMinutes) || 45, 15)
  const end = new Date(start.getTime() + duration * 60_000)
  const tone = subjectTone(lessonLabel(lesson))
  const meta = [
    showMeta ? lesson.className : '',
    lesson.teacher,
    lesson.room,
  ].filter(Boolean).join(' · ')
  const className = `absolute inset-x-0.5 flex flex-col justify-center overflow-hidden px-1.5 py-0.5 transition-shadow ${tone.bg}`
  const style = {
    top,
    height: Math.max(height, 22),
    borderRadius: '0.5rem 0.15rem 0.5rem 0.15rem',
  }
  const content = (
    <>
      <span className={`block truncate text-[11px] font-semibold leading-tight ${tone.text}`}>
        {lessonLabel(lesson)}
      </span>
      {meta ? (
        <span className={`mt-px block truncate text-[9px] leading-tight ${tone.muted}`}>
          {meta}
        </span>
      ) : null}
    </>
  )

  if (lesson.isTimetableSlot) {
    return (
      <div
        title={`${lessonLabel(lesson)} · ${formatRange(start, end)}`}
        className={className}
        style={style}
      >
        {content}
      </div>
    )
  }

  const id = lesson.id || lesson._id
  return (
    <Link
      to={`/dashboard/lessons/${id}`}
      title={`${lessonLabel(lesson)} · ${formatRange(start, end)}`}
      className={`${className} hover:shadow-[var(--shadow-soft)]`}
      style={style}
    >
      {content}
    </Link>
  )
}

const DayColumn = ({
  lessons,
  activeHours,
  isToday,
  showMeta,
}) => {
  const hourCount = activeHours.length

  const positionFor = (start, duration) => {
    const startMin = minutesOfDay(start)
    const startHour = Math.floor(startMin / 60)
    const idx = activeHours.indexOf(startHour)
    if (idx < 0) {
      return { top: BLOCK_GAP / 2, height: HOUR_HEIGHT - BLOCK_GAP }
    }

    const minuteOffset = startMin - startHour * 60
    const top =
      idx * HOUR_HEIGHT + (minuteOffset / 60) * HOUR_HEIGHT + BLOCK_GAP / 2
    const height = (duration / 60) * HOUR_HEIGHT - BLOCK_GAP
    return { top, height }
  }

  return (
    <div
      className={`relative border-l border-gray-100 dark:border-white/5 ${
        isToday ? 'bg-blue-50/35 dark:bg-blue-500/[0.06]' : ''
      }`}
      style={{ height: hourCount * HOUR_HEIGHT }}
    >
      {Array.from({ length: hourCount + 1 }).map((_, index) => (
        <div
          key={index}
          className='pointer-events-none absolute right-0 left-0 border-t border-gray-100 dark:border-white/5'
          style={{ top: index * HOUR_HEIGHT }}
        />
      ))}
      {lessons.map((lesson) => {
        const start = new Date(lesson.scheduledAt)
        const duration = Math.max(Number(lesson.durationMinutes) || 45, 15)
        const { top, height } = positionFor(start, duration)
        return (
          <LessonBlock
            key={lesson.id || lesson._id}
            lesson={lesson}
            top={Math.max(top, 0)}
            height={height}
            showMeta={showMeta}
          />
        )
      })}
    </div>
  )
}

const DashboardTimetable = ({
  lessons = [],
  title = 'Timetable',
  showMeta = false,
  className = '',
}) => {
  const today = useMemo(() => startOfDay(new Date()), [])
  const [weekStart, setWeekStart] = useState(() => startOfWeekMonday(new Date()))
  const [view, setView] = useState('week')
  const [selectedDay, setSelectedDay] = useState(() => startOfDay(new Date()))

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const mq = window.matchMedia('(max-width: 1023px)')
    const sync = () => {
      if (mq.matches) setView('day')
    }
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const workDays = useMemo(
    () => Array.from({ length: WORK_DAYS }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  )

  const parsedLessons = useMemo(
    () =>
      (lessons || [])
        .map((lesson) => {
          const start = new Date(lesson.scheduledAt)
          if (Number.isNaN(start.getTime())) return null
          return { ...lesson, _start: start }
        })
        .filter(Boolean),
    [lessons],
  )

  const lessonsByDayKey = useMemo(() => {
    const map = new Map()
    for (const lesson of parsedLessons) {
      const key = dayKey(lesson._start)
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(lesson)
    }
    for (const list of map.values()) {
      list.sort((a, b) => a._start - b._start)
    }
    return map
  }, [parsedLessons])

  const activeDays = view === 'week' ? workDays : [selectedDay]

  const activeHours = useMemo(() => {
    const occupied = new Set()

    for (const day of activeDays) {
      for (const lesson of lessonsByDayKey.get(dayKey(day)) || []) {
        const startMin = minutesOfDay(lesson._start)
        const duration = Math.max(Number(lesson.durationMinutes) || 45, 15)
        const endMin = startMin + duration
        const firstHour = Math.floor(startMin / 60)
        const lastHour = Math.max(firstHour, Math.ceil(endMin / 60) - 1)
        for (let hour = firstHour; hour <= lastHour; hour += 1) {
          occupied.add(hour)
        }
      }
    }

    return [...occupied].sort((a, b) => a - b)
  }, [activeDays, lessonsByDayKey])

  const hourCount = Math.max(activeHours.length, 1)

  const dataBounds = useMemo(() => {
    const thisWeek = startOfWeekMonday(today)
    const nextWeek = addDays(thisWeek, 7)
    return { min: thisWeek, max: nextWeek }
  }, [today])

  const weekdayIndex = (date) => Math.min(Math.max((date.getDay() + 6) % 7, 0), 4)

  const shiftWeek = (delta) => {
    const next = addDays(weekStart, delta * 7)
    if (next < dataBounds.min || next > dataBounds.max) return
    setWeekStart(next)
    setSelectedDay(addDays(next, weekdayIndex(selectedDay)))
  }

  const shiftDay = (delta) => {
    let next = addDays(selectedDay, delta)
    // Skip weekends — stay on Mon–Fri
    while (next.getDay() === 0 || next.getDay() === 6) {
      next = addDays(next, delta > 0 ? 1 : -1)
    }
    const nextWeek = startOfWeekMonday(next)
    if (nextWeek < dataBounds.min || nextWeek > dataBounds.max) return
    setSelectedDay(next)
    setWeekStart(nextWeek)
  }

  const atWeekStart = weekStart <= dataBounds.min
  const atWeekEnd = weekStart >= dataBounds.max
  const atDayStart =
    atWeekStart && weekdayIndex(selectedDay) === 0
  const atDayEnd =
    atWeekEnd && weekdayIndex(selectedDay) === 4

  const weekLessonsCount = workDays.reduce((sum, day) => {
    const key = dayKey(day)
    return sum + (lessonsByDayKey.get(key)?.length || 0)
  }, 0)

  const dayLessons = lessonsByDayKey.get(dayKey(selectedDay)) || []

  const empty =
    view === 'week' ? weekLessonsCount === 0 : dayLessons.length === 0

  return (
    <section
      className={`${surface} flex min-h-0 flex-col p-4 shadow-[var(--shadow-soft)] sm:p-5 ${className}`}
      style={cardRadius}
    >
      <div className='mb-3 flex flex-wrap items-center justify-between gap-3'>
        <div className='min-w-0'>
          <h2 className='text-[15px] font-semibold tracking-tight text-gray-900 dark:text-white'>
            {title}
          </h2>
          <p className='mt-0.5 text-[11px] text-gray-500 dark:text-gray-400'>
            {view === 'week'
              ? formatWeekRange(weekStart)
              : formatDayHeading(selectedDay)}
          </p>
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <div className='flex items-center gap-0.5'>
            <button
              type='button'
              aria-label={view === 'week' ? 'Previous week' : 'Previous day'}
              disabled={view === 'week' ? atWeekStart : atDayStart}
              onClick={() => (view === 'week' ? shiftWeek(-1) : shiftDay(-1))}
              className='grid size-7 place-items-center text-gray-500 transition-colors hover:text-gray-900 disabled:opacity-30 dark:text-gray-400 dark:hover:text-white'
            >
              <ChevronLeft className='size-4' strokeWidth={1.75} />
            </button>
            <button
              type='button'
              onClick={() => {
                setWeekStart(startOfWeekMonday(today))
                setSelectedDay(
                  today.getDay() === 0 || today.getDay() === 6
                    ? startOfWeekMonday(today)
                    : today,
                )
              }}
              className='px-2 text-[11px] font-medium text-gray-500 transition-colors hover:text-blue-700 dark:text-gray-400 dark:hover:text-blue-300'
            >
              Today
            </button>
            <button
              type='button'
              aria-label={view === 'week' ? 'Next week' : 'Next day'}
              disabled={view === 'week' ? atWeekEnd : atDayEnd}
              onClick={() => (view === 'week' ? shiftWeek(1) : shiftDay(1))}
              className='grid size-7 place-items-center text-gray-500 transition-colors hover:text-gray-900 disabled:opacity-30 dark:text-gray-400 dark:hover:text-white'
            >
              <ChevronRight className='size-4' strokeWidth={1.75} />
            </button>
          </div>
          <ViewToggle view={view} onChange={setView} />
        </div>
      </div>

      {view === 'day' ? (
        <div className='mb-3 flex gap-1 overflow-x-auto pb-0.5'>
          {workDays.map((day) => {
            const active = sameDay(day, selectedDay)
            const isToday = sameDay(day, today)
            return (
              <button
                key={day.toISOString()}
                type='button'
                onClick={() => setSelectedDay(day)}
                className={`min-w-[3.25rem] flex-1 px-2 py-1.5 text-center transition-colors ${
                  active
                    ? 'bg-[#ebe4f7] text-[#4a3f6b] dark:bg-violet-500/25 dark:text-violet-100'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-white/[0.04] dark:text-gray-300 dark:hover:bg-white/[0.08]'
                }`}
                style={chipRadius}
              >
                <span className='block text-[10px] font-medium uppercase tracking-wide opacity-70'>
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <span
                  className={`mt-0.5 block text-[13px] font-semibold tabular-nums ${
                    isToday && !active ? 'text-blue-700 dark:text-blue-300' : ''
                  }`}
                >
                  {day.getDate()}
                </span>
              </button>
            )
          })}
        </div>
      ) : null}

      {empty ? (
        <div className='flex flex-1 items-center justify-center py-16 text-center'>
          <p className='max-w-xs text-[13px] text-gray-500 dark:text-gray-400'>
            {view === 'week'
              ? 'No lessons scheduled this week.'
              : 'No lessons on this day.'}
          </p>
        </div>
      ) : (
        <div className='w-full'>
            {view === 'week' ? (
              <div
                className='mb-0.5 grid'
                style={{
                  gridTemplateColumns: `2.75rem repeat(${WORK_DAYS}, minmax(0, 1fr))`,
                }}
              >
                <div />
                {workDays.map((day) => {
                  const isToday = sameDay(day, today)
                  return (
                    <button
                      key={day.toISOString()}
                      type='button'
                      onClick={() => {
                        setSelectedDay(day)
                        setView('day')
                      }}
                      className={`px-0.5 pb-1.5 text-center transition-colors ${
                        isToday
                          ? 'text-blue-700 dark:text-blue-300'
                          : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                    >
                      <span className='block text-[10px] font-medium uppercase tracking-[0.06em]'>
                        {day.toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      <span className='mt-0.5 block text-[12px] font-semibold tabular-nums'>
                        {day.getDate()}
                      </span>
                    </button>
                  )
                })}
              </div>
            ) : null}

            <div
              className='grid'
              style={{
                gridTemplateColumns:
                  view === 'week'
                    ? `2.75rem repeat(${WORK_DAYS}, minmax(0, 1fr))`
                    : '2.75rem minmax(0, 1fr)',
              }}
            >
              <div className='relative' style={{ height: hourCount * HOUR_HEIGHT }}>
                {activeHours.map((hour, index) => (
                  <div
                    key={hour}
                    className='absolute right-1.5 left-0 -translate-y-1/2 text-right text-[10px] font-medium text-gray-400 tabular-nums dark:text-gray-500'
                    style={{ top: index * HOUR_HEIGHT }}
                  >
                    {formatHourLabel(hour)}
                  </div>
                ))}
              </div>

              {activeDays.map((day) => {
                const key = dayKey(day)
                return (
                  <DayColumn
                    key={key}
                    lessons={lessonsByDayKey.get(key) || []}
                    activeHours={activeHours}
                    isToday={sameDay(day, today)}
                    showMeta={showMeta}
                  />
                )
              })}
            </div>
          </div>
      )}
    </section>
  )
}

export default DashboardTimetable
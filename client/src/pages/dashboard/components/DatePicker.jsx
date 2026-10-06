import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const softRadius = { borderRadius: '0.95rem 0.3rem 0.95rem 0.3rem' }
const panelRadius = { borderRadius: '1.35rem 0.45rem 1.35rem 0.45rem' }
const chipRadius = { borderRadius: '0.85rem 0.25rem 0.85rem 0.25rem' }

const pad = (n) => String(n).padStart(2, '0')

const toISODate = (year, monthIndex, day) =>
  `${year}-${pad(monthIndex + 1)}-${pad(day)}`

const parseISODate = (value) => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const [y, m, d] = value.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  ) {
    return null
  }
  return date
}

const daysInMonth = (year, monthIndex) =>
  new Date(year, monthIndex + 1, 0).getDate()

const formatDisplay = (value) => {
  const date = parseISODate(value)
  if (!date) return ''
  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const getAge = (value) => {
  const date = parseISODate(value)
  if (!date) return null
  const today = new Date()
  let age = today.getFullYear() - date.getFullYear()
  const monthDiff = today.getMonth() - date.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    age -= 1
  }
  return age >= 0 ? age : null
}

const DatePicker = ({
  id,
  name = 'date',
  value = '',
  onChange,
  minYear,
  maxYear,
  label = 'Date',
  placeholder = 'Select date',
  showAge = false,
}) => {
  const listboxId = useId()
  const triggerRef = useRef(null)
  const panelRef = useRef(null)
  const today = useMemo(() => new Date(), [])
  const resolvedMaxYear = maxYear ?? today.getFullYear() + 10
  const resolvedMinYear = minYear ?? today.getFullYear() - 100

  const selected = parseISODate(value)
  const [open, setOpen] = useState(false)
  const [view, setView] = useState('day') // 'day' | 'month' | 'year'
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 328 })
  const [cursor, setCursor] = useState(() => {
    if (selected) {
      return { year: selected.getFullYear(), month: selected.getMonth() }
    }
    const year = Math.min(
      resolvedMaxYear,
      Math.max(resolvedMinYear, today.getFullYear()),
    )
    return { year, month: today.getMonth() }
  })

  const years = useMemo(() => {
    const list = []
    for (let y = resolvedMaxYear; y >= resolvedMinYear; y -= 1) list.push(y)
    return list
  }, [resolvedMaxYear, resolvedMinYear])

  const age = showAge ? getAge(value) : null
  const display = formatDisplay(value)

  const updatePosition = () => {
    const rect = triggerRef.current?.getBoundingClientRect()
    if (!rect) return

    const panelWidth = Math.min(328, Math.max(rect.width, 280))
    const gap = 8
    const estimatedHeight = 420
    const spaceBelow = window.innerHeight - rect.bottom - gap
    const openUp = spaceBelow < estimatedHeight && rect.top > spaceBelow

    let left = rect.left
    if (left + panelWidth > window.innerWidth - 12) {
      left = Math.max(12, window.innerWidth - panelWidth - 12)
    }

    setCoords({
      top: openUp
        ? Math.max(12, rect.top - estimatedHeight - gap)
        : rect.bottom + gap,
      left,
      width: panelWidth,
    })
  }

  useEffect(() => {
    if (!open) return undefined

    updatePosition()

    const onPointerDown = (event) => {
      const target = event.target
      if (
        triggerRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return
      }
      setOpen(false)
      setView('day')
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
        setView('day')
      }
    }

    const onReposition = () => updatePosition()

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('resize', onReposition)
    window.addEventListener('scroll', onReposition, true)

    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('resize', onReposition)
      window.removeEventListener('scroll', onReposition, true)
    }
  }, [open])

  useEffect(() => {
    if (!selected) return
    setCursor({
      year: selected.getFullYear(),
      month: selected.getMonth(),
    })
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps -- sync from value only

  const emit = (iso) => {
    onChange?.({
      target: { name, value: iso },
    })
  }

  const selectDay = (day) => {
    emit(toISODate(cursor.year, cursor.month, day))
    setOpen(false)
    setView('day')
  }

  const shiftMonth = (delta) => {
    setCursor((prev) => {
      const date = new Date(prev.year, prev.month + delta, 1)
      const year = Math.min(
        resolvedMaxYear,
        Math.max(resolvedMinYear, date.getFullYear()),
      )
      return { year, month: date.getMonth() }
    })
  }

  const gridDays = useMemo(() => {
    const firstWeekday = new Date(cursor.year, cursor.month, 1).getDay()
    const total = daysInMonth(cursor.year, cursor.month)
    const cells = []

    for (let i = 0; i < firstWeekday; i += 1) {
      cells.push({ key: `e-${i}`, empty: true })
    }

    for (let day = 1; day <= total; day += 1) {
      const iso = toISODate(cursor.year, cursor.month, day)
      const isSelected = value === iso
      const isToday =
        today.getFullYear() === cursor.year &&
        today.getMonth() === cursor.month &&
        today.getDate() === day

      cells.push({
        key: iso,
        day,
        iso,
        isSelected,
        isToday,
      })
    }

    return cells
  }, [cursor.month, cursor.year, today, value])

  const panel =
    open &&
    createPortal(
      <div
        ref={panelRef}
        id={listboxId}
        role='dialog'
        aria-label={label}
        className='fixed z-[200] overflow-hidden border border-gray-200/70 bg-white shadow-[0_20px_48px_rgba(8,33,78,0.16)] dark:border-white/10 dark:bg-[#0c1528] dark:shadow-[0_20px_48px_rgba(0,0,0,0.5)]'
        style={{
          ...panelRadius,
          top: coords.top,
          left: coords.left,
          width: coords.width,
        }}
      >
        <div className='brand-gradient px-3.5 py-3'>
          <p className='text-[10px] font-semibold tracking-[0.14em] text-white/70 uppercase'>
            {label}
          </p>
          <p className='mt-0.5 text-[15px] font-semibold tracking-tight text-white'>
            {display || 'Pick a date'}
          </p>
        </div>

        <div className='flex items-center justify-between gap-2 border-b border-gray-100 px-2.5 py-2 dark:border-white/8'>
          <button
            type='button'
            onClick={() => shiftMonth(-1)}
            className='grid size-8 place-items-center text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-white/8 dark:hover:text-gray-100'
            style={chipRadius}
            aria-label='Previous month'
          >
            <ChevronLeft className='size-4' strokeWidth={2} />
          </button>

          <div className='flex min-w-0 items-center gap-1'>
            <button
              type='button'
              onClick={() => setView((v) => (v === 'month' ? 'day' : 'month'))}
              className='px-2.5 py-1.5 text-[12px] font-semibold text-gray-800 transition-colors hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-white/8'
              style={chipRadius}
            >
              {MONTHS_SHORT[cursor.month]}
            </button>
            <button
              type='button'
              onClick={() => setView((v) => (v === 'year' ? 'day' : 'year'))}
              className='brand-gradient px-2.5 py-1.5 text-[12px] font-semibold text-white shadow-[0_8px_16px_rgba(32,80,155,0.25)]'
              style={chipRadius}
            >
              {cursor.year}
            </button>
          </div>

          <button
            type='button'
            onClick={() => shiftMonth(1)}
            className='grid size-8 place-items-center text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-white/8 dark:hover:text-gray-100'
            style={chipRadius}
            aria-label='Next month'
          >
            <ChevronRight className='size-4' strokeWidth={2} />
          </button>
        </div>

        <div className='p-3'>
          {view === 'year' && (
            <div className='grid max-h-56 grid-cols-3 gap-1.5 overflow-y-auto pr-0.5'>
              {years.map((year) => {
                const active = cursor.year === year
                const selectedYear = selected?.getFullYear() === year
                return (
                  <button
                    key={year}
                    type='button'
                    onClick={() => {
                      setCursor((prev) => ({ ...prev, year }))
                      setView('month')
                    }}
                    className={`h-9 text-[12px] font-semibold transition-all ${
                      active || selectedYear
                        ? 'brand-gradient text-white shadow-[0_8px_16px_rgba(32,80,155,0.28)]'
                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/8'
                    }`}
                    style={softRadius}
                  >
                    {year}
                  </button>
                )
              })}
            </div>
          )}

          {view === 'month' && (
            <div className='grid grid-cols-3 gap-1.5'>
              {MONTHS.map((month, index) => {
                const active = cursor.month === index
                const selectedMonth =
                  selected?.getFullYear() === cursor.year &&
                  selected?.getMonth() === index
                return (
                  <button
                    key={month}
                    type='button'
                    onClick={() => {
                      setCursor((prev) => ({ ...prev, month: index }))
                      setView('day')
                    }}
                    className={`h-10 text-[12px] font-semibold transition-all ${
                      active || selectedMonth
                        ? 'brand-gradient text-white shadow-[0_8px_16px_rgba(32,80,155,0.28)]'
                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/8'
                    }`}
                    style={softRadius}
                  >
                    {MONTHS_SHORT[index]}
                  </button>
                )
              })}
            </div>
          )}

          {view === 'day' && (
            <>
              <div className='mb-1.5 grid grid-cols-7 gap-1'>
                {WEEKDAYS.map((day) => (
                  <div
                    key={day}
                    className='grid h-7 place-items-center text-[10px] font-semibold tracking-wide text-gray-400 uppercase'
                  >
                    {day}
                  </div>
                ))}
              </div>
              <div className='grid grid-cols-7 gap-1'>
                {gridDays.map((cell) =>
                  cell.empty ? (
                    <div key={cell.key} className='h-9' />
                  ) : (
                    <button
                      key={cell.key}
                      type='button'
                      onClick={() => selectDay(cell.day)}
                      className={`relative h-9 text-[12px] font-semibold transition-all ${
                        cell.isSelected
                          ? 'brand-gradient text-white shadow-[0_8px_16px_rgba(32,80,155,0.3)]'
                          : cell.isToday
                            ? 'bg-blue-50 text-[#20509b] dark:bg-blue-500/15 dark:text-blue-300'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-white/8'
                      }`}
                      style={chipRadius}
                    >
                      {cell.day}
                    </button>
                  ),
                )}
              </div>
            </>
          )}
        </div>

        <div className='flex items-center justify-between gap-2 border-t border-gray-100 px-3 py-2.5 dark:border-white/8'>
          <button
            type='button'
            onClick={() => {
              emit('')
              setOpen(false)
              setView('day')
            }}
            className='px-2.5 py-1.5 text-[11px] font-semibold text-gray-500 transition-colors hover:text-gray-800 dark:hover:text-gray-200'
            style={chipRadius}
          >
            Clear
          </button>
          <p className='text-[11px] text-gray-400'>
            Tap year to jump decades fast
          </p>
        </div>
      </div>,
      document.body,
    )

  return (
    <div className='relative'>
      <button
        ref={triggerRef}
        id={id}
        type='button'
        aria-haspopup='dialog'
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        onClick={() => {
          setOpen((prev) => !prev)
          setView('day')
        }}
        className={`form-field flex h-11 w-full items-center gap-3 px-3.5 text-left ${
          open
            ? 'border-blue-500 bg-white ring-3 ring-blue-500/15 dark:border-blue-400 dark:bg-[#1a2c48] dark:ring-blue-400/20'
            : ''
        }`}
        style={{ borderRadius: '1.1rem 0.35rem 1.1rem 0.35rem' }}
      >
        <span
          className='grid size-8 shrink-0 place-items-center brand-gradient text-white shadow-[0_8px_18px_rgba(32,80,155,0.28)]'
          style={chipRadius}
        >
          <CalendarDays className='size-3.5' strokeWidth={2} />
        </span>
        <span className='min-w-0 flex-1'>
          {display ? (
            <>
              <span className='block truncate text-[13px] font-semibold text-gray-900 dark:text-gray-100'>
                {display}
              </span>
              {age !== null && (
                <span className='block text-[11px] text-gray-400'>
                  {age} {age === 1 ? 'year' : 'years'} old
                </span>
              )}
            </>
          ) : (
            <span className='block text-[13px] text-gray-400'>{placeholder}</span>
          )}
        </span>
      </button>
      {panel}
    </div>
  )
}

export default DatePicker

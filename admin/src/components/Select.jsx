import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown, Search } from 'lucide-react'
import { cn } from '../lib/utils'

const panelRadius = { borderRadius: '1.35rem 0.45rem 1.35rem 0.45rem' }
const chipRadius = { borderRadius: '0.85rem 0.25rem 0.85rem 0.25rem' }
const triggerRadius = { borderRadius: '1.1rem 0.35rem 1.1rem 0.35rem' }

const normalizeOptions = (options = []) =>
  options.map((option) => {
    if (typeof option === 'string' || typeof option === 'number') {
      return { value: String(option), label: String(option) }
    }
    return {
      value: String(option.value),
      label: option.label ?? String(option.value),
      description: option.description,
      disabled: Boolean(option.disabled),
    }
  })

const Select = ({
  id,
  name,
  value = '',
  onChange,
  options = [],
  placeholder = 'Select an option',
  label,
  icon: Icon,
  searchable,
  searchPlaceholder = 'Search…',
  emptyMessage = 'No matches found',
  className,
  disabled = false,
}) => {
  const listboxId = useId()
  const triggerRef = useRef(null)
  const panelRef = useRef(null)
  const searchRef = useRef(null)
  const optionRefs = useRef([])

  const items = useMemo(() => normalizeOptions(options), [options])
  const enableSearch =
    typeof searchable === 'boolean' ? searchable : items.length > 6

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 280 })

  const selected = items.find((item) => item.value === String(value)) ?? null

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((item) => {
      const haystack = `${item.label} ${item.description || ''}`.toLowerCase()
      return haystack.includes(q)
    })
  }, [items, query])

  const updatePosition = () => {
    const rect = triggerRef.current?.getBoundingClientRect()
    if (!rect) return

    const panelWidth = Math.max(rect.width, 240)
    const gap = 8
    const estimatedHeight = enableSearch ? 320 : 280
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

  const close = () => {
    setOpen(false)
    setQuery('')
    setActiveIndex(-1)
  }

  const emit = (nextValue) => {
    onChange?.({
      target: { name, value: nextValue },
    })
    close()
  }

  useEffect(() => {
    if (!open) return undefined

    updatePosition()

    const selectedIndex = filtered.findIndex(
      (item) => item.value === String(value),
    )
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : filtered.length ? 0 : -1)

    const frame = window.requestAnimationFrame(() => {
      if (enableSearch) {
        searchRef.current?.focus()
      } else {
        panelRef.current?.focus()
      }
    })

    const onPointerDown = (event) => {
      const target = event.target
      if (
        triggerRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return
      }
      close()
    }

    const onReposition = () => updatePosition()

    document.addEventListener('mousedown', onPointerDown)
    window.addEventListener('resize', onReposition)
    window.addEventListener('scroll', onReposition, true)

    return () => {
      window.cancelAnimationFrame(frame)
      document.removeEventListener('mousedown', onPointerDown)
      window.removeEventListener('resize', onReposition)
      window.removeEventListener('scroll', onReposition, true)
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open || activeIndex < 0) return
    optionRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, open])

  const moveActive = (delta) => {
    if (!filtered.length) return
    setActiveIndex((prev) => {
      const start = prev < 0 ? (delta > 0 ? -1 : 0) : prev
      let next = start
      for (let i = 0; i < filtered.length; i += 1) {
        next = (next + delta + filtered.length) % filtered.length
        if (!filtered[next]?.disabled) return next
      }
      return prev
    })
  }

  const onTriggerKeyDown = (event) => {
    if (disabled) return

    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setOpen(true)
    }
  }

  const onPanelKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      close()
      triggerRef.current?.focus()
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      moveActive(1)
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      moveActive(-1)
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      const item = filtered[activeIndex]
      if (item && !item.disabled) emit(item.value)
    }
  }

  const panel =
    open &&
    createPortal(
      <div
        ref={panelRef}
        id={listboxId}
        role='listbox'
        aria-label={label || placeholder}
        tabIndex={-1}
        onKeyDown={onPanelKeyDown}
        className='fixed z-[200] overflow-hidden border border-gray-200/70 bg-white shadow-[0_20px_48px_rgba(8,33,78,0.16)] outline-none dark:border-white/10 dark:bg-[#0c1528] dark:shadow-[0_20px_48px_rgba(0,0,0,0.5)]'
        style={{
          ...panelRadius,
          top: coords.top,
          left: coords.left,
          width: coords.width,
        }}
      >
        {(label || enableSearch) && (
          <div className='border-b border-gray-100 px-3 py-2.5 dark:border-white/8'>
            {label && (
              <p className='mb-2 text-[10px] font-semibold tracking-[0.14em] text-gray-400 uppercase'>
                {label}
              </p>
            )}
            {enableSearch && (
              <div
                className='form-field flex h-10 items-center gap-2 px-3'
                style={chipRadius}
              >
                <Search
                  className='size-3.5 shrink-0 text-gray-400'
                  strokeWidth={2}
                />
                <input
                  ref={searchRef}
                  type='text'
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value)
                    setActiveIndex(0)
                  }}
                  placeholder={searchPlaceholder}
                  className='h-full w-full min-w-0 bg-transparent text-[13px] text-gray-900 outline-none placeholder:text-gray-400 dark:text-gray-100'
                />
              </div>
            )}
          </div>
        )}

        <div className='max-h-56 overflow-y-auto p-1.5'>
          {filtered.length === 0 ? (
            <div className='px-3 py-8 text-center text-[12px] text-gray-400'>
              {emptyMessage}
            </div>
          ) : (
            filtered.map((item, index) => {
              const isSelected = item.value === String(value)
              const isActive = index === activeIndex

              return (
                <button
                  key={item.value}
                  ref={(node) => {
                    optionRefs.current[index] = node
                  }}
                  type='button'
                  role='option'
                  aria-selected={isSelected}
                  disabled={item.disabled}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => {
                    if (!item.disabled) emit(item.value)
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors',
                    item.disabled && 'cursor-not-allowed opacity-40',
                    isSelected
                      ? 'brand-gradient text-white shadow-[0_8px_18px_rgba(32,80,155,0.28)]'
                      : isActive
                        ? 'bg-blue-50 text-gray-900 dark:bg-blue-500/10 dark:text-gray-100'
                        : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/5',
                  )}
                  style={chipRadius}
                >
                  <span className='min-w-0 flex-1'>
                    <span className='block truncate text-[13px] font-semibold'>
                      {item.label}
                    </span>
                    {item.description ? (
                      <span
                        className={cn(
                          'mt-0.5 block truncate text-[11px]',
                          isSelected
                            ? 'text-white/75'
                            : 'text-gray-400 dark:text-gray-500',
                        )}
                      >
                        {item.description}
                      </span>
                    ) : null}
                  </span>
                  {isSelected ? (
                    <Check className='size-3.5 shrink-0' strokeWidth={2.5} />
                  ) : null}
                </button>
              )
            })
          )}
        </div>
      </div>,
      document.body,
    )

  return (
    <div className={cn('relative min-w-0', className)}>
      <button
        ref={triggerRef}
        id={id}
        type='button'
        disabled={disabled}
        aria-haspopup='listbox'
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        onClick={() => {
          if (disabled) return
          setOpen((prev) => !prev)
        }}
        onKeyDown={onTriggerKeyDown}
        className={cn(
          'form-field flex h-11 w-full items-center gap-3 px-3.5 text-left disabled:cursor-not-allowed disabled:opacity-50',
          open &&
            'border-blue-500 bg-white ring-3 ring-blue-500/15 dark:border-blue-400 dark:bg-[#1a2c48] dark:ring-blue-400/20',
        )}
        style={triggerRadius}
      >
        {Icon ? (
          <span
            className={cn(
              'grid size-8 shrink-0 place-items-center transition-colors',
              selected
                ? 'brand-gradient text-white shadow-[0_8px_18px_rgba(32,80,155,0.28)]'
                : 'border border-gray-200/70 bg-gray-50 text-[#20509b] dark:border-white/15 dark:bg-[#0f1a30] dark:text-blue-300',
            )}
            style={chipRadius}
          >
            <Icon className='size-3.5' strokeWidth={2} />
          </span>
        ) : null}

        <span className='min-w-0 flex-1'>
          {selected ? (
            <>
              <span className='block truncate text-[13px] font-semibold text-gray-900 dark:text-gray-100'>
                {selected.label}
              </span>
              {selected.description ? (
                <span className='block truncate text-[11px] text-gray-400'>
                  {selected.description}
                </span>
              ) : null}
            </>
          ) : (
            <span className='block text-[13px] text-gray-400'>{placeholder}</span>
          )}
        </span>

        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-gray-400 transition-transform duration-200',
            open && 'rotate-180 text-[#20509b] dark:text-blue-300',
          )}
          strokeWidth={2}
        />
      </button>
      {panel}
    </div>
  )
}

export default Select

import React from 'react'
import { cn } from '../../../lib/utils'

const triggerRadius = { borderRadius: '1.1rem 0.35rem 1.1rem 0.35rem' }
const chipRadius = { borderRadius: '0.85rem 0.25rem 0.85rem 0.25rem' }

const IconInput = ({
  id,
  name,
  type = 'text',
  value = '',
  onChange,
  placeholder,
  icon: Icon,
  autoComplete,
  maxLength,
  disabled = false,
  className,
  ...inputProps
}) => {
  const hasValue = Boolean(String(value || '').trim())

  return (
    <label
      htmlFor={id}
      className={cn(
        'form-field flex h-11 w-full min-w-0 cursor-text items-center gap-3 px-3.5',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
      style={triggerRadius}
    >
      {Icon ? (
        <span
          className={cn(
            'grid size-8 shrink-0 place-items-center transition-colors',
            hasValue
              ? 'brand-gradient text-white shadow-[0_8px_18px_rgba(32,80,155,0.28)]'
              : 'border border-gray-200/70 bg-gray-50 text-[#20509b] dark:border-white/15 dark:bg-[#0f1a30] dark:text-blue-300',
          )}
          style={chipRadius}
        >
          <Icon className='size-3.5' strokeWidth={2} />
        </span>
      ) : null}

      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        maxLength={maxLength}
        disabled={disabled}
        className='h-full w-full min-w-0 bg-transparent text-[13px] font-semibold text-gray-900 outline-none placeholder:font-normal placeholder:text-gray-400 dark:text-gray-100 dark:placeholder:text-slate-400'
        {...inputProps}
      />
    </label>
  )
}

export default IconInput

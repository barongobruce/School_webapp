import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { cn } from '../lib/utils'

const variants = {
  primary:
    'brand-gradient text-white shadow-[var(--shadow-brand)] hover:brightness-110 hover:shadow-[0_14px_34px_rgba(32,80,155,0.4)] cursor-pointer',
  secondary:
    'bg-surface text-ink border border-line shadow-[var(--shadow-soft)] hover:bg-surface-2',
  ghost: 'text-ink hover:opacity-70',
  outline:
    'border border-line bg-transparent text-ink hover:bg-surface-2',
}

const sizes = {
  sm: 'h-10 px-3.5 text-xs gap-1.5',
  md: 'h-12 px-5 text-sm gap-2',
  lg: 'h-14 px-7 text-[15px] gap-2',
  xl: 'h-16 px-10 text-sm gap-2',
}

/**
 * Cool radius per size — TL · TR · BR · BL
 * lg: 1.8 / 0.6 · xl: 2.2 / 0.8 · md & sm scaled down
 */
const sizeStyles = {
  sm: { borderRadius: '1.2rem 0.4rem 1.2rem 0.4rem' },
  md: { borderRadius: '1.5rem 0.5rem 1.5rem 0.5rem' },
  lg: { borderRadius: '1.8rem 0.6rem 1.8rem 0.6rem' },
  xl: { borderRadius: '2.2rem 0.8rem 2.2rem 0.8rem' },
}

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  disabled,
  to,
  href,
  type = 'button',
  style,
  ...props
}) => {
  const classes = cn(
    'inline-flex select-none items-center justify-center whitespace-nowrap font-semibold transition-all duration-200 ease-spring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]',
    variants[variant],
    sizes[size],
    className,
  )

  const mergedStyle = { ...sizeStyles[size], ...style }

  if (to) {
    return (
      <Link
        to={to}
        className={classes}
        style={mergedStyle}
        aria-disabled={disabled || loading || undefined}
        {...props}
      >
        {loading && <Loader2 className='size-4 animate-spin' />}
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a
        href={href}
        className={classes}
        style={mergedStyle}
        aria-disabled={disabled || loading || undefined}
        {...props}
      >
        {loading && <Loader2 className='size-4 animate-spin' />}
        {children}
      </a>
    )
  }

  return (
    <button
      type={type}
      className={classes}
      style={mergedStyle}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className='size-4 animate-spin' />}
      {children}
    </button>
  )
}

export default Button

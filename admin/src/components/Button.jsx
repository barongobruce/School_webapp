import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { cn } from '../lib/utils'

const variants = {
  primary:
    'brand-gradient text-white shadow-[0_12px_32px_rgba(32,80,155,0.32)] hover:brightness-110 hover:shadow-[0_16px_40px_rgba(32,80,155,0.384)] dark:shadow-[0_14px_36px_rgba(61,118,198,0.4)] dark:hover:shadow-[0_16px_40px_rgba(61,118,198,0.4)]',
  secondary:
    'bg-gray-100 text-gray-800 shadow-[0_12px_32px_rgba(8,33,78,0.096),0_4px_10px_rgba(8,33,78,0.048)] hover:bg-gray-200/80 hover:shadow-[0_16px_40px_rgba(8,33,78,0.112),0_6px_14px_rgba(8,33,78,0.064)] dark:bg-[#1a2740] dark:text-gray-100 dark:shadow-[0_12px_34px_rgba(0,0,0,0.4),0_4px_12px_rgba(0,0,0,0.256)] dark:hover:bg-[#223252] dark:hover:shadow-[0_18px_44px_rgba(0,0,0,0.44),0_8px_16px_rgba(0,0,0,0.288)]',
  ghost:
    'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/8 dark:hover:text-gray-100',
  outline:
    'bg-white text-gray-800 shadow-[0_12px_32px_rgba(8,33,78,0.096),0_4px_10px_rgba(8,33,78,0.048)] hover:bg-gray-50 hover:shadow-[0_16px_40px_rgba(8,33,78,0.112),0_6px_14px_rgba(8,33,78,0.064)] dark:bg-[#152238] dark:text-gray-100 dark:shadow-[0_12px_34px_rgba(0,0,0,0.4),0_4px_12px_rgba(0,0,0,0.256)] dark:hover:bg-[#1a2740] dark:hover:shadow-[0_18px_44px_rgba(0,0,0,0.44),0_8px_16px_rgba(0,0,0,0.288)]',
}

const sizes = {
  sm: 'h-9 px-3.5 text-xs gap-1.5',
  md: 'h-10 px-5 text-sm gap-2',
  lg: 'h-12 px-6 text-[15px] gap-2',
}

/**
 * Cool radius per size — TL · TR · BR · BL
 */
const sizeStyles = {
  sm: { borderRadius: '1.1rem 0.35rem 1.1rem 0.35rem' },
  md: { borderRadius: '1.35rem 0.45rem 1.35rem 0.45rem' },
  lg: { borderRadius: '1.6rem 0.55rem 1.6rem 0.55rem' },
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
    'inline-flex select-none items-center justify-center whitespace-nowrap font-semibold transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]',
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
        {loading && <Loader2 className='size-3.5 animate-spin' />}
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
        {loading && <Loader2 className='size-3.5 animate-spin' />}
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
      {loading && <Loader2 className='size-3.5 animate-spin' />}
      {children}
    </button>
  )
}

export default Button

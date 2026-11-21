import { LoaderCircle } from 'lucide-react'

const VARIANT_CLASSES = {
  primary: [
    'border border-transparent',
    'bg-primary text-text-inverse shadow-sm',
    'hover:bg-primary-hover hover:shadow-md',
    'active:scale-[0.98]',
  ].join(' '),

  secondary: [
    'border border-border',
    'bg-surface-secondary text-text-primary',
    'hover:border-border-strong hover:bg-sand',
    'active:scale-[0.98]',
  ].join(' '),

  outline: [
    'border border-border-strong',
    'bg-surface text-text-primary',
    'hover:border-caramel hover:bg-surface-secondary',
    'active:scale-[0.98]',
  ].join(' '),

  ghost: [
    'border border-transparent',
    'bg-transparent text-text-secondary',
    'hover:bg-surface-secondary hover:text-text-primary',
    'active:scale-[0.98]',
  ].join(' '),

  danger: [
    'border border-transparent',
    'bg-danger text-white shadow-sm',
    'hover:brightness-95 hover:shadow-md',
    'active:scale-[0.98]',
  ].join(' '),
}

const SIZE_CLASSES = {
  sm: 'min-h-9 rounded-lg px-3 text-xs sm:min-h-9 sm:px-3.5',
  md: 'min-h-10 rounded-xl px-4 text-sm sm:min-h-11 sm:px-5',
  lg: 'min-h-11 rounded-xl px-5 text-sm sm:min-h-12 sm:px-6 sm:text-base',
}

function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  ...buttonProps
}) {
  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={[
        'inline-flex items-center justify-center gap-2',
        'font-semibold tracking-[0.01em]',
        'transition-all duration-200 ease-out',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
        'disabled:pointer-events-none disabled:opacity-55',
        'disabled:shadow-none disabled:active:scale-100',
        VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary,
        SIZE_CLASSES[size] || SIZE_CLASSES.md,
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...buttonProps}
    >
      {loading ? (
        <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
      ) : leftIcon ? (
        <span aria-hidden="true" className="shrink-0">
          {leftIcon}
        </span>
      ) : null}

      {children}

      {!loading && rightIcon ? (
        <span aria-hidden="true" className="shrink-0">
          {rightIcon}
        </span>
      ) : null}
    </button>
  )
}

export default Button

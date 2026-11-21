import { LoaderCircle } from 'lucide-react'

const SIZE_CLASSES = {
  sm: 'h-4 w-4',
  md: 'h-7 w-7',
  lg: 'h-10 w-10',
}

function LoadingState({
  label = 'Loading...',
  size = 'md',
  fullPage = false,
  className = '',
}) {
  const iconSize = SIZE_CLASSES[size] ?? SIZE_CLASSES.md

  return (
    <div
      className={[
        'flex items-center justify-center gap-3 text-text-secondary',
        fullPage ? 'min-h-[50vh] w-full' : 'min-h-24 w-full py-6',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role="status"
      aria-live="polite"
    >
      <LoaderCircle
        aria-hidden="true"
        className={['shrink-0 animate-spin text-accent', iconSize].join(' ')}
      />

      <span>{label}</span>
    </div>
  )
}

export default LoadingState

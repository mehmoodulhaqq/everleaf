import { AlertCircle, RefreshCw } from 'lucide-react'
import Button from './Button'

function ErrorState({
  title = 'Something went wrong',
  description = 'We could not complete this request. Please try again.',
  onRetry,
  retryLabel = 'Try again',
  action,
  className = '',
}) {
  return (
    <section
      className={[
        'flex w-full flex-col items-center justify-center rounded-2xl',
        'border border-danger/20 bg-surface px-6 py-10 text-center sm:px-10',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role="alert"
    >
      <AlertCircle aria-hidden="true" className="h-6 w-6 text-danger" />

      <h2 className="mt-4 font-display text-xl font-semibold text-text-primary">
        {title}
      </h2>

      {description ? (
        <p className="mt-2 max-w-md text-sm text-text-secondary">
          {description}
        </p>
      ) : null}

      {action ? (
        <div className="mt-6">{action}</div>
      ) : onRetry ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
          leftIcon={<RefreshCw className="h-4 w-4" />}
          className="mt-6"
        >
          {retryLabel}
        </Button>
      ) : null}
    </section>
  )
}

export default ErrorState

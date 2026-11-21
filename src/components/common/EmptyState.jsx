import { BookOpen } from 'lucide-react'
import { isValidElement, useId } from 'react'

function EmptyState({
  icon,
  title = 'Nothing here yet',
  description = 'There is no content to display at the moment.',
  action,
  className = '',
}) {
  const titleId = useId()
  const descriptionId = useId()

  const DefaultIcon = BookOpen

  const iconElement = isValidElement(icon) ? (
    icon
  ) : typeof icon === 'function' ? (
    <icon.type />
  ) : icon ? (
    <icon />
  ) : (
    <DefaultIcon className="h-8 w-8" aria-hidden="true" />
  )

  return (
    <section
      className={[
        'flex w-full flex-col items-center justify-center',
        'rounded-2xl border border-dashed border-border',
        'bg-surface-secondary/40 px-6 py-10 text-center',
        'sm:px-10',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role="status"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
    >
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sand/60 text-walnut"
        aria-hidden="true"
      >
        {isValidElement(icon) ? icon : iconElement}
      </div>

      <h3
        id={titleId}
        className="mt-4 font-display text-lg font-semibold text-text-primary"
      >
        {title}
      </h3>

      {description ? (
        <p
          id={descriptionId}
          className="mt-2 max-w-md text-sm leading-6 text-text-secondary"
        >
          {description}
        </p>
      ) : null}

      {action ? <div className="mt-6">{action}</div> : null}
    </section>
  )
}

export default EmptyState


import { useId } from 'react'

function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
  className = '',
}) {
  const headingId = useId()

  return (
    <section
      aria-labelledby={headingId}
      className={[
        'rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="mb-5 flex items-start gap-3">
        {Icon ? (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sand/60 text-walnut">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        ) : null}

        <div className="min-w-0">
          <h2
            id={headingId}
            className="font-display text-lg font-semibold text-text-primary"
          >
            {title}
          </h2>

          {description ? (
            <p className="mt-1 text-sm leading-6 text-text-secondary">
              {description}
            </p>
          ) : null}
        </div>
      </div>

      {children}
    </section>
  )
}

export default SettingsSection

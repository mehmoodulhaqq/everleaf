function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  className = '',
  titleClassName = '',
}) {
  return (
    <header
      className={[
        'mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            {eyebrow}
          </p>
        ) : null}

        <h1
          className={[
            'font-display text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl',
            titleClassName,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {title}
        </h1>

        {description ? (
          <p className="mt-2 max-w-2xl text-sm text-text-secondary sm:text-base">
            {description}
          </p>
        ) : null}
      </div>

      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          {actions}
        </div>
      ) : null}
    </header>
  )
}

export default PageHeader

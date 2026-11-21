import {
  BookOpen,
  BookCheck,
  BookMarked,
  Clock3,
  Flame,
  FileText,
} from 'lucide-react'

const METRICS = [
  {
    key: 'totalBooks',
    label: 'Books in library',
    icon: BookOpen,
    format: (value) => value,
  },
  {
    key: 'completedBooks',
    label: 'Books completed',
    icon: BookCheck,
    format: (value) => value,
  },
  {
    key: 'pagesRead',
    label: 'Pages read',
    icon: FileText,
    format: (value) => Number(value || 0).toLocaleString(),
  },
  {
    key: 'readingHours',
    label: 'Hours spent reading',
    icon: Clock3,
    format: (value) => `${Number(value || 0).toLocaleString()} hrs`,
  },
  {
    key: 'readingStreak',
    label: 'Current reading streak',
    icon: Flame,
    format: (value) => `${value || 0} days`,
  },
  {
    key: 'currentlyReading',
    label: 'Currently reading',
    icon: BookMarked,
    format: (value) => value,
  },
]

function StatisticsOverview({ statistics = {} }) {
  return (
    <section aria-label="Reading overview">
      <div className="mb-3 sm:mb-4">
        <h2 className="font-display text-lg font-semibold text-text-primary sm:text-xl">
          Your reading at a glance
        </h2>

        <p className="mt-1 text-xs text-text-secondary sm:text-sm">
          A summary of your reading activity and library.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 xl:grid-cols-3">
        {METRICS.map((metric) => {
          const Icon = metric.icon
          const value = statistics[metric.key] ?? 0

          return (
            <article
              key={metric.key}
              className="min-w-0 rounded-xl border border-border bg-surface p-3 shadow-sm sm:rounded-2xl sm:p-5"
            >
              <div className="flex min-w-0 items-center justify-between gap-1.5">
                <span className="min-w-0 text-[11px] font-medium leading-snug text-text-secondary sm:text-sm">
                  {metric.label}
                </span>

                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sand/60 text-walnut sm:h-10 sm:w-10 sm:rounded-xl">
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                </span>
              </div>

              <p className="mt-3 break-words font-display text-2xl font-semibold tracking-tight text-text-primary sm:mt-4 sm:text-3xl">
                {metric.format(value)}
              </p>
            </article>
          )
        })}
      </div>

      <div className="mt-3 rounded-xl border border-border bg-surface-secondary/60 px-3 py-2.5 sm:mt-4 sm:px-4 sm:py-3">
        <p className="text-xs leading-relaxed text-text-secondary sm:text-sm">
          Your average is{' '}
          <span className="font-semibold text-text-primary">
            {Number(statistics.averagePagesPerSession || 0).toLocaleString()}{' '}
            pages per session
          </span>{' '}
          across {statistics.sessionCount || 0} recorded reading sessions.
        </p>
      </div>
    </section>
  )
}

export default StatisticsOverview

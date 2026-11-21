import { BookOpen, CalendarDays, Clock3, Flame } from 'lucide-react'

import {
  getCurrentReadingStreak,
  getTotalPagesRead,
  getTotalReadingMinutes,
} from '../../utils/readingUtils'

function formatDuration(minutes) {
  const total = Math.max(0, Math.floor(Number(minutes) || 0))

  if (total < 60) {
    return `${total} min`
  }

  const hours = Math.floor(total / 60)
  const remaining = total % 60

  return remaining > 0 ? `${hours} hr ${remaining} min` : `${hours} hr`
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center gap-2 text-text-muted">
        <Icon className="h-4 w-4" aria-hidden="true" />

        <span className="text-xs font-medium">{label}</span>
      </div>

      <p className="mt-2 font-display text-2xl font-semibold text-text-primary">
        {value}
      </p>
    </div>
  )
}

function ReadingProgress({ sessions = [] }) {
  const safeSessions = Array.isArray(sessions) ? sessions : []

  const pages = getTotalPagesRead(safeSessions)
  const minutes = getTotalReadingMinutes(safeSessions)
  const streak = getCurrentReadingStreak(safeSessions)

  return (
    <section aria-label="Reading activity overview">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Metric
          icon={BookOpen}
          label="Pages read"
          value={pages.toLocaleString()}
        />

        <Metric
          icon={Clock3}
          label="Reading time"
          value={formatDuration(minutes)}
        />

        <Metric
          icon={CalendarDays}
          label="Sessions"
          value={safeSessions.length.toLocaleString()}
        />

        <Metric
          icon={Flame}
          label="Current streak"
          value={`${streak} ${streak === 1 ? 'day' : 'days'}`}
        />
      </div>
    </section>
  )
}

export default ReadingProgress

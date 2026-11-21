import { CalendarDays, BookOpen, FileText, Pencil, Trash2 } from 'lucide-react'

import GoalProgress from './GoalProgress'

import { GOAL_PERIODS, GOAL_TYPES } from '../../utils/constants'

const GOAL_DETAILS = {
  [GOAL_TYPES.BOOKS_COMPLETED]: {
    label: 'Books completed',
    icon: BookOpen,
  },
  [GOAL_TYPES.PAGES_READ]: {
    label: 'Pages read',
    icon: FileText,
  },
  [GOAL_TYPES.READING_DAYS]: {
    label: 'Reading days',
    icon: CalendarDays,
  },
}

function getPeriodLabel(goal) {
  if (goal.period === GOAL_PERIODS.ANNUAL) {
    return `Year ${goal.year}`
  }

  const date = new Date(Number(goal.year), Number(goal.month) - 1, 1)

  return date.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })
}

function GoalCard({ goal, books = [], sessions = [], onEdit, onDelete }) {
  const details = GOAL_DETAILS[goal.type] || GOAL_DETAILS[GOAL_TYPES.PAGES_READ]
  const Icon = details.icon

  return (
    <article className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-secondary text-walnut">
            <Icon className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h3 className="font-display text-lg font-semibold text-text-primary">
              {details.label}
            </h3>

            <p className="mt-1 text-xs text-text-muted">
              {getPeriodLabel(goal)}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit?.(goal)}
            aria-label="Edit goal"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:bg-surface-secondary hover:text-text-primary"
          >
            <Pencil className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => onDelete?.(goal)}
            aria-label="Delete goal"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:bg-danger/10 hover:text-danger"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-6">
        <p className="mb-3 text-xs text-text-muted">
          Target: {Number(goal.target).toLocaleString()}{' '}
          {details.label.toLowerCase()}
        </p>

        <GoalProgress goal={goal} books={books} sessions={sessions} />
      </div>
    </article>
  )
}

export default GoalCard

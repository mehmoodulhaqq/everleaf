import { GOAL_TYPES } from '../../utils/constants'
import { calculateGoalProgress } from '../../utils/goalUtils'

const GOAL_LABELS = {
  [GOAL_TYPES.BOOKS_COMPLETED]: 'books',
  [GOAL_TYPES.PAGES_READ]: 'pages',
  [GOAL_TYPES.READING_DAYS]: 'days',
}

function GoalProgress({ goal, books = [], sessions = [], compact = false }) {
  const progress = calculateGoalProgress(goal, { books, sessions })
  const unit = GOAL_LABELS[goal?.type] || 'items'

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-text-primary">
          {progress.current.toLocaleString()} of{' '}
          {progress.target.toLocaleString()} {unit}
        </p>

        <span className="text-sm font-semibold tabular-nums text-walnut">
          {progress.percentage}%
        </span>
      </div>

      <div
        className="mt-2 h-2.5 overflow-hidden rounded-full bg-surface-secondary"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={progress.target}
        aria-valuenow={Math.min(progress.current, progress.target)}
        aria-label={`${unit} goal progress`}
      >
        <div
          className="h-full rounded-full bg-caramel transition-all duration-300"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>

      {!compact ? (
        <p className="mt-2 text-xs text-text-muted">
          {progress.remaining === 0
            ? 'Goal achieved. Well done!'
            : `${progress.remaining.toLocaleString()} ${unit} remaining`}
        </p>
      ) : null}
    </div>
  )
}

export default GoalProgress

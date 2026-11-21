import { GOAL_PERIODS, GOAL_TYPES } from './constants'
import { parseDate } from './dateUtils'
import { getSessionPagesRead } from './readingUtils'

function isWithinGoalPeriod(value, goal) {
  const date = parseDate(value)

  if (!date) return false

  const yearMatches = date.getFullYear() === Number(goal.year)

  if (!yearMatches) return false

  if (goal.period === GOAL_PERIODS.MONTHLY) {
    return date.getMonth() + 1 === Number(goal.month)
  }

  return true
}

/**
 * Derives goal progress from the underlying books and sessions.
 * It does not store a second copy of progress in Redux.
 */
export function calculateGoalProgress(
  goal,
  { books = [], sessions = [] } = {},
) {
  if (!goal) {
    return { current: 0, target: 1, percentage: 0, remaining: 1 }
  }

  let current = 0

  if (goal.type === GOAL_TYPES.BOOKS_COMPLETED) {
    current = books.filter(
      (book) =>
        book.status === 'completed' &&
        isWithinGoalPeriod(book.dateCompleted, goal),
    ).length
  }

  if (goal.type === GOAL_TYPES.PAGES_READ) {
    current = sessions
      .filter((session) => isWithinGoalPeriod(session.date, goal))
      .reduce((total, session) => total + getSessionPagesRead(session), 0)
  }

  if (goal.type === GOAL_TYPES.READING_DAYS) {
    const dates = new Set(
      sessions
        .filter((session) => isWithinGoalPeriod(session.date, goal))
        .map((session) => {
          const date = parseDate(session.date)

          if (!date) return null

          return [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, '0'),
            String(date.getDate()).padStart(2, '0'),
          ].join('-')
        })
        .filter(Boolean),
    )

    current = dates.size
  }

  const target = Math.max(1, Number(goal.target) || 1)
  const percentage = Math.min(100, Math.round((current / target) * 100))

  return {
    current,
    target,
    percentage,
    remaining: Math.max(0, target - current),
  }
}

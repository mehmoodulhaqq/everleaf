import {
  addDays,
  differenceInCalendarDays,
  parseDate,
  toISODate,
} from './dateUtils'

const toNonNegativeNumber = (value) => {
  const number = Number(value)
  return Number.isFinite(number) ? Math.max(0, number) : 0
}

/**
 * Gets the number of pages recorded for a session.
 * Explicit pagesRead takes priority; page ranges are a fallback.
 */
export const getSessionPagesRead = (session) => {
  if (!session) return 0

  if (session.pagesRead !== undefined && session.pagesRead !== null) {
    return toNonNegativeNumber(session.pagesRead)
  }

  if (session.startPage != null && session.endPage != null) {
    return Math.max(
      0,
      toNonNegativeNumber(session.endPage) -
        toNonNegativeNumber(session.startPage),
    )
  }

  return 0
}

/**
 * Gets the recorded duration of a session in minutes.
 */
export const getSessionDuration = (session) => {
  return toNonNegativeNumber(session?.durationMinutes)
}

/**
 * Returns a copy of sessions belonging to one book.
 */
export const getSessionsForBook = (sessions, bookId) => {
  if (!Array.isArray(sessions) || !bookId) return []

  return sessions.filter((session) => session.bookId === bookId)
}

/**
 * Sorts sessions by date, newest first by default.
 */
export const sortSessionsByDate = (sessions, direction = 'desc') => {
  if (!Array.isArray(sessions)) return []

  const multiplier = direction === 'asc' ? 1 : -1

  return [...sessions].sort((a, b) => {
    return String(a.date || '').localeCompare(String(b.date || '')) * multiplier
  })
}

/**
 * Sums pages recorded in sessions.
 */
export const getTotalPagesRead = (sessions) => {
  if (!Array.isArray(sessions)) return 0

  return sessions.reduce(
    (total, session) => total + getSessionPagesRead(session),
    0,
  )
}

/**
 * Sums reading duration in minutes.
 */
export const getTotalReadingMinutes = (sessions) => {
  if (!Array.isArray(sessions)) return 0

  return sessions.reduce(
    (total, session) => total + getSessionDuration(session),
    0,
  )
}

/**
 * Builds activity records for a consecutive date range ending on endDate.
 * Each item contains date, pagesRead, durationMinutes, and sessionsCount.
 */
export const getDailyReadingActivity = (
  sessions,
  { days = 7, endDate = new Date() } = {},
) => {
  const count = Math.max(1, Math.floor(Number(days) || 7))
  const end = parseDate(endDate)

  if (!end) return []

  const activityByDate = new Map()

  ;(Array.isArray(sessions) ? sessions : []).forEach((session) => {
    const dateKey = toISODate(session.date)
    if (!dateKey) return

    const current = activityByDate.get(dateKey) || {
      date: dateKey,
      pagesRead: 0,
      durationMinutes: 0,
      sessionsCount: 0,
    }

    current.pagesRead += getSessionPagesRead(session)
    current.durationMinutes += getSessionDuration(session)
    current.sessionsCount += 1

    activityByDate.set(dateKey, current)
  })

  const firstDate = addDays(end, -(count - 1))
  if (!firstDate) return []

  return Array.from({ length: count }, (_, index) => {
    const date = addDays(firstDate, index)
    const dateKey = toISODate(date)

    return (
      activityByDate.get(dateKey) || {
        date: dateKey,
        pagesRead: 0,
        durationMinutes: 0,
        sessionsCount: 0,
      }
    )
  })
}

/**
 * Calculates the current consecutive-day reading streak.
 * A session on today or yesterday can keep the streak active.
 */
export const getCurrentReadingStreak = (sessions, today = new Date()) => {
  const todayKey = toISODate(today)
  if (!todayKey) return 0

  const readingDates = new Set(
    (Array.isArray(sessions) ? sessions : [])
      .map((session) => toISODate(session.date))
      .filter(Boolean),
  )

  if (readingDates.size === 0) return 0

  let cursor = parseDate(today)
  if (!cursor) return 0

  if (!readingDates.has(todayKey)) {
    cursor = addDays(cursor, -1)
    if (!cursor || !readingDates.has(toISODate(cursor))) return 0
  }

  let streak = 0

  while (readingDates.has(toISODate(cursor))) {
    streak += 1
    cursor = addDays(cursor, -1)
    if (!cursor) break
  }

  return streak
}

/**
 * Counts distinct calendar days with at least one reading session.
 */
export const getReadingDaysCount = (sessions) => {
  if (!Array.isArray(sessions)) return 0

  return new Set(
    sessions.map((session) => toISODate(session.date)).filter(Boolean),
  ).size
}

/**
 * Returns the calendar-day distance between two supported date values.
 */
export const getReadingDayDistance = (startDate, endDate) => {
  return differenceInCalendarDays(startDate, endDate)
}

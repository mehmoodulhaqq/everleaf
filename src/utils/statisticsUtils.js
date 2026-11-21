import { BOOK_STATUS } from './constants'
import { addDays, getDaysInMonth, parseDate, toISODate } from './dateUtils'
import {
  getCurrentReadingStreak,
  getDailyReadingActivity,
  getSessionDuration,
  getSessionPagesRead,
} from './readingUtils'

const safeArray = (value) => (Array.isArray(value) ? value : [])

const toNonNegativeNumber = (value) => {
  const number = Number(value)
  return Number.isFinite(number) ? Math.max(0, number) : 0
}

const getMonthKey = (date) => {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
  ].join('-')
}

/**
 * Calculates the total pages represented by the user's library progress.
 * Completed books contribute their full page count.
 * Reading and paused books contribute their current progress.
 * Want-to-read books do not contribute.
 */
const getLibraryPagesRead = (books) => {
  return safeArray(books).reduce((total, book) => {
    if (book.status === BOOK_STATUS.COMPLETED) {
      const totalPages = toNonNegativeNumber(book.totalPages)
      const currentPage = toNonNegativeNumber(book.currentPage)

      // Fall back to currentPage if the completed book has no page count.
      return total + (totalPages > 0 ? totalPages : currentPage)
    }

    if (
      book.status === BOOK_STATUS.READING ||
      book.status === BOOK_STATUS.PAUSED
    ) {
      return total + toNonNegativeNumber(book.currentPage)
    }

    return total
  }, 0)
}

/**
 * Calculates high-level reading metrics from books and sessions.
 * The main Pages Read metric comes from library progress.
 * Session-based metrics remain based on actual session records.
 */
export const getOverviewStatistics = (
  books = [],
  sessions = [],
  now = new Date(),
) => {
  const bookList = safeArray(books)
  const sessionList = safeArray(sessions)

  const completedBooks = bookList.filter(
    (book) => book.status === BOOK_STATUS.COMPLETED,
  ).length

  const currentlyReading = bookList.filter(
    (book) => book.status === BOOK_STATUS.READING,
  ).length

  const pagesRead = getLibraryPagesRead(bookList)

  const sessionPagesRead = sessionList.reduce(
    (total, session) => total + getSessionPagesRead(session),
    0,
  )

  const readingMinutes = sessionList.reduce(
    (total, session) => total + getSessionDuration(session),
    0,
  )

  const sessionCount = sessionList.length

  return {
    totalBooks: bookList.length,
    completedBooks,
    currentlyReading,
    wantToRead: bookList.filter(
      (book) => book.status === BOOK_STATUS.WANT_TO_READ,
    ).length,
    pausedBooks: bookList.filter((book) => book.status === BOOK_STATUS.PAUSED)
      .length,
    pagesRead,
    sessionPagesRead,
    readingMinutes,
    readingHours: Math.round((readingMinutes / 60) * 10) / 10,
    sessionCount,
    averagePagesPerSession: sessionCount
      ? Math.round((sessionPagesRead / sessionCount) * 10) / 10
      : 0,
    readingStreak: getCurrentReadingStreak(sessionList, now),
  }
}

/**
 * Calculates genre distribution using books in the personal library.
 */
export const getGenreDistribution = (books = []) => {
  const counts = new Map()

  safeArray(books).forEach((book) => {
    const genre =
      typeof book.genre === 'string' && book.genre.trim()
        ? book.genre.trim()
        : 'Uncategorized'

    counts.set(genre, (counts.get(genre) || 0) + 1)
  })

  return [...counts.entries()]
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count || a.genre.localeCompare(b.genre))
}

/**
 * Returns monthly pages, minutes, and session totals for the last N months.
 * These values are based on actual reading sessions.
 */
export const getMonthlyReadingStatistics = (
  sessions = [],
  { months = 6, endDate = new Date() } = {},
) => {
  const end = parseDate(endDate)
  if (!end) return []

  const count = Math.max(1, Math.floor(Number(months) || 6))
  const firstMonth = new Date(end.getFullYear(), end.getMonth() - count + 1, 1)

  const totals = new Map()

  safeArray(sessions).forEach((session) => {
    const date = parseDate(session.date)
    if (!date) return

    const key = getMonthKey(date)
    const current = totals.get(key) || {
      month: key,
      pagesRead: 0,
      durationMinutes: 0,
      sessionsCount: 0,
    }

    current.pagesRead += getSessionPagesRead(session)
    current.durationMinutes += getSessionDuration(session)
    current.sessionsCount += 1
    totals.set(key, current)
  })

  return Array.from({ length: count }, (_, index) => {
    const date = new Date(
      firstMonth.getFullYear(),
      firstMonth.getMonth() + index,
      1,
    )
    const key = getMonthKey(date)

    return (
      totals.get(key) || {
        month: key,
        pagesRead: 0,
        durationMinutes: 0,
        sessionsCount: 0,
      }
    )
  })
}

/**
 * Creates daily activity data for charting.
 */
export const getReadingActivityStatistics = (
  sessions = [],
  { days = 7, endDate = new Date() } = {},
) => {
  return getDailyReadingActivity(sessions, { days, endDate })
}

/**
 * Calculates the current month's progress against a page target.
 * Only pages recorded in sessions count toward this goal.
 */
export const getMonthlyPageGoalProgress = (
  sessions = [],
  target = 0,
  now = new Date(),
) => {
  const currentDate = parseDate(now)
  if (!currentDate) {
    return { pagesRead: 0, target: 0, remaining: 0, percentage: 0 }
  }

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const pagesRead = safeArray(sessions).reduce((total, session) => {
    const date = parseDate(session.date)

    if (!date || date.getFullYear() !== year || date.getMonth() !== month) {
      return total
    }

    return total + getSessionPagesRead(session)
  }, 0)

  const normalizedTarget = Math.max(0, Number(target) || 0)

  return {
    pagesRead,
    target: normalizedTarget,
    remaining: Math.max(0, normalizedTarget - pagesRead),
    percentage:
      normalizedTarget > 0
        ? Math.min(100, Math.round((pagesRead / normalizedTarget) * 100))
        : 0,
  }
}

/**
 * Returns a compact set of statistics for use by pages and dashboard widgets.
 */
export const calculateReadingStatistics = (
  books = [],
  sessions = [],
  now = new Date(),
) => {
  const overview = getOverviewStatistics(books, sessions, now)
  const activityEnd = parseDate(now) || new Date()

  return {
    ...overview,
    genreDistribution: getGenreDistribution(books),
    weeklyActivity: getReadingActivityStatistics(sessions, {
      days: 7,
      endDate: activityEnd,
    }),
    monthlyProgress: getMonthlyReadingStatistics(sessions, {
      months: 6,
      endDate: activityEnd,
    }),
  }
}

/**
 * Returns a date range for the current calendar month.
 */
export const getCurrentMonthDateRange = (now = new Date()) => {
  const date = parseDate(now)
  if (!date) return null

  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  const end = new Date(
    date.getFullYear(),
    date.getMonth(),
    getDaysInMonth(date.getFullYear(), date.getMonth() + 1),
  )

  return {
    startDate: toISODate(start),
    endDate: toISODate(end),
    nextDay: toISODate(addDays(end, 1)),
  }
}

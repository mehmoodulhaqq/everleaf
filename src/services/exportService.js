import {
  APP_DATA_VERSION,
  APP_NAME,
  BOOK_STATUS,
  DEFAULT_THEME,
  GOAL_PERIODS,
  GOAL_TYPES,
  READING_PREFERENCES,
  THEME_MODES,
  WISHLIST_PRIORITIES,
} from '../utils/constants'

const isRecord = (value) => {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

const isNonEmptyString = (value) => {
  return typeof value === 'string' && value.trim().length > 0
}

const isPositiveInteger = (value) => {
  const number = Number(value)
  return Number.isInteger(number) && number > 0
}

const isNonNegativeNumber = (value) => {
  const number = Number(value)
  return Number.isFinite(number) && number >= 0
}

const validateBooks = (books, errors) => {
  if (!Array.isArray(books)) {
    errors.push('Books must be an array.')
    return []
  }

  return books
    .filter((book, index) => {
      const valid =
        isRecord(book) &&
        isNonEmptyString(book.id) &&
        isNonEmptyString(book.title) &&
        Object.values(BOOK_STATUS).includes(book.status) &&
        isNonNegativeNumber(book.totalPages) &&
        isNonNegativeNumber(book.currentPage)

      if (!valid) {
        errors.push(
          `Book ${index + 1} contains invalid or missing information.`,
        )
      }

      return valid
    })
    .map((book) => ({
      ...book,
      title: book.title.trim(),
      author: isNonEmptyString(book.author)
        ? book.author.trim()
        : 'Unknown author',
      totalPages: Number(book.totalPages),
      currentPage: Math.min(
        Number(book.currentPage),
        Number(book.totalPages) > 0
          ? Number(book.totalPages)
          : Number(book.currentPage),
      ),
    }))
}

const validateSessions = (sessions, errors) => {
  if (!Array.isArray(sessions)) {
    errors.push('Reading sessions must be an array.')
    return []
  }

  return sessions
    .filter((session, index) => {
      const valid =
        isRecord(session) &&
        isNonEmptyString(session.id) &&
        isNonEmptyString(session.bookId) &&
        isNonEmptyString(session.date) &&
        isNonNegativeNumber(session.pagesRead) &&
        isNonNegativeNumber(session.durationMinutes)

      if (!valid) {
        errors.push(
          `Reading session ${index + 1} contains invalid information.`,
        )
      }

      return valid
    })
    .map((session) => ({
      ...session,
      pagesRead: Number(session.pagesRead),
      durationMinutes: Number(session.durationMinutes),
    }))
}

const validateGoals = (goals, errors) => {
  if (!Array.isArray(goals)) {
    errors.push('Reading goals must be an array.')
    return []
  }

  return goals
    .filter((goal, index) => {
      const valid =
        isRecord(goal) &&
        isNonEmptyString(goal.id) &&
        Object.values(GOAL_TYPES).includes(goal.type) &&
        Object.values(GOAL_PERIODS).includes(goal.period) &&
        isPositiveInteger(goal.target) &&
        Number.isInteger(Number(goal.year)) &&
        (goal.period !== GOAL_PERIODS.MONTHLY ||
          (Number.isInteger(Number(goal.month)) &&
            Number(goal.month) >= 1 &&
            Number(goal.month) <= 12))

      if (!valid) {
        errors.push(`Reading goal ${index + 1} contains invalid information.`)
      }

      return valid
    })
    .map((goal) => ({
      ...goal,
      target: Number(goal.target),
      year: Number(goal.year),
      month: goal.period === GOAL_PERIODS.MONTHLY ? Number(goal.month) : null,
    }))
}

const validateWishlist = (items, errors) => {
  if (!Array.isArray(items)) {
    errors.push('Wishlist items must be an array.')
    return []
  }

  return items
    .filter((item, index) => {
      const valid =
        isRecord(item) &&
        isNonEmptyString(item.id) &&
        isNonEmptyString(item.title) &&
        Object.values(WISHLIST_PRIORITIES).includes(item.priority)

      if (!valid) {
        errors.push(`Wishlist item ${index + 1} contains invalid information.`)
      }

      return valid
    })
    .map((item) => ({
      ...item,
      title: item.title.trim(),
      author: isNonEmptyString(item.author)
        ? item.author.trim()
        : 'Unknown author',
    }))
}

const validatePreferences = (preferences, errors) => {
  if (!isRecord(preferences)) {
    errors.push('Reading preferences are missing or invalid.')

    return {
      theme: DEFAULT_THEME,
      reading: {
        defaultDailyPageTarget: READING_PREFERENCES.DEFAULT_DAILY_PAGE_TARGET,
        defaultMonthlyPageTarget:
          READING_PREFERENCES.DEFAULT_MONTHLY_PAGE_TARGET,
        defaultAnnualBookTarget: READING_PREFERENCES.DEFAULT_ANNUAL_BOOK_TARGET,
      },
    }
  }

  const reading = isRecord(preferences.reading) ? preferences.reading : {}

  const validTheme = Object.values(THEME_MODES).includes(preferences.theme)

  const validDailyTarget = isPositiveInteger(reading.defaultDailyPageTarget)

  const validMonthlyTarget = isPositiveInteger(reading.defaultMonthlyPageTarget)

  const validAnnualTarget = isPositiveInteger(reading.defaultAnnualBookTarget)

  if (!validTheme) errors.push('The selected theme is invalid.')
  if (!validDailyTarget) errors.push('The daily page target is invalid.')
  if (!validMonthlyTarget) errors.push('The monthly page target is invalid.')
  if (!validAnnualTarget) errors.push('The annual book target is invalid.')

  return {
    theme: validTheme ? preferences.theme : DEFAULT_THEME,
    reading: {
      defaultDailyPageTarget: validDailyTarget
        ? Number(reading.defaultDailyPageTarget)
        : READING_PREFERENCES.DEFAULT_DAILY_PAGE_TARGET,

      defaultMonthlyPageTarget: validMonthlyTarget
        ? Number(reading.defaultMonthlyPageTarget)
        : READING_PREFERENCES.DEFAULT_MONTHLY_PAGE_TARGET,

      defaultAnnualBookTarget: validAnnualTarget
        ? Number(reading.defaultAnnualBookTarget)
        : READING_PREFERENCES.DEFAULT_ANNUAL_BOOK_TARGET,
    },
  }
}

/**
 * Creates the versioned JSON structure used by Everleaf backups.
 */
export const createExportPayload = (state) => {
  return {
    format: 'everleaf-data',
    appName: APP_NAME,
    version: APP_DATA_VERSION,
    exportedAt: new Date().toISOString(),

    data: {
      books: state.books?.items ?? [],
      sessions: state.sessions?.items ?? [],
      goals: state.goals?.items ?? [],
      wishlist: state.wishlist?.items ?? [],
      preferences: state.preferences ?? {
        theme: DEFAULT_THEME,
        reading: {
          defaultDailyPageTarget: READING_PREFERENCES.DEFAULT_DAILY_PAGE_TARGET,
          defaultMonthlyPageTarget:
            READING_PREFERENCES.DEFAULT_MONTHLY_PAGE_TARGET,
          defaultAnnualBookTarget:
            READING_PREFERENCES.DEFAULT_ANNUAL_BOOK_TARGET,
        },
      },
    },
  }
}

/**
 * Validates an imported Everleaf backup.
 * Invalid records are excluded, and any validation error prevents import.
 */
export const validateImportData = (payload) => {
  const errors = []

  if (!isRecord(payload)) {
    return {
      valid: false,
      errors: ['The selected file does not contain a valid Everleaf backup.'],
      data: null,
    }
  }

  if (payload.format !== 'everleaf-data') {
    errors.push('This file is not an Everleaf data backup.')
  }

  if (payload.appName !== APP_NAME) {
    errors.push('The backup does not belong to Everleaf.')
  }

  if (payload.version !== APP_DATA_VERSION) {
    errors.push(
      `Unsupported backup version. Expected version ${APP_DATA_VERSION}.`,
    )
  }

  if (!isRecord(payload.data)) {
    errors.push('The backup data section is missing or invalid.')

    return {
      valid: false,
      errors,
      data: null,
    }
  }

  const data = {
    books: validateBooks(payload.data.books, errors),
    sessions: validateSessions(payload.data.sessions, errors),
    goals: validateGoals(payload.data.goals, errors),
    wishlist: validateWishlist(payload.data.wishlist, errors),
    preferences: validatePreferences(payload.data.preferences, errors),
  }

  return {
    valid: errors.length === 0,
    errors,
    data: errors.length === 0 ? data : null,
  }
}

/**
 * Downloads the current application state as a JSON backup.
 */
export const downloadExport = (state) => {
  const payload = createExportPayload(state)

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  const date = new Date().toISOString().slice(0, 10)

  link.href = url
  link.download = `everleaf-backup-${date}.json`

  document.body.appendChild(link)
  link.click()
  link.remove()

  URL.revokeObjectURL(url)
}

/**
 * Reads and validates a selected JSON backup file.
 */
export const parseImportFile = async (file) => {
  if (!file) {
    return {
      valid: false,
      errors: ['Please select a backup file.'],
      data: null,
    }
  }

  if (!file.name.toLowerCase().endsWith('.json')) {
    return {
      valid: false,
      errors: ['Please select a JSON backup file.'],
      data: null,
    }
  }

  const maximumFileSize = 10 * 1024 * 1024

  if (file.size > maximumFileSize) {
    return {
      valid: false,
      errors: ['The backup file is larger than the 10 MB limit.'],
      data: null,
    }
  }

  try {
    const text = await file.text()
    const payload = JSON.parse(text)

    return validateImportData(payload)
  } catch {
    return {
      valid: false,
      errors: [
        'The selected file could not be read. It may contain invalid JSON.',
      ],
      data: null,
    }
  }
}

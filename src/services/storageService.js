import {
  APP_DATA_VERSION,
  BOOK_STATUS,
  DEFAULT_THEME,
  GOAL_PERIODS,
  GOAL_TYPES,
  READING_PREFERENCES,
  STORAGE_KEYS,
  THEME_MODES,
  WISHLIST_PRIORITIES,
} from '../utils/constants'

const getStorage = () => {
  if (typeof window === 'undefined') return null

  try {
    return window.localStorage
  } catch {
    return null
  }
}

/**
 * Reads one storage entry while preserving the difference between:
 * - a missing key,
 * - valid JSON (including valid null),
 * - a present key containing malformed JSON.
 */
const readJSON = (storage, key) => {
  try {
    const rawValue = storage.getItem(key)

    if (rawValue === null) {
      return { exists: false, valid: false, value: null }
    }

    try {
      return {
        exists: true,
        valid: true,
        value: JSON.parse(rawValue),
      }
    } catch {
      return { exists: true, valid: false, value: null }
    }
  } catch {
    return { exists: false, valid: false, value: null }
  }
}

const isRecord = (value) => {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

const isNonEmptyString = (value) => {
  return typeof value === 'string' && value.trim().length > 0
}

const filterBooks = (value) => {
  if (!Array.isArray(value)) return []

  return value.filter((book) => {
    return (
      isRecord(book) &&
      isNonEmptyString(book.id) &&
      isNonEmptyString(book.title) &&
      Object.values(BOOK_STATUS).includes(book.status)
    )
  })
}

const filterSessions = (value) => {
  if (!Array.isArray(value)) return []

  return value.filter((session) => {
    return (
      isRecord(session) &&
      isNonEmptyString(session.id) &&
      isNonEmptyString(session.bookId) &&
      isNonEmptyString(session.date)
    )
  })
}

const filterGoals = (value) => {
  if (!Array.isArray(value)) return []

  return value.filter((goal) => {
    return (
      isRecord(goal) &&
      isNonEmptyString(goal.id) &&
      Object.values(GOAL_TYPES).includes(goal.type) &&
      Object.values(GOAL_PERIODS).includes(goal.period) &&
      Number.isInteger(Number(goal.year))
    )
  })
}

const filterWishlist = (value) => {
  if (!Array.isArray(value)) return []

  return value.filter((item) => {
    return (
      isRecord(item) &&
      isNonEmptyString(item.id) &&
      isNonEmptyString(item.title) &&
      Object.values(WISHLIST_PRIORITIES).includes(item.priority)
    )
  })
}

const normalizePositiveInteger = (value, fallback) => {
  const number = Number(value)

  return Number.isFinite(number) ? Math.max(1, Math.floor(number)) : fallback
}

const normalizePreferences = (value) => {
  const defaults = {
    theme: DEFAULT_THEME,
    reading: {
      defaultDailyPageTarget: READING_PREFERENCES.DEFAULT_DAILY_PAGE_TARGET,
      defaultMonthlyPageTarget: READING_PREFERENCES.DEFAULT_MONTHLY_PAGE_TARGET,
      defaultAnnualBookTarget: READING_PREFERENCES.DEFAULT_ANNUAL_BOOK_TARGET,
    },
  }

  if (!isRecord(value)) return defaults

  const reading = isRecord(value.reading) ? value.reading : {}

  return {
    theme: Object.values(THEME_MODES).includes(value.theme)
      ? value.theme
      : DEFAULT_THEME,
    reading: {
      defaultDailyPageTarget: normalizePositiveInteger(
        reading.defaultDailyPageTarget,
        defaults.reading.defaultDailyPageTarget,
      ),
      defaultMonthlyPageTarget: normalizePositiveInteger(
        reading.defaultMonthlyPageTarget,
        defaults.reading.defaultMonthlyPageTarget,
      ),
      defaultAnnualBookTarget: normalizePositiveInteger(
        reading.defaultAnnualBookTarget,
        defaults.reading.defaultAnnualBookTarget,
      ),
    },
  }
}

const clearKeys = (storage) => {
  Object.values(STORAGE_KEYS).forEach((key) => {
    try {
      storage.removeItem(key)
    } catch {
      // Continue clearing the remaining keys if one operation fails.
    }
  })
}

/**
 * Loads and validates the saved application state.
 * A malformed or incompatible version marker invalidates the app-owned
 * saved data, so the known Everleaf keys are cleared rather than mixing
 * unknown data versions. Invalid individual collections safely become
 * empty collections; invalid preferences fall back to approved defaults.
 */
export const loadPersistedState = () => {
  const storage = getStorage()
  if (!storage) return undefined

  const savedVersion = readJSON(storage, STORAGE_KEYS.APP_VERSION)

  if (
    savedVersion.exists &&
    (!savedVersion.valid || savedVersion.value !== APP_DATA_VERSION)
  ) {
    clearKeys(storage)
    return undefined
  }

  const books = readJSON(storage, STORAGE_KEYS.BOOKS)
  const sessions = readJSON(storage, STORAGE_KEYS.SESSIONS)
  const goals = readJSON(storage, STORAGE_KEYS.GOALS)
  const wishlist = readJSON(storage, STORAGE_KEYS.WISHLIST)
  const preferences = readJSON(storage, STORAGE_KEYS.PREFERENCES)

  const savedEntries = [books, sessions, goals, wishlist, preferences]
  const hasSavedData = savedEntries.some((entry) => entry.exists)

  if (!hasSavedData) return undefined

  return {
    books: { items: filterBooks(books.valid ? books.value : null) },
    sessions: { items: filterSessions(sessions.valid ? sessions.value : null) },
    goals: { items: filterGoals(goals.valid ? goals.value : null) },
    wishlist: { items: filterWishlist(wishlist.valid ? wishlist.value : null) },
    preferences: normalizePreferences(
      preferences.valid ? preferences.value : null,
    ),
  }
}

/**
 * Persists each Redux slice under its own approved storage key.
 * Returns false when browser storage is unavailable or a write fails.
 */
export const savePersistedState = (state) => {
  const storage = getStorage()
  if (!storage || !isRecord(state)) return false

  const entries = [
    [STORAGE_KEYS.BOOKS, state.books?.items ?? []],
    [STORAGE_KEYS.SESSIONS, state.sessions?.items ?? []],
    [STORAGE_KEYS.GOALS, state.goals?.items ?? []],
    [STORAGE_KEYS.WISHLIST, state.wishlist?.items ?? []],
    [STORAGE_KEYS.PREFERENCES, state.preferences ?? normalizePreferences()],
  ]

  try {
    entries.forEach(([key, value]) => {
      storage.setItem(key, JSON.stringify(value))
    })

    storage.setItem(STORAGE_KEYS.APP_VERSION, JSON.stringify(APP_DATA_VERSION))

    return true
  } catch {
    return false
  }
}

/**
 * Removes all Everleaf-owned local data without touching unrelated
 * localStorage entries belonging to other websites or applications.
 */
export const clearPersistedState = () => {
  const storage = getStorage()
  if (!storage) return false

  try {
    clearKeys(storage)
    return true
  } catch {
    return false
  }
}

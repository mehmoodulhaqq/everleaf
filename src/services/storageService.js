
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

// Dedicated guest namespace.
// Existing STORAGE_KEYS remain unchanged for compatibility.
const GUEST_STORAGE_KEYS = {
  BOOKS: 'everleaf_guest_books',
  SESSIONS: 'everleaf_guest_sessions',
  GOALS: 'everleaf_guest_goals',
  WISHLIST: 'everleaf_guest_wishlist',
  PREFERENCES: 'everleaf_guest_preferences',
  APP_VERSION: 'everleaf_guest_version',
}

const getStorage = () => {
  if (typeof window === 'undefined') return null

  try {
    return window.localStorage
  } catch {
    return null
  }
}

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

  return Number.isFinite(number)
    ? Math.max(1, Math.floor(number))
    : fallback
}

const normalizePreferences = (value) => {
  const defaults = {
    theme: DEFAULT_THEME,
    reading: {
      defaultDailyPageTarget:
        READING_PREFERENCES.DEFAULT_DAILY_PAGE_TARGET,
      defaultMonthlyPageTarget:
        READING_PREFERENCES.DEFAULT_MONTHLY_PAGE_TARGET,
      defaultAnnualBookTarget:
        READING_PREFERENCES.DEFAULT_ANNUAL_BOOK_TARGET,
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

const clearKeys = (storage, keys) => {
  let succeeded = true

  Object.values(keys).forEach((key) => {
    try {
      storage.removeItem(key)
    } catch {
      succeeded = false
    }
  })

  return succeeded
}

/**
 * Loads guest data only.
 * Authenticated account data must be loaded from Firestore,
 * never from this localStorage namespace.
 */
export const loadPersistedState = (mode = 'guest') => {
  if (mode !== 'guest') return undefined

  const storage = getStorage()
  if (!storage) return undefined

  const savedVersion = readJSON(
    storage,
    GUEST_STORAGE_KEYS.APP_VERSION,
  )

  if (
    savedVersion.exists &&
    (!savedVersion.valid || savedVersion.value !== APP_DATA_VERSION)
  ) {
    clearKeys(storage, GUEST_STORAGE_KEYS)
    return undefined
  }

  const books = readJSON(storage, GUEST_STORAGE_KEYS.BOOKS)
  const sessions = readJSON(storage, GUEST_STORAGE_KEYS.SESSIONS)
  const goals = readJSON(storage, GUEST_STORAGE_KEYS.GOALS)
  const wishlist = readJSON(storage, GUEST_STORAGE_KEYS.WISHLIST)
  const preferences = readJSON(
    storage,
    GUEST_STORAGE_KEYS.PREFERENCES,
  )

  const savedEntries = [
    books,
    sessions,
    goals,
    wishlist,
    preferences,
  ]

  const hasSavedData = savedEntries.some((entry) => entry.exists)

  if (!hasSavedData) return undefined

  return {
    books: {
      items: filterBooks(books.valid ? books.value : null),
    },
    sessions: {
      items: filterSessions(sessions.valid ? sessions.value : null),
    },
    goals: {
      items: filterGoals(goals.valid ? goals.value : null),
    },
    wishlist: {
      items: filterWishlist(wishlist.valid ? wishlist.value : null),
    },
    preferences: normalizePreferences(
      preferences.valid ? preferences.value : null,
    ),
  }
}

/**
 * Saves only guest data.
 * Authenticated data must be persisted through Firestore.
 */
export const savePersistedState = (state, mode = 'guest') => {
  if (mode !== 'guest') return false

  const storage = getStorage()
  if (!storage || !isRecord(state)) return false

  const entries = [
    [GUEST_STORAGE_KEYS.BOOKS, state.books?.items ?? []],
    [GUEST_STORAGE_KEYS.SESSIONS, state.sessions?.items ?? []],
    [GUEST_STORAGE_KEYS.GOALS, state.goals?.items ?? []],
    [GUEST_STORAGE_KEYS.WISHLIST, state.wishlist?.items ?? []],
    [
      GUEST_STORAGE_KEYS.PREFERENCES,
      state.preferences ?? normalizePreferences(),
    ],
  ]

  try {
    entries.forEach(([key, value]) => {
      storage.setItem(key, JSON.stringify(value))
    })

    storage.setItem(
      GUEST_STORAGE_KEYS.APP_VERSION,
      JSON.stringify(APP_DATA_VERSION),
    )

    return true
  } catch {
    return false
  }
}

/**
 * Clears guest data only.
 * It never removes authenticated Firestore data or unrelated
 * localStorage entries.
 */
export const clearPersistedState = (mode = 'guest') => {
  if (mode !== 'guest') return false

  const storage = getStorage()
  if (!storage) return false

  return clearKeys(storage, GUEST_STORAGE_KEYS)
}

// Expose guest keys for migration and other storage operations.
export { GUEST_STORAGE_KEYS }

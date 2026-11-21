/* =========================================================
   EVERLEAF — SHARED APPLICATION CONSTANTS
   A little growth with every page.
   ========================================================= */

/* BOOKS */
export const BOOK_STATUS = {
  WANT_TO_READ: 'want-to-read',
  READING: 'reading',
  COMPLETED: 'completed',
  PAUSED: 'paused',
}

export const BOOK_STATUS_OPTIONS = [
  { value: BOOK_STATUS.WANT_TO_READ, label: 'Want to Read' },
  { value: BOOK_STATUS.READING, label: 'Reading' },
  { value: BOOK_STATUS.COMPLETED, label: 'Completed' },
  { value: BOOK_STATUS.PAUSED, label: 'Paused' },
]

export const DEFAULT_BOOK_STATUS = BOOK_STATUS.WANT_TO_READ

export const BOOK_SORT_OPTIONS = [
  { value: 'title', label: 'Title' },
  { value: 'author', label: 'Author' },
  { value: 'dateAdded', label: 'Date Added' },
  { value: 'rating', label: 'Rating' },
  { value: 'progress', label: 'Progress' },
]

export const BOOK_VIEW_MODES = {
  GRID: 'grid',
  LIST: 'list',
}

/* READING GOALS */
export const GOAL_TYPES = {
  BOOKS_COMPLETED: 'books-completed',
  PAGES_READ: 'pages-read',
  READING_DAYS: 'reading-days',
}

export const GOAL_PERIODS = {
  MONTHLY: 'monthly',
  ANNUAL: 'annual',
}

export const GOAL_TYPE_OPTIONS = [
  { value: GOAL_TYPES.BOOKS_COMPLETED, label: 'Books Completed' },
  { value: GOAL_TYPES.PAGES_READ, label: 'Pages Read' },
  { value: GOAL_TYPES.READING_DAYS, label: 'Reading Days' },
]

export const GOAL_PERIOD_OPTIONS = [
  { value: GOAL_PERIODS.MONTHLY, label: 'Monthly' },
  { value: GOAL_PERIODS.ANNUAL, label: 'Annual' },
]

/* WISHLIST */
export const WISHLIST_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
}

export const WISHLIST_PRIORITY_OPTIONS = [
  { value: WISHLIST_PRIORITIES.LOW, label: 'Low' },
  { value: WISHLIST_PRIORITIES.MEDIUM, label: 'Medium' },
  { value: WISHLIST_PRIORITIES.HIGH, label: 'High' },
]

export const DEFAULT_WISHLIST_PRIORITY = WISHLIST_PRIORITIES.MEDIUM

/* PREFERENCES */
export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
}

export const DEFAULT_THEME = THEME_MODES.LIGHT

export const READING_PREFERENCES = {
  DEFAULT_DAILY_PAGE_TARGET: 20,
  DEFAULT_MONTHLY_PAGE_TARGET: 300,
  DEFAULT_ANNUAL_BOOK_TARGET: 12,
}

/* LOCAL STORAGE */
export const STORAGE_KEYS = {
  BOOKS: 'everleaf_books',
  SESSIONS: 'everleaf_sessions',
  GOALS: 'everleaf_goals',
  WISHLIST: 'everleaf_wishlist',
  PREFERENCES: 'everleaf_preferences',
  APP_VERSION: 'everleaf_version',
}

export const APP_DATA_VERSION = 1

/* GENERAL APPLICATION VALUES */
export const APP_NAME = 'Everleaf'
export const APP_TAGLINE = 'A little growth with every page.'
export const DEFAULT_RATING = null
export const MIN_BOOK_PAGES = 1
export const MAX_BOOK_RATING = 5
export const MIN_BOOK_RATING = 1
export const DEFAULT_BOOK_PROGRESS = 0
export const DEFAULT_SESSION_DURATION = 0
export const DEFAULT_GOAL_TARGET = 1

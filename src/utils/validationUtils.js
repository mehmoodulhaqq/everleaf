import {
  BOOK_STATUS,
  GOAL_PERIODS,
  GOAL_TYPES,
  WISHLIST_PRIORITIES,
} from './constants'

const isPlainObject = (value) => {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export const isNonEmptyString = (value) => {
  return typeof value === 'string' && value.trim().length > 0
}

export const isNonNegativeNumber = (value) => {
  const number = Number(value)
  return (
    value !== '' && value !== null && Number.isFinite(number) && number >= 0
  )
}

export const isPositiveNumber = (value) => {
  const number = Number(value)
  return value !== '' && value !== null && Number.isFinite(number) && number > 0
}

export const isPositiveInteger = (value) => {
  return isPositiveNumber(value) && Number.isInteger(Number(value))
}

export const isNonNegativeInteger = (value) => {
  return isNonNegativeNumber(value) && Number.isInteger(Number(value))
}

export const isValidDateValue = (value) => {
  if (value instanceof Date) return !Number.isNaN(value.getTime())
  if (typeof value !== 'string' && typeof value !== 'number') return false
  if (value === '') return false

  return !Number.isNaN(new Date(value).getTime())
}

const result = (errors) => ({
  isValid: Object.keys(errors).length === 0,
  errors,
})

/**
 * Validates the core fields used when creating or editing a local book.
 */
export const validateBook = (book) => {
  const errors = {}

  if (!isPlainObject(book)) {
    return result({ form: 'Book information is required.' })
  }

  if (!isNonEmptyString(book.title)) {
    errors.title = 'Enter a book title.'
  }

  if (book.totalPages !== undefined && book.totalPages !== '') {
    if (!isPositiveInteger(book.totalPages)) {
      errors.totalPages = 'Total pages must be a positive whole number.'
    }
  }

  if (book.currentPage !== undefined && book.currentPage !== '') {
    if (!isNonNegativeInteger(book.currentPage)) {
      errors.currentPage =
        'Current page must be a whole number of zero or greater.'
    } else if (
      Number.isFinite(Number(book.totalPages)) &&
      Number(book.totalPages) > 0 &&
      Number(book.currentPage) > Number(book.totalPages)
    ) {
      errors.currentPage = 'Current page cannot exceed total pages.'
    }
  }

  if (book.status && !Object.values(BOOK_STATUS).includes(book.status)) {
    errors.status = 'Choose a valid reading status.'
  }

  if (book.rating !== undefined && book.rating !== null && book.rating !== '') {
    const rating = Number(book.rating)

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      errors.rating = 'Rating must be between 1 and 5.'
    }
  }

  return result(errors)
}

/**
 * Validates a reading session.
 * A session may provide pagesRead directly or provide both startPage and
 * endPage. When both representations are supplied, each is validated.
 */
export const validateReadingSession = (session) => {
  const errors = {}

  if (!isPlainObject(session)) {
    return result({ form: 'Reading session information is required.' })
  }

  if (!isNonEmptyString(session.bookId)) {
    errors.bookId = 'Select a book for this session.'
  }

  if (!isValidDateValue(session.date)) {
    errors.date = 'Choose a valid reading date.'
  }

  const hasPagesRead =
    session.pagesRead !== undefined &&
    session.pagesRead !== null &&
    session.pagesRead !== ''

  const hasStartPage =
    session.startPage !== undefined && session.startPage !== null

  const hasEndPage = session.endPage !== undefined && session.endPage !== null

  const hasCompletePageRange = hasStartPage && hasEndPage

  if (!hasPagesRead && !hasCompletePageRange) {
    errors.pagesRead =
      'Enter pages read or provide both the start and end pages.'
  }

  if (hasPagesRead && !isNonNegativeInteger(session.pagesRead)) {
    errors.pagesRead = 'Pages read must be a whole number of zero or more.'
  }

  if (hasStartPage !== hasEndPage) {
    errors.pageRange = 'Provide both the start page and end page.'
  }

  if (hasStartPage && !isNonNegativeInteger(session.startPage)) {
    errors.startPage = 'Start page must be a whole number of zero or greater.'
  }

  if (hasEndPage && !isNonNegativeInteger(session.endPage)) {
    errors.endPage = 'End page must be a whole number of zero or greater.'
  }

  if (
    hasCompletePageRange &&
    isNonNegativeInteger(session.startPage) &&
    isNonNegativeInteger(session.endPage) &&
    Number(session.endPage) < Number(session.startPage)
  ) {
    errors.endPage = 'End page cannot be before start page.'
  }

  if (
    session.durationMinutes !== undefined &&
    session.durationMinutes !== '' &&
    !isNonNegativeNumber(session.durationMinutes)
  ) {
    errors.durationMinutes = 'Duration cannot be negative.'
  }

  return result(errors)
}

/**
 * Validates a monthly or annual reading goal.
 */
export const validateGoal = (goal) => {
  const errors = {}

  if (!isPlainObject(goal)) {
    return result({ form: 'Goal information is required.' })
  }

  if (!Object.values(GOAL_TYPES).includes(goal.type)) {
    errors.type = 'Choose a valid goal type.'
  }

  if (!Object.values(GOAL_PERIODS).includes(goal.period)) {
    errors.period = 'Choose a monthly or annual period.'
  }

  if (!isPositiveNumber(goal.target)) {
    errors.target = 'Goal target must be greater than zero.'
  }

  const year = Number(goal.year)
  if (!Number.isInteger(year) || year < 1900 || year > 9999) {
    errors.year = 'Enter a valid year.'
  }

  if (goal.period === GOAL_PERIODS.MONTHLY) {
    const month = Number(goal.month)

    if (!Number.isInteger(month) || month < 1 || month > 12) {
      errors.month = 'Choose a valid month.'
    }
  }

  return result(errors)
}

/**
 * Validates an item before adding it to the wishlist.
 */
export const validateWishlistItem = (item) => {
  const errors = {}

  if (!isPlainObject(item)) {
    return result({ form: 'Wishlist information is required.' })
  }

  if (!isNonEmptyString(item.title)) {
    errors.title = 'Enter a book title.'
  }

  if (
    item.priority &&
    !Object.values(WISHLIST_PRIORITIES).includes(item.priority)
  ) {
    errors.priority = 'Choose a valid priority.'
  }

  return result(errors)
}

/**
 * Runs several validators and combines their field errors.
 */
export const validateWith = (validators, value) => {
  const errors = {}

  ;(Array.isArray(validators) ? validators : []).forEach((validator) => {
    if (typeof validator !== 'function') return

    const validation = validator(value)

    if (validation?.errors && typeof validation.errors === 'object') {
      Object.assign(errors, validation.errors)
    }
  })

  return result(errors)
}

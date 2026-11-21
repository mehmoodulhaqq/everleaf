/**
 * EVERLEAF — BOOK SERVICE
 *
 * Pure book-data helpers shared by feature pages.
 * Redux remains the source of truth: this service does not read storage,
 * dispatch actions, generate IDs, or access the current date by itself.
 */

import { BOOK_STATUS, DEFAULT_BOOK_STATUS } from '../utils/constants'

const asText = (value, fallback = '') =>
  typeof value === 'string' ? value.trim() : fallback

const asNonNegativeInteger = (value, fallback = 0) => {
  const number = Number(value)
  return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : fallback
}

const asRating = (value) => {
  if (value === '' || value === null || value === undefined) return null
  const rating = Number(value)
  return Number.isFinite(rating) && rating >= 1 && rating <= 5 ? rating : null
}

const VALID_STATUSES = Object.values(BOOK_STATUS)

/**
 * Produces a complete, normalized record for booksSlice.addBook.
 * The caller supplies the ID and timestamp so the helper stays deterministic.
 */
export const createBookRecord = (values, { id, now } = {}) => {
  if (!id) throw new Error('A unique book ID is required.')
  if (!now) throw new Error('A creation timestamp is required.')

  const status = VALID_STATUSES.includes(values?.status)
    ? values.status
    : DEFAULT_BOOK_STATUS

  const totalPages = asNonNegativeInteger(values?.totalPages)
  const requestedPage = asNonNegativeInteger(values?.currentPage)
  const currentPage =
    status === BOOK_STATUS.COMPLETED && totalPages > 0
      ? totalPages
      : Math.min(requestedPage, totalPages || requestedPage)

  return {
    id,
    title: asText(values?.title),
    author: asText(values?.author, 'Unknown author') || 'Unknown author',
    genre: asText(values?.genre, 'Uncategorized') || 'Uncategorized',
    description: asText(values?.description),
    totalPages,
    currentPage,
    status,
    rating: asRating(values?.rating),
    review: asText(values?.review),
    coverUrl: asText(values?.coverUrl),
    dateAdded: now,
    dateStarted: status === BOOK_STATUS.READING ? now : null,
    dateCompleted: status === BOOK_STATUS.COMPLETED ? now : null,
    notes: asText(values?.notes),
    quotes: [],
  }
}

/**
 * Supplies stable, complete values to BookForm. This prevents missing
 * optional fields on imported/API records from becoming undefined form values.
 */
export const getBookFormValues = (book) => ({
  title: asText(book?.title),
  author: asText(book?.author),
  genre: asText(book?.genre),
  description: asText(book?.description),
  totalPages: asNonNegativeInteger(book?.totalPages),
  currentPage: asNonNegativeInteger(book?.currentPage),
  status: VALID_STATUSES.includes(book?.status)
    ? book.status
    : DEFAULT_BOOK_STATUS,
  rating: asRating(book?.rating),
  review: asText(book?.review),
  coverUrl: asText(book?.coverUrl),
  notes: asText(book?.notes),
})

/**
 * Creates an allowed-field update for booksSlice.updateBook.
 * Existing creation dates and quote records are preserved.
 */
export const prepareBookUpdate = (existingBook, values, now) => {
  if (!existingBook?.id) throw new Error('An existing book is required.')
  if (!now) throw new Error('An update timestamp is required.')

  const status = VALID_STATUSES.includes(values?.status)
    ? values.status
    : existingBook.status

  const totalPages = asNonNegativeInteger(values?.totalPages)
  const requestedPage = asNonNegativeInteger(values?.currentPage)
  const currentPage =
    status === BOOK_STATUS.COMPLETED && totalPages > 0
      ? totalPages
      : Math.min(requestedPage, totalPages || requestedPage)

  const changes = {
    title: asText(values?.title),
    author: asText(values?.author, 'Unknown author') || 'Unknown author',
    genre: asText(values?.genre, 'Uncategorized') || 'Uncategorized',
    description: asText(values?.description),
    totalPages,
    currentPage,
    status,
    rating: asRating(values?.rating),
    review: asText(values?.review),
    coverUrl: asText(values?.coverUrl),
    notes: asText(values?.notes),
  }

  if (status === BOOK_STATUS.READING && !existingBook.dateStarted) {
    changes.dateStarted = now
  }

  if (status === BOOK_STATUS.COMPLETED) {
    changes.dateCompleted = existingBook.dateCompleted || now
  } else {
    changes.dateCompleted = null
  }

  return changes
}

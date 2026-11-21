import { BOOK_STATUS, BOOK_STATUS_OPTIONS } from './constants'

const toNumber = (value, fallback = 0) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

const normalizeText = (value) => {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

/**
 * Returns a safe reading-progress percentage between 0 and 100.
 */
export const getBookProgress = (book) => {
  if (!book) return 0

  const totalPages = toNumber(book.totalPages)
  const currentPage = toNumber(book.currentPage)

  if (totalPages <= 0) return 0

  return Math.min(100, Math.max(0, (currentPage / totalPages) * 100))
}

/**
 * Returns a rounded progress percentage suitable for display.
 */
export const getBookProgressPercentage = (book) => {
  return Math.round(getBookProgress(book))
}

/**
 * Returns the display label for a book status.
 */
export const getBookStatusLabel = (status) => {
  return (
    BOOK_STATUS_OPTIONS.find((option) => option.value === status)?.label ||
    'Want to Read'
  )
}

/**
 * Finds a book by its local application ID.
 */
export const getBookById = (books, bookId) => {
  if (!Array.isArray(books) || !bookId) return null

  return books.find((book) => book.id === bookId) || null
}

/**
 * Searches books by title, author, or genre.
 */
export const searchBooks = (books, query) => {
  if (!Array.isArray(books)) return []

  const searchTerm = normalizeText(query)
  if (!searchTerm) return [...books]

  return books.filter((book) => {
    return [book.title, book.author, book.genre].some((value) =>
      normalizeText(value).includes(searchTerm),
    )
  })
}

/**
 * Filters books using optional status, genre, and text criteria.
 * Omitted or empty criteria do not restrict the result.
 */
export const filterBooks = (
  books,
  { query = '', status = 'all', genre = 'all' } = {},
) => {
  if (!Array.isArray(books)) return []

  const searchTerm = normalizeText(query)
  const selectedGenre = normalizeText(genre)

  return books.filter((book) => {
    const matchesQuery =
      !searchTerm ||
      [book.title, book.author, book.genre].some((value) =>
        normalizeText(value).includes(searchTerm),
      )

    const matchesStatus = !status || status === 'all' || book.status === status

    const matchesGenre =
      !selectedGenre ||
      selectedGenre === 'all' ||
      normalizeText(book.genre) === selectedGenre

    return matchesQuery && matchesStatus && matchesGenre
  })
}

/**
 * Returns a sorted copy of the supplied book list.
 * Supported fields: title, author, dateAdded, rating, and progress.
 */
export const sortBooks = (books, sortBy = 'dateAdded', direction = 'asc') => {
  if (!Array.isArray(books)) return []

  const multiplier = direction === 'desc' ? -1 : 1

  return [...books].sort((first, second) => {
    let comparison

    switch (sortBy) {
      case 'title':
        comparison = normalizeText(first.title).localeCompare(
          normalizeText(second.title),
        )
        break

      case 'author':
        comparison = normalizeText(first.author).localeCompare(
          normalizeText(second.author),
        )
        break

      case 'rating':
        comparison = toNumber(first.rating, -1) - toNumber(second.rating, -1)
        break

      case 'progress':
        comparison = getBookProgress(first) - getBookProgress(second)
        break

      case 'dateAdded':
      default:
        comparison = String(first.dateAdded || '').localeCompare(
          String(second.dateAdded || ''),
        )
        break
    }

    return comparison * multiplier
  })
}

/**
 * Returns unique, non-empty genres from a collection of books.
 */
export const getBookGenres = (books) => {
  if (!Array.isArray(books)) return []

  return [
    ...new Set(
      books
        .map((book) =>
          typeof book.genre === 'string' ? book.genre.trim() : '',
        )
        .filter(Boolean),
    ),
  ].sort((a, b) => a.localeCompare(b))
}

/**
 * Groups books by their current reading status.
 */
export const groupBooksByStatus = (books) => {
  const collection = Array.isArray(books) ? books : []

  return {
    [BOOK_STATUS.WANT_TO_READ]: collection.filter(
      (book) => book.status === BOOK_STATUS.WANT_TO_READ,
    ),
    [BOOK_STATUS.READING]: collection.filter(
      (book) => book.status === BOOK_STATUS.READING,
    ),
    [BOOK_STATUS.COMPLETED]: collection.filter(
      (book) => book.status === BOOK_STATUS.COMPLETED,
    ),
    [BOOK_STATUS.PAUSED]: collection.filter(
      (book) => book.status === BOOK_STATUS.PAUSED,
    ),
  }
}

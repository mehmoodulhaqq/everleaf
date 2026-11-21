import { createSlice } from '@reduxjs/toolkit'

import {
  BOOK_STATUS,
  DEFAULT_BOOK_STATUS,
  DEFAULT_BOOK_PROGRESS,
  MAX_BOOK_RATING,
  MIN_BOOK_RATING,
} from '../../utils/constants'

const initialState = {
  items: [],
}

const VALID_BOOK_STATUSES = Object.values(BOOK_STATUS)

const toNonNegativeNumber = (value, fallback = 0) => {
  const number = Number(value)
  return Number.isFinite(number) ? Math.max(0, number) : fallback
}

const normalizeRating = (value) => {
  if (value === null || value === '') return null

  const rating = Number(value)

  if (
    !Number.isFinite(rating) ||
    rating < MIN_BOOK_RATING ||
    rating > MAX_BOOK_RATING
  ) {
    return null
  }

  return rating
}

const booksSlice = createSlice({
  name: 'books',
  initialState,

  reducers: {
    addBook: (state, action) => {
      const book = action.payload

      if (!book?.id || typeof book.title !== 'string' || !book.title.trim()) {
        return
      }

      if (state.items.some((item) => item.id === book.id)) return

      const totalPages = toNonNegativeNumber(book.totalPages)
      const requestedPage = toNonNegativeNumber(
        book.currentPage,
        DEFAULT_BOOK_PROGRESS,
      )
      const currentPage =
        totalPages > 0 ? Math.min(requestedPage, totalPages) : requestedPage

      state.items.push({
        id: book.id,
        title: book.title.trim(),
        author:
          typeof book.author === 'string' && book.author.trim()
            ? book.author.trim()
            : 'Unknown author',
        genre: book.genre || 'Uncategorized',
        description: book.description || '',
        totalPages,
        currentPage,
        status: VALID_BOOK_STATUSES.includes(book.status)
          ? book.status
          : DEFAULT_BOOK_STATUS,
        rating: normalizeRating(book.rating),
        review: book.review || '',
        coverUrl: book.coverUrl || '',
        dateAdded: book.dateAdded ?? null,
        dateStarted: book.dateStarted ?? null,
        dateCompleted: book.dateCompleted ?? null,
        notes: book.notes || '',
        quotes: Array.isArray(book.quotes) ? book.quotes : [],
      })
    },

    updateBook: (state, action) => {
      const { id, changes } = action.payload || {}

      if (!id || !changes || typeof changes !== 'object') return

      const book = state.items.find((item) => item.id === id)
      if (!book) return

      const allowedFields = [
        'title',
        'author',
        'genre',
        'description',
        'totalPages',
        'currentPage',
        'status',
        'rating',
        'review',
        'coverUrl',
        'dateAdded',
        'dateStarted',
        'dateCompleted',
        'notes',
        'quotes',
      ]

      const updatedChanges = {}

      allowedFields.forEach((field) => {
        if (Object.prototype.hasOwnProperty.call(changes, field)) {
          updatedChanges[field] = changes[field]
        }
      })

      if (typeof updatedChanges.title === 'string') {
        const title = updatedChanges.title.trim()
        if (title) updatedChanges.title = title
        else delete updatedChanges.title
      }

      if (typeof updatedChanges.author === 'string') {
        updatedChanges.author = updatedChanges.author.trim() || 'Unknown author'
      }

      if (updatedChanges.status !== undefined) {
        if (!VALID_BOOK_STATUSES.includes(updatedChanges.status)) {
          delete updatedChanges.status
        }
      }

      if (updatedChanges.rating !== undefined) {
        updatedChanges.rating = normalizeRating(updatedChanges.rating)
      }

      const nextTotalPages =
        updatedChanges.totalPages !== undefined
          ? toNonNegativeNumber(updatedChanges.totalPages)
          : book.totalPages

      const requestedPage =
        updatedChanges.currentPage !== undefined
          ? toNonNegativeNumber(updatedChanges.currentPage)
          : book.currentPage

      if (
        updatedChanges.totalPages !== undefined ||
        updatedChanges.currentPage !== undefined
      ) {
        updatedChanges.totalPages = nextTotalPages
        updatedChanges.currentPage =
          nextTotalPages > 0
            ? Math.min(requestedPage, nextTotalPages)
            : requestedPage
      }

      Object.assign(book, updatedChanges)
    },

    deleteBook: (state, action) => {
      state.items = state.items.filter((book) => book.id !== action.payload)
    },

    setBookStatus: (state, action) => {
      const { id, status, updatedAt } = action.payload || {}

      if (!id || !VALID_BOOK_STATUSES.includes(status)) return

      const book = state.items.find((item) => item.id === id)
      if (!book) return

      book.status = status

      if (status === BOOK_STATUS.READING && !book.dateStarted && updatedAt) {
        book.dateStarted = updatedAt
      }

      if (status === BOOK_STATUS.COMPLETED) {
        if (book.totalPages > 0) book.currentPage = book.totalPages
        if (updatedAt) book.dateCompleted = updatedAt
      } else {
        book.dateCompleted = null
      }
    },

    /* Manual progress changes never create reading-session records. */
    setBookProgress: (state, action) => {
      const { id, currentPage, updatedAt } = action.payload || {}

      if (!id || currentPage === undefined) return

      const book = state.items.find((item) => item.id === id)
      if (!book) return

      const requestedPage = toNonNegativeNumber(currentPage)

      book.currentPage =
        book.totalPages > 0
          ? Math.min(requestedPage, book.totalPages)
          : requestedPage

      if (book.totalPages > 0 && book.currentPage >= book.totalPages) {
        book.status = BOOK_STATUS.COMPLETED
        if (updatedAt) book.dateCompleted = updatedAt
      } else if (book.status === BOOK_STATUS.COMPLETED) {
        book.status = BOOK_STATUS.READING
        book.dateCompleted = null
      }
    },

    updateBookNotes: (state, action) => {
      const { id, notes } = action.payload || {}
      const book = state.items.find((item) => item.id === id)

      if (book) book.notes = typeof notes === 'string' ? notes : ''
    },

    addBookQuote: (state, action) => {
      const { id, quote } = action.payload || {}
      const book = state.items.find((item) => item.id === id)

      if (
        !book ||
        !quote?.id ||
        typeof quote.text !== 'string' ||
        !quote.text.trim()
      ) {
        return
      }

      if (book.quotes.some((item) => item.id === quote.id)) return

      book.quotes.push({
        id: quote.id,
        text: quote.text.trim(),
        page: quote.page ?? null,
        createdAt: quote.createdAt ?? null,
      })
    },

    deleteBookQuote: (state, action) => {
      const { bookId, quoteId } = action.payload || {}
      const book = state.items.find((item) => item.id === bookId)

      if (!book) return

      book.quotes = book.quotes.filter((quote) => quote.id !== quoteId)
    },

    clearBooks: (state) => {
      state.items = []
    },

    setBooks: (state, action) => {
      state.items = Array.isArray(action.payload) ? action.payload : []
    },
  },
})

export const {
  addBook,
  updateBook,
  deleteBook,
  setBookStatus,
  setBookProgress,
  updateBookNotes,
  addBookQuote,
  deleteBookQuote,
  clearBooks,
  setBooks,
} = booksSlice.actions

export default booksSlice.reducer

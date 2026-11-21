import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [],
}

const toNonNegativeInteger = (value, fallback = 0) => {
  const number = Number(value)

  return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : fallback
}

const toNonNegativeNumber = (value, fallback = 0) => {
  const number = Number(value)

  return Number.isFinite(number) ? Math.max(0, number) : fallback
}

const hasValue = (value) =>
  value !== undefined && value !== null && value !== ''

const getPagesRead = (session) => {
  // An explicitly supplied pagesRead value takes priority over a page range.
  if (hasValue(session.pagesRead)) {
    return toNonNegativeInteger(session.pagesRead)
  }

  if (session.startPage != null && session.endPage != null) {
    return Math.max(
      0,
      toNonNegativeInteger(session.endPage) -
        toNonNegativeInteger(session.startPage),
    )
  }

  return 0
}

const sessionsSlice = createSlice({
  name: 'sessions',
  initialState,

  reducers: {
    addSession: (state, action) => {
      const session = action.payload

      if (
        !session?.id ||
        !session?.bookId ||
        typeof session.date !== 'string' ||
        !session.date.trim()
      ) {
        return
      }

      if (state.items.some((item) => item.id === session.id)) return

      const startPage =
        session.startPage == null
          ? null
          : toNonNegativeInteger(session.startPage)

      const endPage =
        session.endPage == null ? null : toNonNegativeInteger(session.endPage)

      state.items.push({
        id: session.id,
        bookId: session.bookId,
        date: session.date.trim(),
        pagesRead: getPagesRead({
          ...session,
          startPage,
          endPage,
        }),
        durationMinutes: toNonNegativeNumber(session.durationMinutes),
        startPage,
        endPage,
        note: typeof session.note === 'string' ? session.note : '',
        createdAt: session.createdAt ?? null,
      })
    },

    updateSession: (state, action) => {
      const { id, changes } = action.payload || {}

      if (!id || !changes || typeof changes !== 'object') return

      const session = state.items.find((item) => item.id === id)
      if (!session) return

      const allowedFields = [
        'date',
        'pagesRead',
        'durationMinutes',
        'startPage',
        'endPage',
        'note',
      ]

      const updatedChanges = {}

      allowedFields.forEach((field) => {
        if (Object.prototype.hasOwnProperty.call(changes, field)) {
          updatedChanges[field] = changes[field]
        }
      })

      if (updatedChanges.date !== undefined) {
        if (
          typeof updatedChanges.date === 'string' &&
          updatedChanges.date.trim()
        ) {
          updatedChanges.date = updatedChanges.date.trim()
        } else {
          delete updatedChanges.date
        }
      }

      if (updatedChanges.pagesRead !== undefined) {
        updatedChanges.pagesRead = toNonNegativeInteger(
          updatedChanges.pagesRead,
        )
      }

      if (updatedChanges.durationMinutes !== undefined) {
        updatedChanges.durationMinutes = toNonNegativeNumber(
          updatedChanges.durationMinutes,
        )
      }

      ;['startPage', 'endPage'].forEach((field) => {
        if (updatedChanges[field] !== undefined) {
          updatedChanges[field] =
            updatedChanges[field] == null
              ? null
              : toNonNegativeInteger(updatedChanges[field])
        }
      })

      if (updatedChanges.note !== undefined) {
        updatedChanges.note =
          typeof updatedChanges.note === 'string' ? updatedChanges.note : ''
      }

      const pageRangeChanged =
        Object.prototype.hasOwnProperty.call(updatedChanges, 'startPage') ||
        Object.prototype.hasOwnProperty.call(updatedChanges, 'endPage')

      // If pagesRead is supplied in this update, it is authoritative.
      // Otherwise, changing the page range recalculates pagesRead.
      if (
        pageRangeChanged &&
        !Object.prototype.hasOwnProperty.call(updatedChanges, 'pagesRead')
      ) {
        const nextStartPage =
          updatedChanges.startPage !== undefined
            ? updatedChanges.startPage
            : session.startPage

        const nextEndPage =
          updatedChanges.endPage !== undefined
            ? updatedChanges.endPage
            : session.endPage

        updatedChanges.pagesRead =
          nextStartPage != null && nextEndPage != null
            ? Math.max(
                0,
                toNonNegativeInteger(nextEndPage) -
                  toNonNegativeInteger(nextStartPage),
              )
            : 0
      }

      Object.assign(session, updatedChanges)
    },

    deleteSession: (state, action) => {
      state.items = state.items.filter(
        (session) => session.id !== action.payload,
      )
    },

    deleteSessionsByBookId: (state, action) => {
      state.items = state.items.filter(
        (session) => session.bookId !== action.payload,
      )
    },

    clearSessions: (state) => {
      state.items = []
    },

    setSessions: (state, action) => {
      state.items = Array.isArray(action.payload) ? action.payload : []
    },
  },
})

export const {
  addSession,
  updateSession,
  deleteSession,
  deleteSessionsByBookId,
  clearSessions,
  setSessions,
} = sessionsSlice.actions

export default sessionsSlice.reducer

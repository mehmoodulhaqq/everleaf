import { createSlice } from '@reduxjs/toolkit'

import {
  DEFAULT_WISHLIST_PRIORITY,
  WISHLIST_PRIORITIES,
} from '../../utils/constants'

const initialState = {
  items: [],
}

const VALID_PRIORITIES = Object.values(WISHLIST_PRIORITIES)

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,

  reducers: {
    addToWishlist: (state, action) => {
      const item = action.payload

      if (!item?.id || typeof item.title !== 'string' || !item.title.trim()) {
        return
      }

      if (state.items.some((entry) => entry.id === item.id)) return

      state.items.push({
        id: item.id,
        title: item.title.trim(),
        author:
          typeof item.author === 'string' && item.author.trim()
            ? item.author.trim()
            : 'Unknown author',
        priority: VALID_PRIORITIES.includes(item.priority)
          ? item.priority
          : DEFAULT_WISHLIST_PRIORITY,
        note: typeof item.note === 'string' ? item.note : '',
        coverUrl: item.coverUrl || '',
        externalId: item.externalId || null,
        dateAdded: item.dateAdded ?? null,
      })
    },

    updateWishlistItem: (state, action) => {
      const { id, changes } = action.payload || {}

      if (!id || !changes || typeof changes !== 'object') return

      const item = state.items.find((entry) => entry.id === id)
      if (!item) return

      const allowedFields = [
        'title',
        'author',
        'priority',
        'note',
        'coverUrl',
        'externalId',
      ]

      const updatedChanges = {}

      allowedFields.forEach((field) => {
        if (Object.prototype.hasOwnProperty.call(changes, field)) {
          updatedChanges[field] = changes[field]
        }
      })

      if (updatedChanges.title !== undefined) {
        if (
          typeof updatedChanges.title === 'string' &&
          updatedChanges.title.trim()
        ) {
          updatedChanges.title = updatedChanges.title.trim()
        } else {
          delete updatedChanges.title
        }
      }

      if (updatedChanges.author !== undefined) {
        updatedChanges.author =
          typeof updatedChanges.author === 'string'
            ? updatedChanges.author.trim() || 'Unknown author'
            : 'Unknown author'
      }

      if (
        updatedChanges.priority !== undefined &&
        !VALID_PRIORITIES.includes(updatedChanges.priority)
      ) {
        delete updatedChanges.priority
      }

      if (updatedChanges.note !== undefined) {
        updatedChanges.note =
          typeof updatedChanges.note === 'string' ? updatedChanges.note : ''
      }

      Object.assign(item, updatedChanges)
    },

    removeFromWishlist: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload)
    },

    setWishlist: (state, action) => {
      state.items = Array.isArray(action.payload) ? action.payload : []
    },

    clearWishlist: (state) => {
      state.items = []
    },
  },
})

export const {
  addToWishlist,
  updateWishlistItem,
  removeFromWishlist,
  setWishlist,
  clearWishlist,
} = wishlistSlice.actions

export default wishlistSlice.reducer

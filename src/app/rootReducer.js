import { combineReducers } from '@reduxjs/toolkit'

import booksReducer from '../store/slices/booksSlice'
import sessionsReducer from '../store/slices/sessionsSlice'
import goalsReducer from '../store/slices/goalsSlice'
import wishlistReducer from '../store/slices/wishlistSlice'
import preferencesReducer from '../store/slices/preferencesSlice'

import { bookCatalogApi } from '../store/api/bookCatalogApi'

const rootReducer = combineReducers({
  books: booksReducer,
  sessions: sessionsReducer,
  goals: goalsReducer,
  wishlist: wishlistReducer,
  preferences: preferencesReducer,

  [bookCatalogApi.reducerPath]: bookCatalogApi.reducer,
})

export default rootReducer

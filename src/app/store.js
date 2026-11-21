import { configureStore } from '@reduxjs/toolkit'

import rootReducer from './rootReducer'

import { bookCatalogApi } from '../store/api/bookCatalogApi'

import {
  loadPersistedState,
  savePersistedState,
} from '../services/storageService'

const store = configureStore({
  reducer: rootReducer,

  preloadedState: loadPersistedState(),

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(bookCatalogApi.middleware),

  devTools: import.meta.env.DEV,
})

store.subscribe(() => {
  savePersistedState(store.getState())
})

export default store

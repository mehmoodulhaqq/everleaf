import { createSlice } from '@reduxjs/toolkit'

import {
  DEFAULT_THEME,
  READING_PREFERENCES,
  THEME_MODES,
} from '../../utils/constants'

const initialState = {
  theme: DEFAULT_THEME,

  reading: {
    defaultDailyPageTarget: READING_PREFERENCES.DEFAULT_DAILY_PAGE_TARGET,

    defaultMonthlyPageTarget: READING_PREFERENCES.DEFAULT_MONTHLY_PAGE_TARGET,

    defaultAnnualBookTarget: READING_PREFERENCES.DEFAULT_ANNUAL_BOOK_TARGET,
  },
}

const VALID_THEMES = Object.values(THEME_MODES)

const READING_PREFERENCE_DEFAULTS = {
  defaultDailyPageTarget: READING_PREFERENCES.DEFAULT_DAILY_PAGE_TARGET,
  defaultMonthlyPageTarget: READING_PREFERENCES.DEFAULT_MONTHLY_PAGE_TARGET,
  defaultAnnualBookTarget: READING_PREFERENCES.DEFAULT_ANNUAL_BOOK_TARGET,
}

const normalizePositiveInteger = (value, fallback) => {
  const number = Number(value)

  return Number.isFinite(number) ? Math.max(1, Math.floor(number)) : fallback
}

const applyReadingPreferences = (target, updates) => {
  if (!updates || typeof updates !== 'object') return

  Object.entries(READING_PREFERENCE_DEFAULTS).forEach(([key, fallback]) => {
    if (updates[key] !== undefined) {
      target[key] = normalizePositiveInteger(updates[key], fallback)
    }
  })
}

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,

  reducers: {
    setTheme: (state, action) => {
      if (VALID_THEMES.includes(action.payload)) {
        state.theme = action.payload
      }
    },

    toggleTheme: (state) => {
      state.theme =
        state.theme === THEME_MODES.LIGHT ? THEME_MODES.DARK : THEME_MODES.LIGHT
    },

    updateReadingPreferences: (state, action) => {
      applyReadingPreferences(state.reading, action.payload)
    },

    resetPreferences: () => initialState,

    setPreferences: (state, action) => {
      const preferences = action.payload

      if (!preferences || typeof preferences !== 'object') return

      if (VALID_THEMES.includes(preferences.theme)) {
        state.theme = preferences.theme
      }

      applyReadingPreferences(state.reading, preferences.reading)
    },
  },
})

export const {
  setTheme,
  toggleTheme,
  updateReadingPreferences,
  resetPreferences,
  setPreferences,
} = preferencesSlice.actions

export default preferencesSlice.reducer

import { useCallback, useEffect } from 'react'

import useAppDispatch from './useAppDispatch'
import useAppSelector from './useAppSelector'

import { setTheme, toggleTheme } from '../store/slices/preferencesSlice'

import { THEME_MODES } from '../utils/constants'

/**
 * Reads the saved theme preference and applies it to the document.
 * The preference itself remains in Redux and is persisted by store.js.
 */
export const useTheme = () => {
  const dispatch = useAppDispatch()

  const theme = useAppSelector(
    (state) => state.preferences?.theme || THEME_MODES.LIGHT,
  )

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const changeTheme = useCallback(
    (nextTheme) => {
      if (!Object.values(THEME_MODES).includes(nextTheme)) return

      dispatch(setTheme(nextTheme))
    },
    [dispatch],
  )

  const switchTheme = useCallback(() => {
    dispatch(toggleTheme())
  }, [dispatch])

  return {
    theme,
    isDark: theme === THEME_MODES.DARK,
    setTheme: changeTheme,
    toggleTheme: switchTheme,
  }
}

export default useTheme

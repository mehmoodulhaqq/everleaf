import { useMemo } from 'react'

import useAppSelector from './useAppSelector'
import { calculateReadingStatistics } from '../utils/statisticsUtils'

/**
 * Selects the shared books and sessions and derives reading statistics.
 *
 * Pages Read comes from completed book totals and the current progress
 * of reading and paused books.
 *
 * Reading activity, reading time, and streaks remain session-based.
 */
export const useReadingStats = () => {
  const books = useAppSelector((state) => state.books?.items ?? [])
  const sessions = useAppSelector((state) => state.sessions?.items ?? [])

  return useMemo(() => {
    return calculateReadingStatistics(books, sessions)
  }, [books, sessions])
}

export default useReadingStats

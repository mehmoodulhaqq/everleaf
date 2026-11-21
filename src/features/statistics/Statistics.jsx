import { useMemo } from 'react'
import { ChartNoAxesCombined } from 'lucide-react'

import PageHeader from '../../components/common/PageHeader'
import EmptyState from '../../components/common/EmptyState'

import StatisticsOverview from '../../components/statistics/StatisticsOverview'
import StatisticsBreakdown from '../../components/statistics/StatisticsBreakdown'

import useAppSelector from '../../hooks/useAppSelector'
import { calculateReadingStatistics } from '../../utils/statisticsUtils'

function Statistics() {
  const books = useAppSelector((state) => state.books?.items ?? [])

  const sessions = useAppSelector((state) => state.sessions?.items ?? [])

  const statistics = useMemo(() => {
    return calculateReadingStatistics(books, sessions)
  }, [books, sessions])

  const hasReadingData = books.length > 0 || sessions.length > 0

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Your reading journey"
        title="Statistics & Insights"
        description="Understand your reading habits, celebrate your progress, and see how your literary journey develops over time."
      />

      {!hasReadingData ? (
        <EmptyState
          icon={ChartNoAxesCombined}
          title="Your reading story starts here"
          description="Add books to your library and record reading sessions. Your statistics and charts will grow automatically as you read."
        />
      ) : (
        <>
          <StatisticsOverview statistics={statistics} />

          <StatisticsBreakdown statistics={statistics} />
        </>
      )}
    </div>
  )
}

export default Statistics

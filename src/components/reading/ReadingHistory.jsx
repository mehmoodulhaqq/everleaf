import { BookOpen, CalendarDays } from 'lucide-react'

import ReadingSessionCard from './ReadingSessionCard'
import EmptyState from '../common/EmptyState'

import { sortSessionsByDate } from '../../utils/readingUtils'
import { formatDate } from '../../utils/dateUtils'

function ReadingHistory({
  sessions = [],
  books = [],
  onEdit,
  onDelete,
  title = 'Reading history',
  emptyTitle = 'No reading sessions yet',
  emptyDescription = 'Your reading activity will appear here once you log a session.',
}) {
  const safeSessions = Array.isArray(sessions) ? sessions : []
  const safeBooks = Array.isArray(books) ? books : []

  const sortedSessions = sortSessionsByDate(safeSessions, 'desc')

  const bookById = new Map(safeBooks.map((book) => [book.id, book]))

  if (sortedSessions.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title={emptyTitle}
        description={emptyDescription}
      />
    )
  }

  const groupedSessions = new Map()

  sortedSessions.forEach((session) => {
    const date = session.date || 'unknown'

    if (!groupedSessions.has(date)) {
      groupedSessions.set(date, [])
    }

    groupedSessions.get(date).push(session)
  })

  return (
    <section className="space-y-5">
      {title ? (
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-cognac" aria-hidden="true" />

          <h2 className="font-display text-lg font-semibold text-text-primary">
            {title}
          </h2>
        </div>
      ) : null}

      {Array.from(groupedSessions.entries()).map(([date, dateSessions]) => (
        <div key={date}>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
            {date === 'unknown'
              ? 'Unknown date'
              : formatDate(date) || 'Unknown date'}
          </h3>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {dateSessions.map((session) => (
              <ReadingSessionCard
                key={session.id}
                session={session}
                book={bookById.get(session.bookId)}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}

export default ReadingHistory

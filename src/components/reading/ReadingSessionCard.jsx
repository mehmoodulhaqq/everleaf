import {
  CalendarDays,
  Clock3,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react'

import Dropdown from '../common/Dropdown'
import { formatDate } from '../../utils/dateUtils'

function formatDuration(minutes) {
  const total = Math.max(0, Math.floor(Number(minutes) || 0))

  if (total < 60) {
    return `${total} min`
  }

  const hours = Math.floor(total / 60)
  const remaining = total % 60

  return remaining > 0 ? `${hours} hr ${remaining} min` : `${hours} hr`
}

function ReadingSessionCard({ session, book, onEdit, onDelete }) {
  const actions = [
    {
      label: 'Edit session',
      icon: Pencil,
      onSelect: () => onEdit?.(session),
    },
    {
      divider: true,
    },
    {
      label: 'Delete session',
      icon: Trash2,
      destructive: true,
      onSelect: () => onDelete?.(session),
    },
  ]

  const pagesRead = Math.max(0, Number(session?.pagesRead) || 0)

  return (
    <article className="rounded-xl border border-border bg-surface p-4 transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-medium text-text-primary">
            {book?.title || 'Book no longer available'}
          </h3>

          <p className="mt-1 text-xs text-text-secondary">
            {book?.author || 'Unknown author'}
          </p>
        </div>

        <Dropdown
          trigger={<MoreHorizontal className="h-5 w-5" aria-hidden="true" />}
          triggerLabel="Session actions"
          items={actions}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-text-secondary">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
          {formatDate(session?.date) || 'Unknown date'}
        </span>

        <span className="inline-flex items-center gap-1.5">
          <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
          {formatDuration(session?.durationMinutes)}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-lg bg-surface-secondary px-3 py-2">
        <span className="text-xs text-text-secondary">Pages read</span>

        <span className="font-semibold tabular-nums text-walnut">
          {pagesRead.toLocaleString()}
        </span>
      </div>

      {session?.note ? (
        <p className="mt-3 whitespace-pre-line text-sm leading-6 text-text-secondary">
          {session.note}
        </p>
      ) : null}
    </article>
  )
}

export default ReadingSessionCard

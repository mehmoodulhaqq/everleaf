import { ArrowRight, BookOpen, Pencil, Trash2 } from 'lucide-react'

import BookCover from '../books/BookCover'

const PRIORITY_STYLES = {
  high: 'bg-danger/10 text-danger',
  medium: 'bg-caramel/15 text-walnut',
  low: 'bg-surface-secondary text-text-secondary',
}

function WishlistCard({ item, onEdit, onMoveToLibrary, onRemove }) {
  if (!item) return null

  const priority = item.priority || 'medium'

  return (
    <article className="group flex h-full min-w-0 flex-col rounded-lg border border-border bg-surface p-2.5 transition-all duration-200 hover:border-border-strong hover:shadow-md sm:rounded-xl sm:p-4 sm:hover:-translate-y-0.5">
      {/* BOOK INFORMATION */}
      <div className="flex min-w-0 gap-2.5 sm:gap-4">
        {/* COVER */}
        <div className="w-[76px] shrink-0 sm:w-24 lg:w-28">
          <BookCover
            src={item.coverUrl}
            title={item.title}
            author={item.author}
            className="max-h-44"
          />
        </div>

        {/* DETAILS */}
        <div className="min-w-0 flex-1">
          <div className="mb-2 sm:mb-3">
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-semibold capitalize sm:px-2.5 sm:py-1 sm:text-[11px] ${
                PRIORITY_STYLES[priority] || PRIORITY_STYLES.medium
              }`}
            >
              {priority} priority
            </span>
          </div>

          <h3 className="line-clamp-2 break-words font-display text-sm font-semibold leading-snug text-text-primary sm:text-lg">
            {item.title}
          </h3>

          <p className="mt-1 line-clamp-1 text-[10px] text-text-secondary sm:text-sm">
            {item.author || 'Unknown author'}
          </p>

          {item.note ? (
            <p className="mt-2 line-clamp-3 text-[10px] leading-relaxed text-text-muted sm:mt-3 sm:text-sm">
              {item.note}
            </p>
          ) : (
            <p className="mt-2 text-[10px] italic text-text-muted sm:mt-3 sm:text-sm">
              No personal note added.
            </p>
          )}
        </div>
      </div>

      {/* ACTIONS */}
      <div className="mt-auto mt-3 flex min-w-0 items-center justify-between gap-1 border-t border-border pt-2.5 sm:mt-4 sm:pt-3">
        <button
          type="button"
          onClick={() => onMoveToLibrary?.(item)}
          className="inline-flex min-w-0 items-center gap-1 text-[10px] font-semibold text-walnut transition-colors hover:text-text-primary focus-visible:outline-2 focus-visible:outline-focus sm:gap-2 sm:text-sm"
        >
          <BookOpen
            aria-hidden="true"
            className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4"
          />

          <span className="truncate">Add to library</span>

          <ArrowRight
            aria-hidden="true"
            className="h-3 w-3 shrink-0 transition-transform group-hover:translate-x-1 sm:h-4 sm:w-4"
          />
        </button>

        <div className="flex shrink-0 items-center gap-0.5">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(item)}
              aria-label={`Edit ${item.title}`}
              title="Edit"
              className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-secondary hover:text-text-primary focus-visible:outline-2 focus-visible:outline-focus sm:h-8 sm:w-8 sm:rounded-lg"
            >
              <Pencil
                aria-hidden="true"
                className="h-3.5 w-3.5 sm:h-4 sm:w-4"
              />
            </button>
          )}

          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              aria-label={`Remove ${item.title} from wishlist`}
              title="Remove"
              className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-danger/10 hover:text-danger focus-visible:outline-2 focus-visible:outline-focus sm:h-8 sm:w-8 sm:rounded-lg"
            >
              <Trash2
                aria-hidden="true"
                className="h-3.5 w-3.5 sm:h-4 sm:w-4"
              />
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

export default WishlistCard

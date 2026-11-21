import { Link } from 'react-router-dom'
import { Pencil, Star, Trash2 } from 'lucide-react'

import BookCover from './BookCover'
import BookStatusBadge from './BookStatusBadge'
import BookProgress from './BookProgress'

function BookCard({ book, onEdit, onDelete, className = '' }) {
  if (!book) return null

  const bookPath = `/books/${encodeURIComponent(book.id)}`
  const rating = Number(book.rating)
  const hasRating = Number.isFinite(rating) && rating >= 1 && rating <= 5

  return (
    <article
      className={[
        'group flex h-full min-w-0 flex-col overflow-hidden rounded-lg sm:rounded-xl',
        'border border-border bg-surface',
        'transition-all duration-200',
        'hover:border-border-strong hover:shadow-md sm:hover:-translate-y-1 sm:hover:shadow-lg',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* BOOK COVER */}
      <Link
        to={bookPath}
        className="block overflow-hidden bg-surface p-1.5 sm:p-3"
        aria-label={`View details for ${book.title}`}
      >
        <div className="mx-auto w-full max-w-[120px] overflow-hidden rounded-md shadow-sm transition-transform duration-300 sm:max-w-[190px] sm:group-hover:scale-[1.02]">
          <BookCover
            src={book.coverUrl}
            title={book.title}
            author={book.author}
            className="aspect-[2/3] w-full"
          />
        </div>
      </Link>

      {/* BOOK INFORMATION */}
      <div className="flex min-w-0 flex-1 flex-col p-2 sm:p-3">
        {/* STATUS AND RATING */}
        <div className="mb-1.5 flex min-w-0 items-center justify-between gap-1 sm:mb-2 sm:gap-2">
          <div className="min-w-0 overflow-hidden">
            <BookStatusBadge status={book.status} />
          </div>

          {hasRating && (
            <span className="inline-flex shrink-0 items-center gap-0.5 text-[10px] font-medium text-text-secondary sm:gap-1 sm:text-xs">
              <Star
                aria-hidden="true"
                className="h-3 w-3 fill-caramel text-caramel sm:h-3.5 sm:w-3.5"
              />
              {rating.toFixed(1)}
            </span>
          )}
        </div>

        {/* TITLE */}
        <Link
          to={bookPath}
          className="line-clamp-2 break-words font-display text-xs font-semibold leading-snug text-text-primary transition-colors hover:text-walnut focus-visible:outline-2 focus-visible:outline-focus sm:text-[15px]"
        >
          {book.title}
        </Link>

        {/* AUTHOR */}
        <p className="mt-1 line-clamp-1 text-[10px] text-text-secondary sm:text-xs">
          {book.author || 'Unknown author'}
        </p>

        {/* READING PROGRESS */}
        {book.totalPages > 0 && (
          <div className="mt-2 sm:mt-3">
            <BookProgress
              currentPage={book.currentPage}
              totalPages={book.totalPages}
              compact
            />
          </div>
        )}

        {/* ACTIONS */}
        {(onEdit || onDelete) && (
          <div className="mt-auto flex justify-end gap-1 border-t border-border pt-1.5 sm:pt-2">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(book)}
                aria-label={`Edit ${book.title}`}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-secondary hover:text-text-primary focus-visible:outline-2 focus-visible:outline-focus sm:h-8 sm:w-8 sm:rounded-lg"
              >
                <Pencil
                  aria-hidden="true"
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                />
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(book)}
                aria-label={`Delete ${book.title}`}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-danger/10 hover:text-danger focus-visible:outline-2 focus-visible:outline-focus sm:h-8 sm:w-8 sm:rounded-lg"
              >
                <Trash2
                  aria-hidden="true"
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                />
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

export default BookCard

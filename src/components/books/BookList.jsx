import { Link } from 'react-router-dom'
import { Pencil, Star, Trash2 } from 'lucide-react'

import BookCover from './BookCover'
import BookStatusBadge from './BookStatusBadge'
import BookProgress from './BookProgress'
import EmptyState from '../common/EmptyState'

function BookList({
  books = [],
  onEditBook,
  onDeleteBook,
  emptyTitle = 'No books to show',
  emptyDescription = 'Try changing your search or filters.',
  emptyAction,
  className = '',
}) {
  if (!Array.isArray(books) || books.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
        className={className}
      />
    )
  }

  return (
    <ul className={['space-y-3', className].filter(Boolean).join(' ')}>
      {books.map((book) => {
        const rating = Number(book.rating)
        const hasRating = Number.isFinite(rating) && rating >= 1 && rating <= 5
        const bookPath = `/books/${encodeURIComponent(book.id)}`

        return (
          <li
            key={book.id}
            className="flex min-w-0 items-center gap-3 rounded-2xl border border-border bg-surface p-3 shadow-sm transition-colors hover:border-border-strong sm:gap-4 sm:p-4"
          >
            <Link
              to={bookPath}
              className="w-16 shrink-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus sm:w-20"
              aria-label={`View details for ${book.title}`}
            >
              <BookCover
                src={book.coverUrl}
                title={book.title}
                author={book.author}
                className="rounded-lg"
              />
            </Link>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <BookStatusBadge status={book.status} />
                {hasRating ? (
                  <span className="inline-flex items-center gap-1 text-xs text-text-secondary">
                    <Star
                      aria-hidden="true"
                      className="h-3.5 w-3.5 fill-caramel text-caramel"
                    />
                    {rating.toFixed(1)}
                  </span>
                ) : null}
              </div>

              <Link
                to={bookPath}
                className="mt-2 block truncate font-display text-base font-semibold text-text-primary hover:text-walnut focus-visible:outline-2 focus-visible:outline-focus sm:text-lg"
              >
                {book.title}
              </Link>
              <p className="mt-0.5 truncate text-sm text-text-secondary">
                {book.author || 'Unknown author'}
              </p>

              {book.totalPages > 0 ? (
                <div className="mt-3 max-w-md">
                  <BookProgress
                    currentPage={book.currentPage}
                    totalPages={book.totalPages}
                    compact
                  />
                </div>
              ) : null}
            </div>

            {onEditBook || onDeleteBook ? (
              <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
                {onEditBook ? (
                  <button
                    type="button"
                    onClick={() => onEditBook(book)}
                    aria-label={`Edit ${book.title}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:bg-surface-secondary hover:text-text-primary focus-visible:outline-2 focus-visible:outline-focus"
                  >
                    <Pencil aria-hidden="true" className="h-4 w-4" />
                  </button>
                ) : null}
                {onDeleteBook ? (
                  <button
                    type="button"
                    onClick={() => onDeleteBook(book)}
                    aria-label={`Delete ${book.title}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:bg-danger/10 hover:text-danger focus-visible:outline-2 focus-visible:outline-focus"
                  >
                    <Trash2 aria-hidden="true" className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}

export default BookList


import { BookOpen, Heart, Plus, SearchX } from 'lucide-react'

import BookCover from '../../components/books/BookCover'
import Button from '../../components/common/Button'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import LoadingState from '../../components/common/LoadingState'

function ExploreResults({
  books = [],
  wishlistItems = [],
  isLoading = false,
  isError = false,
  error,
  source,
  onRetry,
  onAddToLibrary,
  onAddToWishlist,
  onViewDetails,
  hasSearched = false,
}) {
  if (isLoading) {
    return <LoadingState label="Discovering books..." size="lg" />
  }

  if (isError) {
    return (
      <ErrorState
        title="Couldn't load books"
        description={
          error?.data?.message ||
          error?.message ||
          'Something went wrong while searching the catalogue.'
        }
        onRetry={onRetry}
        retryLabel="Try again"
      />
    )
  }

  if (!hasSearched) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Find your next read"
        description="Search by book title, author, or ISBN, or browse a category to discover books."
      />
    )
  }

  if (books.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title="No books found"
        description="Neither catalogue returned matching books. Try another search term or category."
      />
    )
  }

  return (
    <section aria-label="Book search results">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 sm:mb-5">
        <div>
          <h2 className="font-display text-xl font-semibold text-text-primary">
            Search results
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            {books.length} books displayed
          </p>
        </div>

        {source && (
          <span className="rounded-full bg-surface-secondary px-3 py-1.5 text-xs font-medium text-text-secondary">
            Results from {source}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
        {books.map((book) => {
          const isWishlisted = wishlistItems.some(
            (item) => item.externalId === book.id,
          )

          return (
            <article
              key={book.id}
              className="flex h-full flex-col rounded-xl border border-border bg-surface p-3 shadow-sm transition-all duration-200 hover:border-border-strong hover:shadow-md sm:rounded-2xl sm:p-4"
            >
              <div className="flex gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => onViewDetails?.(book)}
                  aria-label={`View details for ${book.title}`}
                  className="w-24 shrink-0 cursor-pointer rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <BookCover
                    src={book.coverUrl}
                    title={book.title}
                    author={book.author}
                    className="max-h-36 sm:max-h-40"
                  />
                </button>

                <div className="min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => onViewDetails?.(book)}
                    className="cursor-pointer text-left focus-visible:outline-none focus-visible:underline"
                  >
                    <h3 className="line-clamp-3 font-display text-base font-semibold leading-snug text-text-primary hover:text-primary">
                      {book.title}
                    </h3>
                  </button>

                  <p className="mt-1 line-clamp-2 text-sm text-text-secondary">
                    {book.author}
                  </p>

                  {book.genre && book.genre !== 'Uncategorized' && (
                    <span className="mt-2 inline-block rounded-full bg-surface-secondary px-2.5 py-1 text-xs text-text-secondary">
                      {book.genre}
                    </span>
                  )}

                  {book.publishedDate && (
                    <p className="mt-2 text-xs text-text-muted">
                      Published: {book.publishedDate}
                    </p>
                  )}

                  {book.totalPages > 0 && (
                    <p className="mt-1 text-xs text-text-muted">
                      {book.totalPages} pages
                    </p>
                  )}
                </div>
              </div>

              {book.description ? (
                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-text-secondary">
                  {book.description}
                </p>
              ) : (
                <p className="mt-3 text-sm italic text-text-muted">
                  No description available.
                </p>
              )}

              <div className="mt-auto border-t border-border pt-3">
                <div className="mb-3">
                  {book.averageRating ? (
                    <span className="text-xs text-text-secondary">
                      ★ {book.averageRating.toFixed(1)}
                      {book.ratingsCount > 0 ? ` (${book.ratingsCount})` : ''}
                    </span>
                  ) : (
                    <span className="text-xs text-text-muted">
                      Catalogue book
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    leftIcon={<Plus className="h-4 w-4" />}
                    onClick={() => onAddToLibrary?.(book)}
                  >
                    Add to library
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isWishlisted}
                    aria-label={
                      isWishlisted
                        ? `${book.title} is already in your wishlist`
                        : `Add ${book.title} to wishlist`
                    }
                    leftIcon={<Heart className="h-4 w-4" />}
                    onClick={() => onAddToWishlist?.(book)}
                  >
                    {isWishlisted ? 'Saved' : 'Wishlist'}
                  </Button>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default ExploreResults

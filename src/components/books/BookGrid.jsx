import { BookOpen } from 'lucide-react'

import BookCard from './BookCard'
import EmptyState from '../common/EmptyState'

function BookGrid({
  books = [],
  onEditBook,
  onDeleteBook,
  emptyTitle = 'Your library is waiting',
  emptyDescription = 'Add a book to start building your personal reading space.',
  emptyAction,
  className = '',
}) {
  if (!Array.isArray(books) || books.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
        className={className}
      />
    )
  }

  return (
    <div
      className={[
        'grid grid-cols-2 gap-2',
        'sm:grid-cols-3 sm:gap-4',
        'lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          onEdit={onEditBook}
          onDelete={onDeleteBook}
        />
      ))}
    </div>
  )
}

export default BookGrid

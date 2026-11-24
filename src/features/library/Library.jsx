
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookPlus,
  Search,
  LayoutGrid,
  List,
  Plus,
  SlidersHorizontal,
  ArrowDown,
  ArrowUp,
  X,
  Library as LibraryIcon,
} from 'lucide-react'

import useAppDispatch from '../../hooks/useAppDispatch'
import useAppSelector from '../../hooks/useAppSelector'
import { addBook, deleteBook, updateBook } from '../../store/slices/booksSlice'
import { deleteSessionsByBookId } from '../../store/slices/sessionsSlice'
import {
  BOOK_SORT_OPTIONS,
  BOOK_STATUS_OPTIONS,
  BOOK_VIEW_MODES,
} from '../../utils/constants'
import { filterBooks, getBookGenres, sortBooks } from '../../utils/bookUtils'
import {
  createBookRecord,
  getBookFormValues,
  prepareBookUpdate,
} from '../../services/bookService'

import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Modal from '../../components/common/Modal'
import PageHeader from '../../components/common/PageHeader'
import BookForm from '../../components/books/BookForm'
import BookGrid from '../../components/books/BookGrid'
import BookList from '../../components/books/BookList'

const FILTER_STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  ...BOOK_STATUS_OPTIONS.filter(
    (option) => option.value !== 'want-to-read',
  ),
]

function createId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return (
    'book-' +
    Date.now().toString(36) +
    '-' +
    Math.random().toString(36).slice(2, 10)
  )
}

function Library() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const books = useAppSelector((state) => state.books.items)

  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [genre, setGenre] = useState('all')
  const [sortBy, setSortBy] = useState('dateAdded')
  const [sortDirection, setSortDirection] = useState('desc')
  const [viewMode, setViewMode] = useState(BOOK_VIEW_MODES.GRID)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingBook, setEditingBook] = useState(null)
  const [bookToDelete, setBookToDelete] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  // Only currently reading and completed books belong in Library.
  const libraryBooks = useMemo(
    () =>
      books.filter(
        (book) =>
          book.status === 'reading' ||
          book.status === 'completed',
      ),
    [books],
  )

  const genres = useMemo(
    () => getBookGenres(libraryBooks),
    [libraryBooks],
  )

  const genreOptions = useMemo(
    () => [
      { value: 'all', label: 'All genres' },
      ...genres.map((item) => ({ value: item, label: item })),
    ],
    [genres],
  )

  const visibleBooks = useMemo(() => {
    const filtered = filterBooks(libraryBooks, { query, status, genre })
    return sortBooks(filtered, sortBy, sortDirection)
  }, [libraryBooks, query, status, genre, sortBy, sortDirection])

  // Separate books into their respective sections.
  const currentlyReadingBooks = useMemo(
    () => visibleBooks.filter((book) => book.status === 'reading'),
    [visibleBooks],
  )

  const completedBooks = useMemo(
    () => visibleBooks.filter((book) => book.status === 'completed'),
    [visibleBooks],
  )

  const bookSections = [
    {
      title: 'Currently Reading',
      description: 'Books you are currently reading.',
      books: currentlyReadingBooks,
    },
    {
      title: 'Completed',
      description: 'Books you have finished reading.',
      books: completedBooks,
    },
  ]

  const hasActiveFilters =
    query.trim() !== '' || status !== 'all' || genre !== 'all'

  const openAddForm = () => {
    setEditingBook(null)
    setIsFormOpen(true)
  }

  const openEditForm = (book) => {
    setEditingBook(book)
    setIsFormOpen(true)
  }

  const closeForm = () => {
    if (isSaving) return
    setIsFormOpen(false)
    setEditingBook(null)
  }

  const handleSaveBook = async (values) => {
    setIsSaving(true)

    try {
      const now = new Date().toISOString()

      if (editingBook) {
        const changes = prepareBookUpdate(editingBook, values, now)
        dispatch(updateBook({ id: editingBook.id, changes }))
        setIsFormOpen(false)
        setEditingBook(null)
      } else {
        const book = createBookRecord(values, { id: createId(), now })
        dispatch(addBook(book))
        setIsFormOpen(false)
        setEditingBook(null)
        navigate('/books/' + encodeURIComponent(book.id))
      }
    } finally {
      setIsSaving(false)
    }
  }

  const confirmDelete = () => {
    if (!bookToDelete) return

    dispatch(deleteSessionsByBookId(bookToDelete.id))
    dispatch(deleteBook(bookToDelete.id))
    setBookToDelete(null)
  }

  const clearFilters = () => {
    setQuery('')
    setStatus('all')
    setGenre('all')
    setSortBy('dateAdded')
    setSortDirection('desc')
  }

  return (
    <>
      <PageHeader
        eyebrow="Your collection"
        title="My Library"
        description="Keep your books organized and follow every reading journey."
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openAddForm}>
            Add a book
          </Button>
        }
      />

      {/* Library search and filters */}
      <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm sm:rounded-2xl">
        {/* Search */}
        <div className="p-3 sm:p-5 lg:p-6">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Search className="h-3.5 w-3.5 text-walnut" />
              <h2 className="text-xs font-semibold text-text-primary sm:text-sm">
                Find a book
              </h2>
            </div>
          </div>

          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search books..."
            aria-label="Search your library"
            className="min-h-9 rounded-lg border-border bg-surface-secondary px-3 focus-within:bg-surface sm:min-h-11 sm:rounded-xl sm:px-4"
            inputClassName="text-xs sm:text-sm"
            leadingIcon={<Search className="h-4 w-4 sm:h-5 sm:w-5" />}
            trailingElement={
              query ? (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                  className="rounded-full p-1 text-text-muted transition-colors hover:bg-surface hover:text-text-primary"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null
            }
          />
        </div>

        <div className="border-t border-border" />

        {/* Filters */}
        <div className="p-3 sm:p-5 lg:p-6">
          <div className="mb-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5 text-walnut" />
              <h2 className="text-xs font-semibold text-text-primary sm:text-sm">
                Filters
              </h2>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-[10px] font-medium text-walnut transition-colors hover:text-text-primary sm:text-xs"
              >
                Reset
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
            <Select
              label="Reading status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              options={FILTER_STATUS_OPTIONS}
              className="min-h-9 rounded-lg border-border bg-surface-secondary sm:min-h-11 sm:rounded-xl"
            />

            <Select
              label="Genre"
              value={genre}
              onChange={(event) => setGenre(event.target.value)}
              options={genreOptions}
              className="min-h-9 rounded-lg border-border bg-surface-secondary sm:min-h-11 sm:rounded-xl"
            />

            <div className="col-span-2 xl:col-span-1">
              <Select
                label="Sort by"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                options={BOOK_SORT_OPTIONS}
                className="min-h-9 rounded-lg border-border bg-surface-secondary sm:min-h-11 sm:rounded-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Collection toolbar */}
      <section className="mt-4 flex flex-col gap-3 rounded-xl border border-border bg-surface px-3 py-3 shadow-sm sm:mt-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:rounded-2xl sm:px-5 sm:py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sand/60 text-walnut sm:h-10 sm:w-10 sm:rounded-xl">
            <LibraryIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>

          <div>
            <h2 className="text-xs font-semibold text-text-primary sm:text-sm">
              Your collection
            </h2>
            <p
              className="mt-0.5 text-[10px] text-text-secondary sm:text-xs"
              aria-live="polite"
            >
              Showing{' '}
              <strong className="text-text-primary">
                {visibleBooks.length}
              </strong>{' '}
              of <strong className="text-text-primary">{libraryBooks.length}</strong>{' '}
              books
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end sm:gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium text-text-secondary sm:text-xs">
              Order
            </span>

            <div className="flex items-center gap-0.5 rounded-lg border border-border bg-surface p-0.5 sm:gap-1 sm:rounded-xl sm:p-1">
              <button
                type="button"
                onClick={() => setSortDirection('asc')}
                aria-pressed={sortDirection === 'asc'}
                className={[
                  'inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-[10px] font-medium transition-all duration-200 sm:gap-2 sm:rounded-lg sm:px-3 sm:py-2 sm:text-xs',
                  sortDirection === 'asc'
                    ? 'bg-sand text-walnut shadow-sm'
                    : 'text-text-muted hover:bg-surface-secondary hover:text-text-primary',
                ].join(' ')}
              >
                <ArrowUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                Ascending
              </button>

              <button
                type="button"
                onClick={() => setSortDirection('desc')}
                aria-pressed={sortDirection === 'desc'}
                className={[
                  'inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-[10px] font-medium transition-all duration-200 sm:gap-2 sm:rounded-lg sm:px-3 sm:py-2 sm:text-xs',
                  sortDirection === 'desc'
                    ? 'bg-sand text-walnut shadow-sm'
                    : 'text-text-muted hover:bg-surface-secondary hover:text-text-primary',
                ].join(' ')}
              >
                <ArrowDown className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                Descending
              </button>
            </div>
          </div>

          <div
            className="inline-flex items-center rounded-lg border border-border bg-surface-secondary p-0.5 sm:p-1"
            aria-label="Library view"
          >
            <button
              type="button"
              onClick={() => setViewMode(BOOK_VIEW_MODES.GRID)}
              aria-label="Grid view"
              aria-pressed={viewMode === BOOK_VIEW_MODES.GRID}
              className={[
                'rounded-md p-1.5 transition-all sm:p-2',
                viewMode === BOOK_VIEW_MODES.GRID
                  ? 'bg-surface text-walnut shadow-sm'
                  : 'text-text-muted hover:text-text-primary',
              ].join(' ')}
            >
              <LayoutGrid className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>

            <button
              type="button"
              onClick={() => setViewMode(BOOK_VIEW_MODES.LIST)}
              aria-label="List view"
              aria-pressed={viewMode === BOOK_VIEW_MODES.LIST}
              className={[
                'rounded-md p-1.5 transition-all sm:p-2',
                viewMode === BOOK_VIEW_MODES.LIST
                  ? 'bg-surface text-walnut shadow-sm'
                  : 'text-text-muted hover:text-text-primary',
              ].join(' ')}
            >
              <List className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Books grouped by reading status */}
      <div className="mt-4 space-y-8 sm:mt-6 sm:space-y-10">
        {libraryBooks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-surface px-4 py-10 text-center sm:rounded-2xl sm:px-6 sm:py-16">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-sand/60 sm:h-16 sm:w-16 sm:rounded-2xl">
              <BookPlus className="h-6 w-6 text-walnut sm:h-8 sm:w-8" />
            </div>

            <h2 className="mt-4 font-display text-lg font-semibold text-text-primary sm:mt-5 sm:text-xl">
              Your reading space starts here
            </h2>

            <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-text-secondary sm:text-sm sm:leading-6">
              Add a currently reading or completed book to start building your
              personal library. Books you want to read belong in your Wishlist.
            </p>

            <Button
              className="mt-5 sm:mt-6"
              onClick={openAddForm}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Add your first book
            </Button>
          </div>
        ) : visibleBooks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-surface px-4 py-9 text-center sm:rounded-2xl sm:px-6 sm:py-14">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-sand/60 sm:h-14 sm:w-14 sm:rounded-2xl">
              <SlidersHorizontal className="h-5 w-5 text-walnut sm:h-6 sm:w-6" />
            </div>

            <h2 className="mt-3 font-display text-base font-semibold text-text-primary sm:mt-4 sm:text-lg">
              No matching books
            </h2>

            <p className="mt-2 text-xs text-text-secondary sm:text-sm">
              We couldn't find books matching your current search and filters.
            </p>

            <Button
              className="mt-4 sm:mt-5"
              size="sm"
              variant="outline"
              onClick={clearFilters}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          bookSections.map((section) => {
            if (section.books.length === 0) return null

            return (
              <section key={section.title}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg font-semibold text-text-primary sm:text-xl">
                      {section.title}
                    </h2>
                    <p className="mt-1 text-xs text-text-secondary sm:text-sm">
                      {section.description}
                    </p>
                  </div>

                  <span className="rounded-full bg-sand/60 px-3 py-1 text-xs font-semibold text-walnut">
                    {section.books.length}
                  </span>
                </div>

                {viewMode === BOOK_VIEW_MODES.GRID ? (
                  <BookGrid
                    books={section.books}
                    onEditBook={openEditForm}
                    onDeleteBook={setBookToDelete}
                  />
                ) : (
                  <BookList
                    books={section.books}
                    onEditBook={openEditForm}
                    onDeleteBook={setBookToDelete}
                  />
                )}
              </section>
            )
          })
        )}
      </div>

      {/* Add / Edit modal */}
      <Modal
        open={isFormOpen}
        onClose={closeForm}
        title={editingBook ? 'Edit book' : 'Add a book'}
        description={
          editingBook
            ? 'Update the details in your collection.'
            : 'Add a book to your personal library.'
        }
        size="xl"
        closeOnOverlay={!isSaving}
        closeOnEscape={!isSaving}
        showCloseButton={!isSaving}
      >
        <BookForm
          initialValues={
            editingBook ? getBookFormValues(editingBook) : undefined
          }
          onSubmit={handleSaveBook}
          onCancel={closeForm}
          submitLabel={editingBook ? 'Save changes' : 'Add book'}
          isSubmitting={isSaving}
        />
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        open={Boolean(bookToDelete)}
        onClose={() => setBookToDelete(null)}
        title="Delete this book?"
        description="This removes the book and its associated reading-session history from Everleaf. This action cannot be undone."
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setBookToDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete book
            </Button>
          </>
        }
      >
        <p className="text-sm text-text-secondary">
          {bookToDelete
            ? 'You are about to delete “' + bookToDelete.title + '”.'
            : ''}
        </p>
      </Modal>
    </>
  )
}

export default Library

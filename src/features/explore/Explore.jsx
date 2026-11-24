
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'

import useAppDispatch from '../../hooks/useAppDispatch'
import useAppSelector from '../../hooks/useAppSelector'

import { addBook } from '../../store/slices/booksSlice'
import { addToWishlist } from '../../store/slices/wishlistSlice'

import {
  useSearchBooksQuery,
  useGetBookDetailsQuery,
} from '../../store/api/bookCatalogApi'

import { createBookRecord } from '../../services/bookService'

import { DEFAULT_WISHLIST_PRIORITY } from '../../utils/constants'

import PageHeader from '../../components/common/PageHeader'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import BookForm from '../../components/books/BookForm'
import BookCover from '../../components/books/BookCover'

import ExploreResults from './ExploreResults'

const CATEGORY_OPTIONS = [
  { value: 'Fiction', label: 'Fiction' },
  { value: 'Fantasy', label: 'Fantasy' },
  { value: 'Mystery', label: 'Mystery' },
  { value: 'Romance', label: 'Romance' },
  { value: 'Science', label: 'Science' },
  { value: 'History', label: 'History' },
  { value: 'Biography & Autobiography', label: 'Biography' },
  { value: 'Philosophy', label: 'Philosophy' },
  { value: 'Poetry', label: 'Poetry' },
  { value: 'Comics & Graphic Novels', label: 'Comics & Graphic Novels' },
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

function mapCatalogueBookToForm(book) {
  return {
    title: book.title || '',
    author: book.author || '',
    genre: book.genre === 'Uncategorized' ? '' : book.genre,
    description: book.description || '',
    totalPages: book.totalPages || 0,
    currentPage: 0,
    status: 'want-to-read',
    rating: null,
    review: '',
    coverUrl: book.coverUrl || '',
    notes: '',
  }
}

function Explore() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const wishlistItems = useAppSelector((state) => state.wishlist?.items ?? [])

  const [searchTerm, setSearchTerm] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  const [selectedBook, setSelectedBook] = useState(null)
  const [selectedDetailsBook, setSelectedDetailsBook] = useState(null)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const hasSearched = Boolean(submittedQuery.trim() || selectedCategory)

  const { data, isFetching, isError, error, refetch } = useSearchBooksQuery(
    {
      query: submittedQuery,
      category: selectedCategory,
      startIndex: 0,
      maxResults: 20,
    },
    {
      skip: !hasSearched,
    },
  )

  const books = data?.items || []
  const catalogueSource = data?.source || null

  const {
    data: detailedBook,
    isFetching: isLoadingDetails,
  } = useGetBookDetailsQuery(selectedDetailsBook, {
    skip: !isDetailsOpen || !selectedDetailsBook,
  })

  const displayBook = detailedBook || selectedDetailsBook

  const formInitialValues = useMemo(
    () => (selectedBook ? mapCatalogueBookToForm(selectedBook) : undefined),
    [selectedBook],
  )

  const openCatalogueBook = (book) => {
    setSelectedBook(book)
    setIsFormOpen(true)
  }

  const openBookDetails = (book) => {
    setSelectedDetailsBook(book)
    setIsDetailsOpen(true)
  }

  const closeBookDetails = () => {
    setIsDetailsOpen(false)
    setSelectedDetailsBook(null)
  }

  const openManualEntry = () => {
    setSelectedBook(null)
    setIsFormOpen(true)
  }

  const closeForm = () => {
    if (isSaving) return

    setIsFormOpen(false)
    setSelectedBook(null)
  }

  const handleSearch = (event) => {
    event.preventDefault()
    setSubmittedQuery(searchTerm.trim())
  }

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
  }

  const clearSearch = () => {
    setSearchTerm('')
    setSubmittedQuery('')
    setSelectedCategory('')
  }

  const handleAddToWishlist = (book) => {
    if (!book?.id) return

    const alreadyExists = wishlistItems.some(
      (item) => item.externalId === book.id,
    )

    if (alreadyExists) return

    dispatch(
      addToWishlist({
        id: createId(),
        title: book.title || 'Untitled book',
        author: book.author || 'Unknown author',
        priority: DEFAULT_WISHLIST_PRIORITY,
        note: '',
        coverUrl: book.coverUrl || '',
        externalId: book.id,
        dateAdded: new Date().toISOString(),
      }),
    )
  }

  const handleSaveBook = async (values) => {
    setIsSaving(true)

    try {
      const now = new Date().toISOString()

      const book = createBookRecord(values, {
        id: createId(),
        now,
      })

      dispatch(addBook(book))

      setIsFormOpen(false)
      setSelectedBook(null)

      navigate(`/books/${encodeURIComponent(book.id)}`)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Discover something new"
        title="Explore Books"
        description="Search the book catalogue and find your next favourite read."
        actions={
          <Button
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={openManualEntry}
          >
            Add manually
          </Button>
        }
      />

      <section className="mb-7 rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5">
        <form onSubmit={handleSearch}>
          <div className="grid grid-cols-1 items-end gap-4 lg:grid-cols-[minmax(0,1fr)_240px_auto]">
            <Input
              label="Search books"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Enter a title, author, or ISBN..."
              leadingIcon={<Search className="h-4 w-4" />}
            />

            <Select
              label="Browse by category"
              value={selectedCategory}
              onChange={(event) => handleCategoryChange(event.target.value)}
              placeholder="All categories"
              options={CATEGORY_OPTIONS}
            />

            <Button
              type="submit"
              size="lg"
              leftIcon={<Search className="h-4 w-4" />}
            >
              Search books
            </Button>
          </div>
        </form>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <p className="text-xs text-text-muted">
            Search by title, author, or ISBN. You can also browse categories.
          </p>

          <Button variant="ghost" size="sm" onClick={clearSearch}>
            Clear search
          </Button>
        </div>
      </section>

      <ExploreResults
        books={books}
        wishlistItems={wishlistItems}
        isLoading={isFetching}
        isError={isError}
        error={error}
        source={catalogueSource}
        onRetry={refetch}
        onAddToLibrary={openCatalogueBook}
        onAddToWishlist={handleAddToWishlist}
        onViewDetails={openBookDetails}
        hasSearched={hasSearched}
      />

      {/* Book Details Popup */}
      <Modal
        open={isDetailsOpen}
        onClose={closeBookDetails}
        title="Book Details"
        size="lg"
      >
        {displayBook && (
          <div className="space-y-5">
            {isLoadingDetails && (
              <p className="text-sm text-text-muted">
                Loading additional book information...
              </p>
            )}

            <div className="flex flex-col gap-5 sm:flex-row">
              <div className="w-36 shrink-0">
                <BookCover
                  src={displayBook.coverUrl}
                  title={displayBook.title}
                  author={displayBook.author}
                  className="max-h-56"
                />
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="font-display text-xl font-semibold text-text-primary">
                  {displayBook.title || 'Untitled book'}
                </h2>

                {displayBook.subtitle && (
                  <p className="mt-1 text-sm text-text-secondary">
                    {displayBook.subtitle}
                  </p>
                )}

                <p className="mt-2 text-sm text-text-secondary">
                  {displayBook.author || 'Unknown author'}
                </p>

                {displayBook.averageRating > 0 && (
                  <p className="mt-3 text-sm text-text-secondary">
                    ★ {displayBook.averageRating.toFixed(1)}
                    {displayBook.ratingsCount > 0 &&
                      ` (${displayBook.ratingsCount} ratings)`}
                  </p>
                )}

                {displayBook.genre &&
                  displayBook.genre !== 'Uncategorized' && (
                    <p className="mt-3 text-sm text-text-secondary">
                      Genre: {displayBook.genre}
                    </p>
                  )}

                {displayBook.publishedDate && (
                  <p className="mt-2 text-sm text-text-secondary">
                    Published: {displayBook.publishedDate}
                  </p>
                )}

                {displayBook.publisher && (
                  <p className="mt-2 text-sm text-text-secondary">
                    Publisher: {displayBook.publisher}
                  </p>
                )}

                {displayBook.totalPages > 0 && (
                  <p className="mt-2 text-sm text-text-secondary">
                    {displayBook.totalPages} pages
                  </p>
                )}

                {displayBook.language && (
                  <p className="mt-2 text-sm text-text-secondary">
                    Language: {displayBook.language}
                  </p>
                )}
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h3 className="font-display text-base font-semibold text-text-primary">
                About this book
              </h3>

              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-text-secondary">
                {displayBook.description ||
                  'No description is currently available for this book.'}
              </p>
            </div>

            {(displayBook.isbn13 || displayBook.isbn10) && (
              <p className="text-sm text-text-secondary">
                ISBN: {displayBook.isbn13 || displayBook.isbn10}
              </p>
            )}

            {displayBook.categories?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-text-primary">
                  Categories
                </h3>

                <div className="mt-2 flex flex-wrap gap-2">
                  {displayBook.categories.map((category) => (
                    <span
                      key={category}
                      className="rounded-full bg-surface-secondary px-3 py-1 text-xs text-text-secondary"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {displayBook.infoLink && (
              <a
                href={displayBook.infoLink}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-sm font-medium text-primary hover:underline"
              >
                More information about this book
              </a>
            )}

            {displayBook.previewLink && (
              <a
                href={displayBook.previewLink}
                target="_blank"
                rel="noreferrer"
                className="ml-4 inline-block text-sm font-medium text-primary hover:underline"
              >
                Preview book
              </a>
            )}

            <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
              <Button variant="outline" onClick={closeBookDetails}>
                Close
              </Button>

              <Button
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => {
                  const book = displayBook
                  closeBookDetails()
                  openCatalogueBook(book)
                }}
              >
                Add to library
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add to Library / Manual Entry Popup */}
      <Modal
        open={isFormOpen}
        onClose={closeForm}
        title={
          selectedBook ? 'Add book to your library' : 'Add a book manually'
        }
        description={
          selectedBook
            ? 'Review the catalogue information and make any changes before saving.'
            : 'Enter the details of the book you want to add.'
        }
        size="lg"
        closeOnOverlay={!isSaving}
        closeOnEscape={!isSaving}
      >
        <BookForm
          initialValues={formInitialValues}
          onSubmit={handleSaveBook}
          onCancel={closeForm}
          submitLabel="Save to my library"
          isSubmitting={isSaving}
        />
      </Modal>
    </>
  )
}

export default Explore

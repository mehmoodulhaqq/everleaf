import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Check,
  Clock3,
  FileText,
  MessageSquareQuote,
  Pencil,
  Plus,
  Save,
  Star,
  Trash2,
} from 'lucide-react'

import useAppDispatch from '../../hooks/useAppDispatch'
import useAppSelector from '../../hooks/useAppSelector'
import {
  deleteBook,
  deleteBookQuote,
  setBookProgress,
  setBookStatus,
  updateBook,
  updateBookNotes,
  addBookQuote,
} from '../../store/slices/booksSlice'
import { deleteSessionsByBookId } from '../../store/slices/sessionsSlice'
import { BOOK_STATUS_OPTIONS } from '../../utils/constants'
import { getBookProgressPercentage } from '../../utils/bookUtils'
import { sortSessionsByDate } from '../../utils/readingUtils'
import {
  getBookFormValues,
  prepareBookUpdate,
} from '../../services/bookService'

import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Modal from '../../components/common/Modal'
import PageHeader from '../../components/common/PageHeader'
import BookCover from '../../components/books/BookCover'
import BookStatusBadge from '../../components/books/BookStatusBadge'
import BookProgress from '../../components/books/BookProgress'
import BookForm from '../../components/books/BookForm'

function createId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return (
    'quote-' +
    Date.now().toString(36) +
    '-' +
    Math.random().toString(36).slice(2, 10)
  )
}

function formatDate(value) {
  if (!value) return 'Not recorded'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not recorded'

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

function formatDuration(minutes) {
  const total = Math.max(0, Number(minutes) || 0)

  if (total < 60) return Math.round(total) + ' min'

  const hours = Math.floor(total / 60)
  const remaining = Math.round(total % 60)

  return remaining ? hours + ' hr ' + remaining + ' min' : hours + ' hr'
}

function ReadingSessionHistory({ sessions }) {
  if (sessions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center">
        <Clock3 className="mx-auto h-7 w-7 text-text-muted" />

        <p className="mt-2 text-sm font-medium text-text-primary">
          No reading sessions yet
        </p>

        <p className="mt-1 text-xs text-text-secondary">
          Your reading activity for this book will appear here.
        </p>
      </div>
    )
  }

  return (
    <ul className="divide-y divide-border">
      {sessions.map((session) => (
        <li
          key={session.id}
          className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="text-sm font-medium text-text-primary">
              {formatDate(session.date)}
            </p>

            {session.note ? (
              <p className="mt-1 text-xs text-text-secondary">{session.note}</p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-text-secondary">
            <span>{Number(session.pagesRead) || 0} pages</span>
            <span>{formatDuration(session.durationMinutes)}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}

function BookDetails() {
  const { bookId } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const books = useAppSelector((state) => state.books.items)
  const sessions = useAppSelector((state) => state.sessions.items)

  const book = books.find((item) => item.id === bookId)

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [progressInput, setProgressInput] = useState(
    String(book?.currentPage ?? 0),
  )
  const [notesInput, setNotesInput] = useState(book?.notes ?? '')
  const [quoteText, setQuoteText] = useState('')
  const [quotePage, setQuotePage] = useState('')
  const [quoteError, setQuoteError] = useState('')

  const [previousBook, setPreviousBook] = useState(() => ({
    id: book?.id,
    currentPage: book?.currentPage,
    notes: book?.notes,
  }))

  if (
    previousBook.id !== book?.id ||
    previousBook.currentPage !== book?.currentPage ||
    previousBook.notes !== book?.notes
  ) {
    setPreviousBook({
      id: book?.id,
      currentPage: book?.currentPage,
      notes: book?.notes,
    })

    setProgressInput(String(book?.currentPage ?? 0))
    setNotesInput(book?.notes ?? '')
  }

  const bookSessions = useMemo(() => {
    return sortSessionsByDate(
      sessions.filter((session) => session.bookId === bookId),
      'desc',
    )
  }, [sessions, bookId])

  if (!book) {
    return (
      <section className="mx-auto max-w-xl py-16 text-center">
        <BookOpen className="mx-auto h-10 w-10 text-caramel" />

        <h1 className="mt-4 font-display text-2xl font-semibold text-text-primary">
          Book not found
        </h1>

        <p className="mt-2 text-sm text-text-secondary">
          This book may have been removed from your library.
        </p>

        <Button
          className="mt-5"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => navigate('/library')}
        >
          Back to My Library
        </Button>
      </section>
    )
  }

  const progress = getBookProgressPercentage(book)

  const handleSaveEdit = async (values) => {
    setIsSaving(true)

    try {
      const changes = prepareBookUpdate(book, values, new Date().toISOString())

      dispatch(
        updateBook({
          id: book.id,
          changes,
        }),
      )

      setIsEditOpen(false)
    } finally {
      setIsSaving(false)
    }
  }

  const handleStatusChange = (event) => {
    const status = event.target.value

    dispatch(
      setBookStatus({
        id: book.id,
        status,
        updatedAt: new Date().toISOString(),
      }),
    )
  }

  const handleProgressSave = (event) => {
    event.preventDefault()

    const nextPage = Number(progressInput)

    if (!Number.isInteger(nextPage) || nextPage < 0) return
    if (book.totalPages > 0 && nextPage > book.totalPages) return

    dispatch(
      setBookProgress({
        id: book.id,
        currentPage: nextPage,
        updatedAt: new Date().toISOString(),
      }),
    )
  }

  const handleNotesSave = (event) => {
    event.preventDefault()

    dispatch(
      updateBookNotes({
        id: book.id,
        notes: notesInput,
      }),
    )
  }

  const handleAddQuote = (event) => {
    event.preventDefault()

    const text = quoteText.trim()

    if (!text) {
      setQuoteError('Enter the quote before saving.')
      return
    }

    const page = quotePage.trim() === '' ? null : Number(quotePage)

    if (page !== null && (!Number.isInteger(page) || page < 1)) {
      setQuoteError('Page number must be a positive whole number.')
      return
    }

    dispatch(
      addBookQuote({
        id: book.id,
        quote: {
          id: createId(),
          text,
          page,
          createdAt: new Date().toISOString(),
        },
      }),
    )

    setQuoteText('')
    setQuotePage('')
    setQuoteError('')
  }

  const handleDeleteBook = () => {
    dispatch(deleteSessionsByBookId(book.id))
    dispatch(deleteBook(book.id))

    navigate('/library', { replace: true })
  }

  return (
    <>
      <div className="mb-5">
        <Link
          to="/library"
          className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-walnut"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Library
        </Link>
      </div>

      <PageHeader
        eyebrow="Your reading collection"
        title="Book Details"
        description="Review the book, update your progress, and keep your personal thoughts together."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              leftIcon={<Pencil className="h-4 w-4" />}
              onClick={() => setIsEditOpen(true)}
            >
              Edit book
            </Button>

            <Button
              variant="danger"
              leftIcon={<Trash2 className="h-4 w-4" />}
              onClick={() => setIsDeleteOpen(true)}
            >
              Delete
            </Button>
          </div>
        }
      />

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <div className="mx-auto w-full max-w-[220px] lg:mx-0">
          <BookCover
            src={book.coverUrl}
            title={book.title}
            author={book.author}
            className="rounded-2xl shadow-md"
          />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <BookStatusBadge status={book.status} />

            {book.rating ? (
              <span className="inline-flex items-center gap-1 text-sm text-text-secondary">
                <Star className="h-4 w-4 fill-caramel text-caramel" />
                {Number(book.rating).toFixed(1)} / 5
              </span>
            ) : null}
          </div>

          <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-text-primary sm:text-4xl">
            {book.title}
          </h2>

          <p className="mt-2 text-base text-text-secondary">{book.author}</p>

          <div className="mt-4 flex flex-wrap gap-2 text-xs text-text-secondary">
            {book.genre ? (
              <span className="rounded-full bg-surface-secondary px-3 py-1.5">
                {book.genre}
              </span>
            ) : null}

            {book.totalPages > 0 ? (
              <span className="rounded-full bg-surface-secondary px-3 py-1.5">
                {book.totalPages} pages
              </span>
            ) : null}
          </div>

          {book.description ? (
            <p className="mt-5 max-w-3xl whitespace-pre-line text-sm leading-7 text-text-secondary">
              {book.description}
            </p>
          ) : null}

          <div className="mt-6 rounded-2xl border border-border bg-surface p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-lg font-semibold text-text-primary">
                Reading progress
              </h3>

              <span className="text-sm font-semibold tabular-nums text-walnut">
                {progress}%
              </span>
            </div>

            <div className="mt-3">
              <BookProgress
                currentPage={book.currentPage}
                totalPages={book.totalPages}
              />
            </div>

            <form
              onSubmit={handleProgressSave}
              className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
            >
              <div className="w-full sm:max-w-48">
                <Input
                  label="Current page"
                  type="number"
                  min="0"
                  max={book.totalPages > 0 ? book.totalPages : undefined}
                  step="1"
                  value={progressInput}
                  onChange={(event) => setProgressInput(event.target.value)}
                />
              </div>

              <Button type="submit" leftIcon={<Save className="h-4 w-4" />}>
                Save progress
              </Button>
            </form>

            <div className="mt-4 max-w-xs">
              <Select
                label="Reading status"
                value={book.status}
                onChange={handleStatusChange}
                options={BOOK_STATUS_OPTIONS}
              />
            </div>

            <p className="mt-3 text-xs text-text-muted">
              Manual progress adjustments do not create reading-session records.
            </p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-surface p-4">
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <CalendarDays className="h-4 w-4" />
                Added to library
              </div>

              <p className="mt-2 text-sm font-medium text-text-primary">
                {formatDate(book.dateAdded)}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-surface p-4">
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <Check className="h-4 w-4" />
                Completed
              </div>

              <p className="mt-2 text-sm font-medium text-text-primary">
                {formatDate(book.dateCompleted)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-cognac" />
            <h3 className="font-display text-lg font-semibold text-text-primary">
              Personal notes
            </h3>
          </div>

          <form onSubmit={handleNotesSave}>
            <textarea
              rows={7}
              value={notesInput}
              onChange={(event) => setNotesInput(event.target.value)}
              placeholder="Capture your thoughts, reflections, and ideas..."
              className="w-full rounded-xl border border-border-strong bg-background p-3 text-sm leading-6 text-text-primary outline-none focus:border-focus focus:ring-2 focus:ring-focus/20"
            />

            <div className="mt-3 flex justify-end">
              <Button type="submit" leftIcon={<Save className="h-4 w-4" />}>
                Save notes
              </Button>
            </div>
          </form>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="mb-4 flex items-center gap-2">
            <MessageSquareQuote className="h-5 w-5 text-cognac" />
            <h3 className="font-display text-lg font-semibold text-text-primary">
              Memorable quotes
            </h3>
          </div>

          <form onSubmit={handleAddQuote} className="space-y-3">
            <label
              htmlFor="quote-text"
              className="block text-sm font-medium text-text-primary"
            >
              Quote
            </label>

            <textarea
              id="quote-text"
              rows={3}
              value={quoteText}
              onChange={(event) => setQuoteText(event.target.value)}
              placeholder="Write a passage you want to remember..."
              className="w-full rounded-xl border border-border-strong bg-background p-3 text-sm text-text-primary outline-none focus:border-focus focus:ring-2 focus:ring-focus/20"
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="w-full sm:max-w-40">
                <Input
                  label="Page (optional)"
                  type="number"
                  min="1"
                  step="1"
                  value={quotePage}
                  onChange={(event) => setQuotePage(event.target.value)}
                />
              </div>

              <Button type="submit" leftIcon={<Plus className="h-4 w-4" />}>
                Save quote
              </Button>
            </div>

            {quoteError ? (
              <p role="alert" className="text-xs text-danger">
                {quoteError}
              </p>
            ) : null}
          </form>

          <div className="mt-5 divide-y divide-border">
            {(book.quotes || []).length === 0 ? (
              <p className="py-4 text-sm text-text-muted">
                Your saved quotes will appear here.
              </p>
            ) : (
              (book.quotes || []).map((quote) => (
                <article key={quote.id} className="py-4">
                  <blockquote className="whitespace-pre-line text-sm leading-6 text-text-primary">
                    “{quote.text}”
                  </blockquote>

                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="text-xs text-text-muted">
                      {quote.page ? 'Page ' + quote.page : 'Page not specified'}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        dispatch(
                          deleteBookQuote({
                            bookId: book.id,
                            quoteId: quote.id,
                          }),
                        )
                      }
                      className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-danger"
                      aria-label="Delete saved quote"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-border bg-surface p-5">
        <div className="mb-3 flex items-center gap-2">
          <Clock3 className="h-5 w-5 text-cognac" />
          <h3 className="font-display text-lg font-semibold text-text-primary">
            Reading history
          </h3>
        </div>

        <ReadingSessionHistory sessions={bookSessions} />

        <p className="mt-3 text-xs text-text-muted">
          To add, edit, or remove a session, use the Reading Tracker.
        </p>
      </section>

      <Modal
        open={isEditOpen}
        onClose={() => !isSaving && setIsEditOpen(false)}
        title="Edit book details"
        description="Update the information saved in your library."
        size="xl"
        closeOnOverlay={!isSaving}
        closeOnEscape={!isSaving}
        showCloseButton={!isSaving}
      >
        <BookForm
          initialValues={getBookFormValues(book)}
          onSubmit={handleSaveEdit}
          onCancel={() => setIsEditOpen(false)}
          submitLabel="Save changes"
          isSubmitting={isSaving}
        />
      </Modal>

      <Modal
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete this book?"
        description="The book and its associated reading-session history will be removed. This cannot be undone."
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>

            <Button variant="danger" onClick={handleDeleteBook}>
              Delete book
            </Button>
          </>
        }
      >
        <p className="text-sm text-text-secondary">
          Delete “{book.title}” from your library?
        </p>
      </Modal>
    </>
  )
}

export default BookDetails

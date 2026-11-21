import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'

import useAppDispatch from '../../hooks/useAppDispatch'
import useAppSelector from '../../hooks/useAppSelector'

import {
  addSession,
  updateSession,
  deleteSession,
} from '../../store/slices/sessionsSlice'

import { setBookProgress, setBookStatus } from '../../store/slices/booksSlice'

import { BOOK_STATUS } from '../../utils/constants'

import {
  sortSessionsByDate,
  getSessionPagesRead,
} from '../../utils/readingUtils'

import { validateReadingSession } from '../../utils/validationUtils'

import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Modal from '../../components/common/Modal'
import PageHeader from '../../components/common/PageHeader'
import ReadingProgress from '../../components/reading/ReadingProgress'
import ReadingSessionForm from '../../components/reading/ReadingSessionForm'
import ReadingHistory from '../../components/reading/ReadingHistory'

function createId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return `session-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

/**
 * Applies only the difference between the previous and next
 * session page counts. This avoids overwriting manual progress.
 */
function applyBookProgressDelta(dispatch, book, delta) {
  if (!book || delta === 0) return

  const totalPages = Math.max(0, Number(book.totalPages) || 0)
  const currentPage = Math.max(0, Number(book.currentPage) || 0)

  const nextPage = Math.max(
    0,
    totalPages > 0
      ? Math.min(totalPages, currentPage + delta)
      : currentPage + delta,
  )

  dispatch(
    setBookProgress({
      id: book.id,
      currentPage: nextPage,
      updatedAt: new Date().toISOString(),
    }),
  )
}

function ReadingTracker() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const books = useAppSelector((state) => state.books?.items ?? [])

  const sessions = useAppSelector((state) => state.sessions?.items ?? [])

  const [search, setSearch] = useState('')
  const [bookFilter, setBookFilter] = useState('all')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingSession, setEditingSession] = useState(null)
  const [sessionToDelete, setSessionToDelete] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const sortedSessions = useMemo(
    () => sortSessionsByDate(sessions, 'desc'),
    [sessions],
  )

  const filteredSessions = useMemo(() => {
    const term = search.trim().toLowerCase()

    return sortedSessions.filter((session) => {
      const book = books.find((item) => item.id === session.bookId)

      const matchesBook = bookFilter === 'all' || session.bookId === bookFilter

      const matchesSearch =
        !term ||
        (book?.title || '').toLowerCase().includes(term) ||
        (book?.author || '').toLowerCase().includes(term) ||
        (session.note || '').toLowerCase().includes(term)

      return matchesBook && matchesSearch
    })
  }, [sortedSessions, books, search, bookFilter])

  const openAddForm = () => {
    setEditingSession(null)
    setFormError('')
    setIsFormOpen(true)
  }

  const openEditForm = (session) => {
    setEditingSession(session)
    setFormError('')
    setIsFormOpen(true)
  }

  const closeForm = () => {
    if (isSaving) return

    setIsFormOpen(false)
    setEditingSession(null)
    setFormError('')
  }

  const handleSaveSession = async (values) => {
    setFormError('')

    const validation = validateReadingSession(values)

    if (!validation.isValid) {
      setFormError(
        Object.values(validation.errors)[0] ||
          'Please check the session details.',
      )
      return
    }

    const book = books.find((item) => item.id === values.bookId)

    if (!book) {
      setFormError('The selected book could not be found.')
      return
    }

    // Editing cannot move a session to another book.
    if (editingSession && values.bookId !== editingSession.bookId) {
      setFormError('A session must remain linked to its original book.')
      return
    }

    const nextPages = Number(values.pagesRead) || 0
    const previousPages = editingSession
      ? getSessionPagesRead(editingSession)
      : 0

    // Remove the old session contribution when calculating
    // the progress available for an edited session.
    const currentPage = Math.max(0, Number(book.currentPage) || 0)

    const progressWithoutPreviousSession = Math.max(
      0,
      currentPage - previousPages,
    )

    const remainingPages =
      book.totalPages > 0
        ? Math.max(0, book.totalPages - progressWithoutPreviousSession)
        : Infinity

    if (nextPages > remainingPages) {
      setFormError(
        book.totalPages > 0
          ? `You can record up to ${remainingPages} more pages for this book.`
          : 'The entered page count is invalid.',
      )
      return
    }

    setIsSaving(true)

    try {
      const now = new Date().toISOString()

      if (editingSession) {
        dispatch(
          updateSession({
            id: editingSession.id,
            changes: {
              date: values.date,
              pagesRead: nextPages,
              durationMinutes: Number(values.durationMinutes) || 0,
              note: values.note || '',
              startPage: null,
              endPage: null,
            },
          }),
        )

        applyBookProgressDelta(dispatch, book, nextPages - previousPages)
      } else {
        const session = {
          id: createId(),
          bookId: values.bookId,
          date: values.date,
          pagesRead: nextPages,
          durationMinutes: Number(values.durationMinutes) || 0,
          startPage: null,
          endPage: null,
          note: values.note || '',
          createdAt: now,
        }

        // A first reading session moves a book into Reading status.
        if (book.status === BOOK_STATUS.WANT_TO_READ) {
          dispatch(
            setBookStatus({
              id: book.id,
              status: BOOK_STATUS.READING,
              updatedAt: now,
            }),
          )
        }

        dispatch(addSession(session))

        applyBookProgressDelta(dispatch, book, nextPages)
      }

      setIsFormOpen(false)
      setEditingSession(null)
      setFormError('')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteSession = () => {
    if (!sessionToDelete) return

    const book = books.find((item) => item.id === sessionToDelete.bookId)

    const pages = getSessionPagesRead(sessionToDelete)

    dispatch(deleteSession(sessionToDelete.id))

    applyBookProgressDelta(dispatch, book, -pages)

    setSessionToDelete(null)
  }

  const totalPages = filteredSessions.reduce(
    (total, session) => total + getSessionPagesRead(session),
    0,
  )

  return (
    <>
      <PageHeader
        eyebrow="Your reading activity"
        title="Reading Tracker"
        description="Record your reading sessions and keep track of your daily progress."
        actions={
          <Button
            onClick={openAddForm}
            leftIcon={<Plus className="h-4 w-4" />}
            disabled={books.length === 0}
          >
            Log a session
          </Button>
        }
      />

      <ReadingProgress sessions={sessions} />

      <section className="mt-6 rounded-2xl border border-border bg-surface p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="w-full lg:max-w-sm">
            <Input
              label="Search reading history"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search books, authors, or notes"
              leadingIcon={<Search className="h-4 w-4" />}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label
              htmlFor="tracker-book-filter"
              className="text-xs font-medium text-text-secondary"
            >
              Book
            </label>

            <select
              id="tracker-book-filter"
              value={bookFilter}
              onChange={(event) => setBookFilter(event.target.value)}
              className="min-h-10 min-w-40 rounded-lg border border-border-strong bg-surface px-3 text-sm text-text-primary"
            >
              <option value="all">All books</option>

              {books.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title}
                </option>
              ))}
            </select>

            <p className="text-xs text-text-muted">
              {filteredSessions.length} sessions · {totalPages} pages
            </p>
          </div>
        </div>
      </section>

      {books.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border p-8 text-center">
          <h2 className="font-display text-lg font-semibold text-text-primary">
            Add a book first
          </h2>

          <p className="mt-2 text-sm text-text-secondary">
            You need a book in your library before you can log a reading
            session.
          </p>

          <Button
            className="mt-4"
            variant="outline"
            onClick={() => navigate('/library')}
          >
            Go to My Library
          </Button>
        </div>
      ) : (
        <div className="mt-6">
          <ReadingHistory
            sessions={filteredSessions}
            books={books}
            onEdit={openEditForm}
            onDelete={setSessionToDelete}
            emptyTitle="No matching sessions"
            emptyDescription="Try changing your search or book filter, or log a new session."
          />
        </div>
      )}

      <Modal
        open={isFormOpen}
        onClose={closeForm}
        title={
          editingSession ? 'Edit reading session' : 'Log a reading session'
        }
        description="Record the pages and time you spent reading."
        size="lg"
      >
        {formError ? (
          <p
            role="alert"
            className="mb-4 rounded-lg bg-danger/10 p-3 text-sm text-danger"
          >
            {formError}
          </p>
        ) : null}

        <ReadingSessionForm
          books={books}
          initialValues={editingSession || undefined}
          onSubmit={handleSaveSession}
          onCancel={closeForm}
          isSubmitting={isSaving}
          submitLabel={editingSession ? 'Save changes' : 'Save session'}
        />
      </Modal>

      <Modal
        open={Boolean(sessionToDelete)}
        onClose={() => setSessionToDelete(null)}
        title="Delete this session?"
        description="The recorded pages will also be subtracted from the book's current progress."
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setSessionToDelete(null)}>
              Cancel
            </Button>

            <Button variant="danger" onClick={handleDeleteSession}>
              Delete session
            </Button>
          </>
        }
      >
        <p className="text-sm text-text-secondary">
          This reading activity will be permanently removed.
        </p>
      </Modal>
    </>
  )
}

export default ReadingTracker

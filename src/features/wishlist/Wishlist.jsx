import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Plus, Search } from 'lucide-react'

import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Modal from '../../components/common/Modal'
import EmptyState from '../../components/common/EmptyState'
import PageHeader from '../../components/common/PageHeader'

import WishlistGrid from '../../components/wishlist/WishlistGrid'

import useAppDispatch from '../../hooks/useAppDispatch'
import useAppSelector from '../../hooks/useAppSelector'

import {
  addToWishlist,
  updateWishlistItem,
  removeFromWishlist,
} from '../../store/slices/wishlistSlice'

import { addBook } from '../../store/slices/booksSlice'
import { WISHLIST_PRIORITY_OPTIONS } from '../../utils/constants'
import { createBookRecord } from '../../services/bookService'

const createId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return `book-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

const INITIAL_FORM = {
  title: '',
  author: '',
  priority: 'medium',
  note: '',
  coverUrl: '',
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Recently added' },
  { value: 'oldest', label: 'Oldest added' },
  { value: 'title', label: 'Title A–Z' },
  { value: 'priority', label: 'Highest priority' },
]

const PRIORITY_ORDER = {
  high: 3,
  medium: 2,
  low: 1,
}

function Wishlist() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const wishlist = useAppSelector((state) => state.wishlist?.items ?? [])

  const books = useAppSelector((state) => state.books?.items ?? [])

  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [form, setForm] = useState(INITIAL_FORM)
  const [formError, setFormError] = useState('')

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase()

    const results = wishlist.filter((item) => {
      return (
        !query ||
        item.title?.toLowerCase().includes(query) ||
        item.author?.toLowerCase().includes(query) ||
        item.note?.toLowerCase().includes(query)
      )
    })

    return [...results].sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title)
      }

      if (sortBy === 'oldest') {
        return String(a.dateAdded || '').localeCompare(
          String(b.dateAdded || ''),
        )
      }

      if (sortBy === 'priority') {
        return (
          (PRIORITY_ORDER[b.priority] || 0) - (PRIORITY_ORDER[a.priority] || 0)
        )
      }

      return String(b.dateAdded || '').localeCompare(String(a.dateAdded || ''))
    })
  }, [wishlist, search, sortBy])

  const openAddModal = () => {
    setEditingItem(null)
    setForm(INITIAL_FORM)
    setFormError('')
    setModalOpen(true)
  }

  const openEditModal = (item) => {
    setEditingItem(item)

    setForm({
      title: item.title || '',
      author: item.author || '',
      priority: item.priority || 'medium',
      note: item.note || '',
      coverUrl: item.coverUrl || '',
    })

    setFormError('')
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingItem(null)
    setForm(INITIAL_FORM)
    setFormError('')
  }

  const handleFieldChange = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!form.title.trim()) {
      setFormError('Please enter a book title.')
      return
    }

    const normalized = {
      title: form.title.trim(),
      author: form.author.trim() || 'Unknown author',
      priority: form.priority,
      note: form.note.trim(),
      coverUrl: form.coverUrl.trim(),
    }

    if (editingItem) {
      dispatch(
        updateWishlistItem({
          id: editingItem.id,
          changes: normalized,
        }),
      )
    } else {
      dispatch(
        addToWishlist({
          id: createId(),
          ...normalized,
          externalId: null,
          dateAdded: new Date().toISOString(),
        }),
      )
    }

    closeModal()
  }

  const handleRemove = (id) => {
    dispatch(removeFromWishlist(id))
  }

  const handleMoveToLibrary = (item) => {
    const existingBook = books.find((book) => {
      return (
        book.title.trim().toLowerCase() === item.title.trim().toLowerCase() &&
        book.author.trim().toLowerCase() === item.author.trim().toLowerCase()
      )
    })

    if (existingBook) {
      dispatch(removeFromWishlist(item.id))

      navigate(`/books/${encodeURIComponent(existingBook.id)}`)
      return
    }

    const id = createId()
    const now = new Date().toISOString()

    const bookRecord = createBookRecord(
      {
        title: item.title,
        author: item.author,
        coverUrl: item.coverUrl,
        status: 'want-to-read',
      },
      { id, now },
    )

    dispatch(addBook(bookRecord))
    dispatch(removeFromWishlist(item.id))

    navigate(`/books/${encodeURIComponent(id)}`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Your next chapters"
        title="My Wishlist"
        description="Keep track of the books you hope to read next."
        actions={
          <Button
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={openAddModal}
          >
            Add a book
          </Button>
        }
      />

      <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-text-secondary">Books saved for later</p>

            <p className="mt-1 font-display text-3xl font-semibold text-text-primary">
              {wishlist.length}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:w-2/3">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search title, author, or note..."
              leadingIcon={<Search className="h-4 w-4" />}
              aria-label="Search wishlist"
            />

            <Select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              options={SORT_OPTIONS}
              aria-label="Sort wishlist"
              placeholder="Sort by"
            />
          </div>
        </div>
      </section>

      {wishlist.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your wishlist is waiting"
          description="Save books you would like to read. You can add them manually or save books from Explore."
          action={
            <Button
              className="mt-5"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={openAddModal}
            >
              Add your first book
            </Button>
          }
        />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matching books"
          description="Try another title, author, or search term."
          action={
            <Button
              className="mt-5"
              variant="outline"
              onClick={() => setSearch('')}
            >
              Clear search
            </Button>
          }
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-secondary">
              Showing {filteredItems.length} of {wishlist.length} books
            </p>
          </div>

          <WishlistGrid
            items={filteredItems}
            onEdit={openEditModal}
            onMoveToLibrary={handleMoveToLibrary}
            onRemove={handleRemove}
          />
        </>
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingItem ? 'Edit wishlist book' : 'Add to wishlist'}
        description="Keep the details you want to remember about this book."
        footer={
          <>
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>

            <Button type="submit" form="wishlist-form">
              {editingItem ? 'Save changes' : 'Add book'}
            </Button>
          </>
        }
      >
        <form id="wishlist-form" onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Book title"
            value={form.title}
            onChange={(event) => handleFieldChange('title', event.target.value)}
            placeholder="Enter book title"
            required
            error={formError}
          />

          <Input
            label="Author"
            value={form.author}
            onChange={(event) =>
              handleFieldChange('author', event.target.value)
            }
            placeholder="Enter author name"
          />

          <Select
            label="Reading priority"
            value={form.priority}
            onChange={(event) =>
              handleFieldChange('priority', event.target.value)
            }
            options={WISHLIST_PRIORITY_OPTIONS}
          />

          <Input
            label="Cover image URL"
            value={form.coverUrl}
            onChange={(event) =>
              handleFieldChange('coverUrl', event.target.value)
            }
            placeholder="Optional image URL"
          />

          <div>
            <label
              htmlFor="wishlist-note"
              className="mb-1.5 block text-sm font-medium text-text-primary"
            >
              Personal note
            </label>

            <textarea
              id="wishlist-note"
              value={form.note}
              onChange={(event) =>
                handleFieldChange('note', event.target.value)
              }
              rows={3}
              maxLength={500}
              placeholder="Why would you like to read this book?"
              className="w-full rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-focus focus:ring-2 focus:ring-focus/20"
            />
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Wishlist

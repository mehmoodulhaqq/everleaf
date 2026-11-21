import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { BOOK_STATUS_OPTIONS, DEFAULT_BOOK_STATUS } from '../../utils/constants'
import Button from '../common/Button'
import Input from '../common/Input'
import Select from '../common/Select'

const bookFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Please enter the book title.')
      .max(200, 'Title is too long.'),
    author: z
      .string()
      .trim()
      .min(1, 'Please enter the author.')
      .max(160, 'Author name is too long.'),
    genre: z.string().trim().max(80, 'Genre is too long.'),
    description: z.string().trim().max(5000, 'Description is too long.'),
    totalPages: z.coerce
      .number()
      .int('Enter a whole number.')
      .min(0, 'Pages cannot be negative.'),
    currentPage: z.coerce
      .number()
      .int('Enter a whole number.')
      .min(0, 'Page cannot be negative.'),
    status: z.enum(['want-to-read', 'reading', 'completed', 'paused']),
    rating: z.preprocess(
      (value) =>
        value === '' || value === null || value === undefined
          ? null
          : Number(value),
      z
        .number()
        .min(1, 'Rating must be at least 1.')
        .max(5, 'Rating cannot exceed 5.')
        .nullable(),
    ),
    review: z.string().trim().max(2000, 'Review is too long.'),
    coverUrl: z.union([
      z.literal(''),
      z.string().url('Enter a valid cover URL.'),
    ]),
    notes: z.string().trim().max(5000, 'Notes are too long.'),
  })
  .superRefine((values, context) => {
    if (values.totalPages > 0 && values.currentPage > values.totalPages) {
      context.addIssue({
        code: 'custom',
        path: ['currentPage'],
        message: 'Current page cannot exceed the total page count.',
      })
    }
  })

const EMPTY_VALUES = {
  title: '',
  author: '',
  genre: '',
  description: '',
  totalPages: 0,
  currentPage: 0,
  status: DEFAULT_BOOK_STATUS,
  rating: null,
  review: '',
  coverUrl: '',
  notes: '',
}

function BookForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = 'Save book',
  isSubmitting = false,
  className = '',
}) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm({
    resolver: zodResolver(bookFormSchema),
    defaultValues: { ...EMPTY_VALUES, ...initialValues },
  })

  useEffect(() => {
    reset({ ...EMPTY_VALUES, ...initialValues })
  }, [initialValues, reset])

  const totalPages = Number(useWatch({ control, name: 'totalPages' })) || 0

  const busy = isSubmitting || isFormSubmitting

  const submitValidForm = (values) => {
    const normalized = {
      ...values,
      title: values.title.trim(),
      author: values.author.trim() || 'Unknown author',
      genre: values.genre.trim() || 'Uncategorized',
      totalPages: Number(values.totalPages),
      currentPage: Number(values.currentPage),
      rating: values.rating === '' ? null : values.rating,
      coverUrl: values.coverUrl.trim(),
    }

    return onSubmit?.(normalized)
  }

  return (
    <form
      onSubmit={handleSubmit(submitValidForm)}
      className={['space-y-5', className].filter(Boolean).join(' ')}
      noValidate
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Book title"
          required
          placeholder="e.g. The Master and Margarita"
          error={errors.title?.message}
          {...register('title')}
        />
        <Input
          label="Author"
          required
          placeholder="e.g. Mikhail Bulgakov"
          error={errors.author?.message}
          {...register('author')}
        />
        <Input
          label="Genre"
          placeholder="e.g. Literary fiction"
          error={errors.genre?.message}
          {...register('genre')}
        />
        <Input
          label="Cover image URL"
          type="url"
          placeholder="https://..."
          error={errors.coverUrl?.message}
          {...register('coverUrl')}
        />
        <Input
          label="Total pages"
          type="number"
          min="0"
          step="1"
          error={errors.totalPages?.message}
          {...register('totalPages')}
        />
        <Input
          label="Current page"
          type="number"
          min="0"
          max={totalPages > 0 ? totalPages : undefined}
          step="1"
          error={errors.currentPage?.message}
          {...register('currentPage')}
        />
        <Select
          label="Reading status"
          options={BOOK_STATUS_OPTIONS}
          error={errors.status?.message}
          {...register('status')}
        />
        <Input
          label="Personal rating (1–5)"
          type="number"
          min="1"
          max="5"
          step="0.5"
          placeholder="Not rated"
          error={errors.rating?.message}
          {...register('rating')}
        />
      </div>

      <div>
        <label
          htmlFor="book-description"
          className="mb-1.5 block text-sm font-medium text-text-primary"
        >
          Description
        </label>
        <textarea
          id="book-description"
          rows={3}
          placeholder="A short description of the book..."
          className="w-full rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-focus focus:ring-2 focus:ring-focus/20"
          {...register('description')}
        />
        {errors.description?.message ? (
          <p role="alert" className="mt-1.5 text-xs text-danger">
            {errors.description.message}
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="book-review"
          className="mb-1.5 block text-sm font-medium text-text-primary"
        >
          Personal review
        </label>
        <textarea
          id="book-review"
          rows={3}
          placeholder="What did you think about this book?"
          className="w-full rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-focus focus:ring-2 focus:ring-focus/20"
          {...register('review')}
        />
        {errors.review?.message ? (
          <p role="alert" className="mt-1.5 text-xs text-danger">
            {errors.review.message}
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="book-notes"
          className="mb-1.5 block text-sm font-medium text-text-primary"
        >
          Personal notes
        </label>
        <textarea
          id="book-notes"
          rows={3}
          placeholder="Save your thoughts, ideas, or reading notes..."
          className="w-full rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-focus focus:ring-2 focus:ring-focus/20"
          {...register('notes')}
        />
        {errors.notes?.message ? (
          <p role="alert" className="mt-1.5 text-xs text-danger">
            {errors.notes.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col-reverse justify-end gap-2 border-t border-border pt-4 sm:flex-row">
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={busy}
          >
            Cancel
          </Button>
        ) : null}
        <Button type="submit" loading={busy} disabled={busy}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

export default BookForm

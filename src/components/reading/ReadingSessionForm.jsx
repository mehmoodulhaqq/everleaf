import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import Button from '../common/Button'
import Input from '../common/Input'
import Select from '../common/Select'

import { toISODate } from '../../utils/dateUtils'

const sessionSchema = z.object({
  bookId: z.string().min(1, 'Please select a book.'),
  date: z.string().min(1, 'Please choose a reading date.'),
  pagesRead: z.coerce
    .number()
    .int('Pages must be a whole number.')
    .min(0, 'Pages cannot be negative.'),
  durationMinutes: z.coerce
    .number()
    .int('Duration must be a whole number.')
    .min(0, 'Duration cannot be negative.'),
  note: z.string().max(500, 'Notes cannot exceed 500 characters.'),
})

function ReadingSessionForm({
  books = [],
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = 'Save session',
}) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      bookId: '',
      date: toISODate(),
      pagesRead: 0,
      durationMinutes: 0,
      note: '',
    },
  })

  useEffect(() => {
    reset({
      bookId: initialValues?.bookId || '',
      date: initialValues?.date || toISODate(),
      pagesRead: Number(initialValues?.pagesRead ?? 0),
      durationMinutes: Number(initialValues?.durationMinutes ?? 0),
      note: initialValues?.note || '',
    })
  }, [initialValues, reset])

  const selectedBookId = useWatch({
    control,
    name: 'bookId',
  })

  const selectedBook = books.find((book) => book.id === selectedBookId)

  const bookOptions = books.map((book) => ({
    value: book.id,
    label: book.author ? `${book.title} — ${book.author}` : book.title,
  }))

  const submit = (values) => {
    onSubmit({
      ...values,
      pagesRead: Number(values.pagesRead),
      durationMinutes: Number(values.durationMinutes),
      note: values.note.trim(),
    })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <Select
        label="Book"
        required
        {...register('bookId')}
        value={selectedBookId}
        options={bookOptions}
        placeholder="Choose a book"
        error={errors.bookId?.message}
      />

      {selectedBook ? (
        <p className="text-xs text-text-muted">
          Current progress: {Number(selectedBook.currentPage) || 0}
          {selectedBook.totalPages
            ? ` / ${selectedBook.totalPages} pages`
            : ' pages'}
        </p>
      ) : null}

      <Input
        label="Reading date"
        type="date"
        required
        {...register('date')}
        error={errors.date?.message}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          label="Pages read"
          type="number"
          min="0"
          step="1"
          required
          {...register('pagesRead')}
          error={errors.pagesRead?.message}
        />

        <Input
          label="Duration (minutes)"
          type="number"
          min="0"
          step="1"
          required
          {...register('durationMinutes')}
          error={errors.durationMinutes?.message}
        />
      </div>

      <div>
        <label
          htmlFor="session-note"
          className="mb-1.5 block text-sm font-medium text-text-primary"
        >
          Notes (optional)
        </label>

        <textarea
          id="session-note"
          rows={3}
          maxLength={500}
          {...register('note')}
          placeholder="What did you read or think about?"
          aria-invalid={Boolean(errors.note)}
          className="w-full rounded-lg border border-border-strong bg-surface p-3 text-sm text-text-primary outline-none focus:border-focus focus:ring-2 focus:ring-focus/20"
        />

        {errors.note ? (
          <p role="alert" className="mt-1 text-xs text-danger">
            {errors.note.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          loading={isSubmitting}
          disabled={isSubmitting || books.length === 0}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

export default ReadingSessionForm

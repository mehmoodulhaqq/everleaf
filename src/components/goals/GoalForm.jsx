import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import Button from '../common/Button'
import Input from '../common/Input'
import Select from '../common/Select'

import {
  GOAL_PERIODS,
  GOAL_TYPES,
  GOAL_TYPE_OPTIONS,
  GOAL_PERIOD_OPTIONS,
} from '../../utils/constants'

const currentDate = new Date()

const goalSchema = z
  .object({
    type: z.enum([
      GOAL_TYPES.BOOKS_COMPLETED,
      GOAL_TYPES.PAGES_READ,
      GOAL_TYPES.READING_DAYS,
    ]),
    period: z.enum([GOAL_PERIODS.MONTHLY, GOAL_PERIODS.ANNUAL]),
    target: z.coerce
      .number()
      .int('Target must be a whole number.')
      .min(1, 'Target must be at least 1.'),
    year: z.coerce
      .number()
      .int()
      .min(1900, 'Enter a valid year.')
      .max(9999, 'Enter a valid year.'),
    month: z.coerce.number().optional(),
  })
  .superRefine((values, context) => {
    if (
      values.period === GOAL_PERIODS.MONTHLY &&
      (!Number.isInteger(values.month) || values.month < 1 || values.month > 12)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['month'],
        message: 'Choose a valid month.',
      })
    }
  })

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => ({
  value: String(index + 1),
  label: new Date(2000, index, 1).toLocaleDateString(undefined, {
    month: 'long',
  }),
}))

function GoalForm({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = 'Save goal',
}) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      type: GOAL_TYPES.BOOKS_COMPLETED,
      period: GOAL_PERIODS.ANNUAL,
      target: 12,
      year: currentDate.getFullYear(),
      month: currentDate.getMonth() + 1,
    },
  })

  useEffect(() => {
    reset({
      type: initialValues?.type || GOAL_TYPES.BOOKS_COMPLETED,
      period: initialValues?.period || GOAL_PERIODS.ANNUAL,
      target: Number(initialValues?.target ?? 12),
      year: Number(initialValues?.year ?? currentDate.getFullYear()),
      month: Number(initialValues?.month ?? currentDate.getMonth() + 1),
    })
  }, [initialValues, reset])

  const selectedPeriod = useWatch({
    control,
    name: 'period',
  })

  const selectedType = useWatch({
    control,
    name: 'type',
  })

  const selectedMonth = useWatch({
    control,
    name: 'month',
  })

  const targetLabel =
    selectedType === GOAL_TYPES.BOOKS_COMPLETED
      ? 'Books to complete'
      : selectedType === GOAL_TYPES.PAGES_READ
        ? 'Pages to read'
        : 'Days to read'

  const submit = (values) => {
    onSubmit({
      ...values,
      target: Number(values.target),
      year: Number(values.year),
      month:
        values.period === GOAL_PERIODS.MONTHLY ? Number(values.month) : null,
    })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <Select
        label="Goal type"
        value={selectedType}
        onChange={(event) =>
          setValue('type', event.target.value, {
            shouldValidate: true,
          })
        }
        options={GOAL_TYPE_OPTIONS}
        error={errors.type?.message}
      />

      <Select
        label="Goal period"
        value={selectedPeriod}
        onChange={(event) =>
          setValue('period', event.target.value, {
            shouldValidate: true,
          })
        }
        options={GOAL_PERIOD_OPTIONS}
        error={errors.period?.message}
      />

      <Input
        label={targetLabel}
        type="number"
        min="1"
        step="1"
        {...register('target')}
        error={errors.target?.message}
      />

      <Input
        label="Year"
        type="number"
        min="1900"
        max="9999"
        step="1"
        {...register('year')}
        error={errors.year?.message}
      />

      {selectedPeriod === GOAL_PERIODS.MONTHLY ? (
        <Select
          label="Month"
          value={String(selectedMonth)}
          onChange={(event) =>
            setValue('month', Number(event.target.value), {
              shouldValidate: true,
            })
          }
          options={MONTH_OPTIONS}
          error={errors.month?.message}
        />
      ) : null}

      <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>

        <Button type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

export default GoalForm

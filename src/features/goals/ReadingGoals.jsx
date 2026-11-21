import { useMemo, useState } from 'react'
import { Plus, Target } from 'lucide-react'

import useAppDispatch from '../../hooks/useAppDispatch'
import useAppSelector from '../../hooks/useAppSelector'

import { addGoal, updateGoal, deleteGoal } from '../../store/slices/goalsSlice'

import { validateGoal } from '../../utils/validationUtils'

import { GOAL_PERIODS } from '../../utils/constants'

import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import PageHeader from '../../components/common/PageHeader'
import GoalCard from '../../components/goals/GoalCard'
import GoalForm from '../../components/goals/GoalForm'

function createId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return `goal-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

function ReadingGoals() {
  const dispatch = useAppDispatch()

  const goals = useAppSelector((state) => state.goals.items)
  const books = useAppSelector((state) => state.books.items)
  const sessions = useAppSelector((state) => state.sessions.items)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [goalToDelete, setGoalToDelete] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const sortedGoals = useMemo(() => {
    return [...goals].sort((first, second) => {
      if (first.year !== second.year) {
        return second.year - first.year
      }

      if (first.period !== second.period) {
        return first.period === GOAL_PERIODS.ANNUAL ? -1 : 1
      }

      return (first.month || 0) - (second.month || 0)
    })
  }, [goals])

  const annualGoals = sortedGoals.filter(
    (goal) => goal.period === GOAL_PERIODS.ANNUAL,
  )

  const monthlyGoals = sortedGoals.filter(
    (goal) => goal.period === GOAL_PERIODS.MONTHLY,
  )

  const openAddForm = () => {
    setEditingGoal(null)
    setFormError('')
    setIsFormOpen(true)
  }

  const openEditForm = (goal) => {
    setEditingGoal(goal)
    setFormError('')
    setIsFormOpen(true)
  }

  const closeForm = () => {
    if (isSaving) return

    setIsFormOpen(false)
    setEditingGoal(null)
    setFormError('')
  }

  const handleSaveGoal = async (values) => {
    setFormError('')

    const validation = validateGoal(values)

    if (!validation.isValid) {
      setFormError(
        Object.values(validation.errors)[0] || 'Please check the goal details.',
      )
      return
    }

    setIsSaving(true)

    try {
      if (editingGoal) {
        dispatch(
          updateGoal({
            id: editingGoal.id,
            changes: {
              type: values.type,
              period: values.period,
              target: Number(values.target),
              year: Number(values.year),
              month:
                values.period === GOAL_PERIODS.MONTHLY
                  ? Number(values.month)
                  : null,
            },
          }),
        )
      } else {
        dispatch(
          addGoal({
            id: createId(),
            type: values.type,
            period: values.period,
            target: Number(values.target),
            year: Number(values.year),
            month:
              values.period === GOAL_PERIODS.MONTHLY
                ? Number(values.month)
                : null,
            startDate: null,
            endDate: null,
            createdAt: new Date().toISOString(),
          }),
        )
      }

      setIsFormOpen(false)
      setEditingGoal(null)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteGoal = () => {
    if (!goalToDelete) return

    dispatch(deleteGoal(goalToDelete.id))
    setGoalToDelete(null)
  }

  const renderGoalGroup = (items, emptyMessage) => {
    if (items.length === 0) {
      return (
        <div className="rounded-xl border border-dashed border-border px-5 py-8 text-center">
          <Target className="mx-auto h-7 w-7 text-text-muted" />

          <p className="mt-2 text-sm text-text-secondary">{emptyMessage}</p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {items.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            books={books}
            sessions={sessions}
            onEdit={openEditForm}
            onDelete={setGoalToDelete}
          />
        ))}
      </div>
    )
  }

  return (
    <>
      <PageHeader
        eyebrow="Build a reading habit"
        title="Reading Goals"
        description="Set meaningful reading targets and watch your progress grow."
        actions={
          <Button onClick={openAddForm} leftIcon={<Plus className="h-4 w-4" />}>
            Create a goal
          </Button>
        }
      />

      <section className="mb-7 rounded-2xl border border-border bg-surface-secondary p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface text-walnut">
            <Target className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold text-text-primary">
              Small steps, meaningful progress
            </h2>

            <p className="mt-1 text-sm leading-6 text-text-secondary">
              Your goal progress is calculated automatically from completed
              books and recorded reading sessions. You do not need to update
              progress manually.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-text-primary">
              Annual goals
            </h2>

            <p className="mt-1 text-xs text-text-muted">
              Your targets for the year
            </p>
          </div>

          <span className="text-xs text-text-muted">
            {annualGoals.length} goals
          </span>
        </div>

        {renderGoalGroup(
          annualGoals,
          'No annual goals yet. Create a yearly reading target to get started.',
        )}
      </section>

      <section className="mt-9 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-text-primary">
              Monthly goals
            </h2>

            <p className="mt-1 text-xs text-text-muted">
              Break your reading plans into smaller targets
            </p>
          </div>

          <span className="text-xs text-text-muted">
            {monthlyGoals.length} goals
          </span>
        </div>

        {renderGoalGroup(
          monthlyGoals,
          'No monthly goals yet. Add a monthly target to build a consistent habit.',
        )}
      </section>

      {goals.length === 0 ? (
        <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-border p-7 text-center">
          <p className="text-sm text-text-secondary">
            You have not created any reading goals yet.
          </p>

          <Button className="mt-4" variant="outline" onClick={openAddForm}>
            Create your first goal
          </Button>
        </div>
      ) : null}

      <Modal
        open={isFormOpen}
        onClose={closeForm}
        title={editingGoal ? 'Edit reading goal' : 'Create reading goal'}
        description="Choose what you want to achieve and when."
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

        <GoalForm
          initialValues={editingGoal || undefined}
          onSubmit={handleSaveGoal}
          onCancel={closeForm}
          isSubmitting={isSaving}
          submitLabel={editingGoal ? 'Save changes' : 'Create goal'}
        />
      </Modal>

      <Modal
        open={Boolean(goalToDelete)}
        onClose={() => setGoalToDelete(null)}
        title="Delete this goal?"
        description="Your reading records will remain unchanged. Only this target will be removed."
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setGoalToDelete(null)}>
              Cancel
            </Button>

            <Button variant="danger" onClick={handleDeleteGoal}>
              Delete goal
            </Button>
          </>
        }
      >
        <p className="text-sm text-text-secondary">
          Are you sure you want to delete this reading goal?
        </p>
      </Modal>
    </>
  )
}

export default ReadingGoals

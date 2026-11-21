import { createSlice } from '@reduxjs/toolkit'

import {
  GOAL_PERIODS,
  GOAL_TYPES,
  DEFAULT_GOAL_TARGET,
} from '../../utils/constants'

const initialState = {
  items: [],
}

const VALID_GOAL_TYPES = Object.values(GOAL_TYPES)
const VALID_GOAL_PERIODS = Object.values(GOAL_PERIODS)

const isValidYear = (value) => {
  const year = Number(value)
  return Number.isInteger(year) && year >= 1900 && year <= 9999
}

const isValidMonth = (value) => {
  const month = Number(value)
  return Number.isInteger(month) && month >= 1 && month <= 12
}

const normalizeTarget = (value) => {
  const target = Number(value)
  return Number.isFinite(target) ? Math.max(1, target) : DEFAULT_GOAL_TARGET
}

const goalsSlice = createSlice({
  name: 'goals',
  initialState,

  reducers: {
    addGoal: (state, action) => {
      const goal = action.payload

      if (
        !goal?.id ||
        !VALID_GOAL_TYPES.includes(goal.type) ||
        !VALID_GOAL_PERIODS.includes(goal.period) ||
        !isValidYear(goal.year)
      ) {
        return
      }

      if (goal.period === GOAL_PERIODS.MONTHLY && !isValidMonth(goal.month)) {
        return
      }

      if (state.items.some((item) => item.id === goal.id)) return

      state.items.push({
        id: goal.id,
        type: goal.type,
        period: goal.period,
        target: normalizeTarget(goal.target),
        year: Number(goal.year),
        month: goal.period === GOAL_PERIODS.MONTHLY ? Number(goal.month) : null,
        startDate: goal.startDate ?? null,
        endDate: goal.endDate ?? null,
        createdAt: goal.createdAt ?? null,
      })
    },

    updateGoal: (state, action) => {
      const { id, changes } = action.payload || {}

      if (!id || !changes || typeof changes !== 'object') return

      const goal = state.items.find((item) => item.id === id)
      if (!goal) return

      const allowedFields = [
        'type',
        'period',
        'target',
        'year',
        'month',
        'startDate',
        'endDate',
      ]

      const updatedChanges = {}

      allowedFields.forEach((field) => {
        if (Object.prototype.hasOwnProperty.call(changes, field)) {
          updatedChanges[field] = changes[field]
        }
      })

      if (
        updatedChanges.type !== undefined &&
        !VALID_GOAL_TYPES.includes(updatedChanges.type)
      ) {
        delete updatedChanges.type
      }

      if (
        updatedChanges.period !== undefined &&
        !VALID_GOAL_PERIODS.includes(updatedChanges.period)
      ) {
        delete updatedChanges.period
      }

      if (updatedChanges.target !== undefined) {
        updatedChanges.target = normalizeTarget(updatedChanges.target)
      }

      if (updatedChanges.year !== undefined) {
        if (isValidYear(updatedChanges.year)) {
          updatedChanges.year = Number(updatedChanges.year)
        } else {
          delete updatedChanges.year
        }
      }

      let nextPeriod = updatedChanges.period ?? goal.period

      if (nextPeriod === GOAL_PERIODS.ANNUAL) {
        updatedChanges.month = null
      } else {
        const nextMonth =
          updatedChanges.month ??
          (goal.period === GOAL_PERIODS.MONTHLY ? goal.month : null)

        if (isValidMonth(nextMonth)) {
          updatedChanges.month = Number(nextMonth)
        } else {
          // A monthly goal must always have a valid month.
          delete updatedChanges.period
          delete updatedChanges.month
          nextPeriod = goal.period
        }
      }

      if (nextPeriod === GOAL_PERIODS.ANNUAL) {
        updatedChanges.month = null
      }

      Object.assign(goal, updatedChanges)
    },

    deleteGoal: (state, action) => {
      state.items = state.items.filter((goal) => goal.id !== action.payload)
    },

    setGoals: (state, action) => {
      state.items = Array.isArray(action.payload) ? action.payload : []
    },

    clearGoals: (state) => {
      state.items = []
    },
  },
})

export const { addGoal, updateGoal, deleteGoal, setGoals, clearGoals } =
  goalsSlice.actions

export default goalsSlice.reducer

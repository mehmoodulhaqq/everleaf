const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

const isValidDateObject = (value) => {
  return value instanceof Date && !Number.isNaN(value.getTime())
}

/**
 * Converts supported date input into a valid Date object.
 * Date-only strings are parsed as local dates to avoid UTC day shifts.
 */
export const parseDate = (value) => {
  if (isValidDateObject(value)) {
    return new Date(value.getTime())
  }

  if (typeof value === 'string' && DATE_ONLY_PATTERN.test(value)) {
    const [year, month, day] = value.split('-').map(Number)
    const date = new Date(year, month - 1, day)

    if (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    ) {
      return date
    }

    return null
  }

  if (typeof value !== 'string' && typeof value !== 'number') {
    return null
  }

  const date = new Date(value)
  return isValidDateObject(date) ? date : null
}

const padNumber = (value) => String(value).padStart(2, '0')

/**
 * Returns a local calendar date in YYYY-MM-DD format.
 */
export const toISODate = (value = new Date()) => {
  const date = parseDate(value)
  if (!date) return ''

  return [
    date.getFullYear(),
    padNumber(date.getMonth() + 1),
    padNumber(date.getDate()),
  ].join('-')
}

/**
 * Formats a date for display. Invalid values return an empty string.
 */
export const formatDate = (
  value,
  options = { year: 'numeric', month: 'short', day: 'numeric' },
  locale = undefined,
) => {
  const date = parseDate(value)
  if (!date) return ''

  return new Intl.DateTimeFormat(locale, options).format(date)
}

/**
 * Returns a new Date set to local midnight.
 */
export const startOfDay = (value = new Date()) => {
  const date = parseDate(value)
  if (!date) return null

  date.setHours(0, 0, 0, 0)
  return date
}

/**
 * Adds calendar days while preserving the local time.
 */
export const addDays = (value, amount) => {
  const date = parseDate(value)
  const days = Number(amount)

  if (!date || !Number.isInteger(days)) return null

  date.setDate(date.getDate() + days)
  return date
}

/**
 * Returns the number of days in a given month.
 * Month is 1-based (January = 1).
 */
export const getDaysInMonth = (year, month) => {
  const numericYear = Number(year)
  const numericMonth = Number(month)

  if (
    !Number.isInteger(numericYear) ||
    !Number.isInteger(numericMonth) ||
    numericMonth < 1 ||
    numericMonth > 12
  ) {
    return 0
  }

  return new Date(numericYear, numericMonth, 0).getDate()
}

/**
 * Compares two dates using local calendar days, ignoring their times.
 */
export const differenceInCalendarDays = (startValue, endValue) => {
  const start = parseDate(startValue)
  const end = parseDate(endValue)

  if (!start || !end) return null

  const startUTC = Date.UTC(
    start.getFullYear(),
    start.getMonth(),
    start.getDate(),
  )

  const endUTC = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate())

  return Math.round((endUTC - startUTC) / 86400000)
}

/**
 * Checks whether a value can be interpreted as a valid date.
 */
export const isValidDate = (value) => parseDate(value) !== null

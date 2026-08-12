const MAX_MONTHS_AHEAD = 6

function startOfToday(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

function addMonthsClamped(date: Date, months: number): Date {
  const year = date.getFullYear()
  const month = date.getMonth() + months
  const lastDayOfTargetMonth = new Date(year, month + 1, 0).getDate()
  return new Date(year, month, Math.min(date.getDate(), lastDayOfTargetMonth))
}

export function getAvailabilityDateRange() {
  const min = startOfToday()
  const max = addMonthsClamped(min, MAX_MONTHS_AHEAD)
  return { min, max }
}

const DMY_PATTERN = /^(\d{2})\/(\d{2})\/(\d{4})$/

export function parseAvailabilityDate(value: string): Date | null {
  const match = value.match(DMY_PATTERN)
  if (!match) return null
  const [, dayStr, monthStr, yearStr] = match
  const day = Number(dayStr)
  const month = Number(monthStr)
  const year = Number(yearStr)

  const date = new Date(year, month - 1, day)
  const isRealCalendarDate =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  if (!isRealCalendarDate) return null

  const { min, max } = getAvailabilityDateRange()
  if (date < min || date > max) return null

  return date
}

export function isValidAvailabilityDate(value: string): boolean {
  return parseAvailabilityDate(value) !== null
}

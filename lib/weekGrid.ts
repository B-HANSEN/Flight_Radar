export function startOfWeek(date: Date): Date {
  const offset = (date.getDay() + 6) % 7
  const start = new Date(date)
  start.setDate(date.getDate() - offset)
  start.setHours(0, 0, 0, 0)
  return start
}

export function addDays(date: Date, delta: number): Date {
  const next = new Date(date)
  next.setDate(date.getDate() + delta)
  return next
}

export function addWeeks(date: Date, delta: number): Date {
  return addDays(date, delta * 7)
}

export function toISODate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// ISO 8601 week number (1–53): weeks start on Monday and week 1 is the one
// containing the year's first Thursday. Matches the "Kalenderwoche" /
// "week commencing" numbering shown on European calendars.
export function isoWeekNumber(date: Date): number {
  const thursday = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  )
  // Shift to the Thursday of this ISO week (Mon=0 … Sun=6).
  const dayIndex = (thursday.getUTCDay() + 6) % 7
  thursday.setUTCDate(thursday.getUTCDate() - dayIndex + 3)
  const firstThursday = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 4))
  const firstDayIndex = (firstThursday.getUTCDay() + 6) % 7
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayIndex + 3)
  const msPerWeek = 7 * 24 * 60 * 60 * 1000
  return (
    1 + Math.round((thursday.getTime() - firstThursday.getTime()) / msPerWeek)
  )
}

// "24 – 30 August 2026", or "28 August – 03 September 2026" when the week
// spans two months.
export function formatWeekRangeLabel(weekStart: Date, locale: string): string {
  const weekEnd = addDays(weekStart, 6)
  const startMonth = new Intl.DateTimeFormat(locale, { month: 'long' }).format(
    weekStart,
  )
  const endMonth = new Intl.DateTimeFormat(locale, { month: 'long' }).format(
    weekEnd,
  )
  const startDay = String(weekStart.getDate()).padStart(2, '0')
  const endDay = String(weekEnd.getDate()).padStart(2, '0')
  const year = weekEnd.getFullYear()
  return startMonth === endMonth
    ? `${startDay} – ${endDay} ${endMonth} ${year}`
    : `${startDay} ${startMonth} – ${endDay} ${endMonth} ${year}`
}

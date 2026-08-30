// Several collections store a display-formatted date (DD/MM/YYYY, see
// seed.ts's `bookings`/`students` data) while other code — query params,
// CalendarEvent.date — works in ISO (YYYY-MM-DD). These convert between the
// two so every consumer agrees on one implementation.

const DMY_PATTERN = /^(\d{2})\/(\d{2})\/(\d{4})$/

export function toISODate(displayDate: string): string | null {
  const match = displayDate.match(DMY_PATTERN)
  if (!match) return null
  const [, day, month, year] = match
  return `${year}-${month}-${day}`
}

export function toDisplayDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-')
  return `${day}/${month}/${year}`
}

// Local-time `YYYY-MM-DD` for a Date (not UTC — `toISOString` would shift the
// day near midnight in negative-offset zones).
export function formatISODate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// First day of the month that contains "now" — the cutoff below which whole
// past months of availability are hidden (see TODO.md).
export function startOfCurrentMonth(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

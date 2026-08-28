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

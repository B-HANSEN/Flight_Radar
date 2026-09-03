import type { Weekday } from '@/components/Availability.types'

// Ported from server/src/availability/availability-expansion.ts — lib/ isn't
// shared with server/ (its own npm workspace, see AGENTS.md), so this is a
// deliberate small duplication, same as lib/availabilityDateRange.ts already
// does for parseAvailabilityDate. Used to generate the AgendaCalendar
// Storybook/test fixture's unavailability blocks from Availability.data.ts's
// declared entries, so the two fixtures can't drift out of sync with each
// other or with the real derivation.

export type AvailabilityExpansionEntry = {
  dateMode: 'on' | 'range'
  onDate?: string
  fromDate?: string
  toDate?: string
  timeMode: 'allDay' | 'between'
  startTime?: string
  endTime?: string
  recurrenceMode: 'everyday' | 'days'
  recurrenceDays?: Weekday[]
}

export type MinuteWindow = { start: number; end: number }

export const MINUTES_PER_DAY = 24 * 60

const WEEKDAYS_BY_INDEX: Weekday[] = [
  'sun',
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
]

const DMY_PATTERN = /^(\d{2})\/(\d{2})\/(\d{4})$/

function parseDMYDate(value: string): Date | null {
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
  return isRealCalendarDate ? date : null
}

function parseTimeToMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number)
  return hours * 60 + minutes
}

function toISODate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function entryCoversWeekday(
  entry: AvailabilityExpansionEntry,
  date: Date,
): boolean {
  if (entry.recurrenceMode === 'everyday') return true
  const weekday = WEEKDAYS_BY_INDEX[date.getDay()]
  return entry.recurrenceDays?.includes(weekday) ?? false
}

function mergeWindows(windows: MinuteWindow[]): MinuteWindow[] {
  const sorted = [...windows].sort((a, b) => a.start - b.start)
  const merged: MinuteWindow[] = []
  for (const window of sorted) {
    const last = merged[merged.length - 1]
    if (last && window.start <= last.end) {
      last.end = Math.max(last.end, window.end)
    } else {
      merged.push({ ...window })
    }
  }
  return merged
}

// Expands AvailabilityEntry-shaped entries into, per covered ISO date within
// [rangeStart, rangeEnd], the merged set of covered (available) minute-of-day
// windows. A date with no entry in the returned map has no declared
// availability at all.
export function expandAvailability(
  entries: AvailabilityExpansionEntry[],
  rangeStart: Date,
  rangeEnd: Date,
): Map<string, MinuteWindow[]> {
  const coverageByDate = new Map<string, MinuteWindow[]>()

  for (const entry of entries) {
    const fromValue = entry.dateMode === 'on' ? entry.onDate : entry.fromDate
    const toValue = entry.dateMode === 'on' ? entry.onDate : entry.toDate
    if (!fromValue || !toValue) continue

    const from = parseDMYDate(fromValue)
    const to = parseDMYDate(toValue)
    if (!from || !to) continue

    const windowStart = from < rangeStart ? rangeStart : from
    const windowEnd = to > rangeEnd ? rangeEnd : to
    if (windowStart > windowEnd) continue

    if (entry.timeMode === 'between' && (!entry.startTime || !entry.endTime)) {
      continue
    }

    const timeWindow: MinuteWindow =
      entry.timeMode === 'allDay'
        ? { start: 0, end: MINUTES_PER_DAY }
        : {
            start: parseTimeToMinutes(entry.startTime as string),
            end: parseTimeToMinutes(entry.endTime as string),
          }

    for (
      let date = new Date(windowStart);
      date <= windowEnd;
      date = addDays(date, 1)
    ) {
      if (!entryCoversWeekday(entry, date)) continue
      const iso = toISODate(date)
      const windows = coverageByDate.get(iso) ?? []
      windows.push(timeWindow)
      coverageByDate.set(iso, windows)
    }
  }

  for (const [iso, windows] of coverageByDate) {
    coverageByDate.set(iso, mergeWindows(windows))
  }

  return coverageByDate
}

// Complement of a date's merged covered windows within the full day. An
// uncovered date (empty input) is fully unavailable: a single [0, 1440] gap.
export function computeUnavailableGaps(
  coveredWindows: MinuteWindow[],
): MinuteWindow[] {
  if (coveredWindows.length === 0) {
    return [{ start: 0, end: MINUTES_PER_DAY }]
  }

  const gaps: MinuteWindow[] = []
  let cursor = 0
  for (const window of coveredWindows) {
    if (window.start > cursor) gaps.push({ start: cursor, end: window.start })
    cursor = Math.max(cursor, window.end)
  }
  if (cursor < MINUTES_PER_DAY)
    gaps.push({ start: cursor, end: MINUTES_PER_DAY })

  return gaps
}

export function formatMinutes(totalMinutes: number): string {
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0')
  const minutes = String(totalMinutes % 60).padStart(2, '0')
  return `${hours}:${minutes}`
}

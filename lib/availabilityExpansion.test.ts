import {
  computeUnavailableGaps,
  expandAvailability,
  formatMinutes,
  type AvailabilityExpansionEntry,
} from './availabilityExpansion'

const RANGE_START = new Date(2026, 7, 1)
const RANGE_END = new Date(2026, 7, 5)

it('expands a "between" entry into a covered minute window on each matching date', () => {
  const entry: AvailabilityExpansionEntry = {
    dateMode: 'on',
    onDate: '03/08/2026',
    timeMode: 'between',
    startTime: '09:00',
    endTime: '12:00',
    recurrenceMode: 'everyday',
  }

  const coverage = expandAvailability([entry], RANGE_START, RANGE_END)

  expect(coverage.get('2026-08-03')).toEqual([{ start: 540, end: 720 }])
  expect(coverage.has('2026-08-04')).toBe(false)
})

it("only covers the entry's recurrence days within a date range", () => {
  const entry: AvailabilityExpansionEntry = {
    dateMode: 'range',
    fromDate: '01/08/2026',
    toDate: '05/08/2026',
    timeMode: 'allDay',
    recurrenceMode: 'days',
    recurrenceDays: ['mon'],
  }

  const coverage = expandAvailability([entry], RANGE_START, RANGE_END)

  // 3 August 2026 is the only Monday in the range.
  expect([...coverage.keys()]).toEqual(['2026-08-03'])
})

it('derives a full-day gap for a date with no declared availability', () => {
  expect(computeUnavailableGaps([])).toEqual([{ start: 0, end: 1440 }])
})

it('derives the gaps around a covered window', () => {
  const gaps = computeUnavailableGaps([{ start: 540, end: 720 }])
  expect(gaps).toEqual([
    { start: 0, end: 540 },
    { start: 720, end: 1440 },
  ])
})

it('formats minutes-of-day as HH:MM', () => {
  expect(formatMinutes(540)).toBe('09:00')
  expect(formatMinutes(0)).toBe('00:00')
})

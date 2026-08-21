import {
  MINUTES_PER_DAY,
  computeUnavailableGaps,
  expandAvailability,
  formatMinutes,
  type AvailabilityExpansionEntry,
} from './availability-expansion'

const RANGE_START = new Date(2026, 7, 1)
const RANGE_END = new Date(2026, 7, 31)

describe('expandAvailability', () => {
  it('expands an "on" entry to a single covered date', () => {
    const entries: AvailabilityExpansionEntry[] = [
      {
        dateMode: 'on',
        onDate: '05/08/2026',
        timeMode: 'between',
        startTime: '09:00',
        endTime: '12:00',
        recurrenceMode: 'everyday',
      },
    ]

    const coverage = expandAvailability(entries, RANGE_START, RANGE_END)

    expect(coverage.size).toBe(1)
    expect(coverage.get('2026-08-05')).toEqual([{ start: 540, end: 720 }])
  })

  it('expands a "range" + "allDay" entry across every date in the range', () => {
    const entries: AvailabilityExpansionEntry[] = [
      {
        dateMode: 'range',
        fromDate: '03/08/2026',
        toDate: '05/08/2026',
        timeMode: 'allDay',
        recurrenceMode: 'everyday',
      },
    ]

    const coverage = expandAvailability(entries, RANGE_START, RANGE_END)

    expect(coverage.get('2026-08-03')).toEqual([{ start: 0, end: 1440 }])
    expect(coverage.get('2026-08-04')).toEqual([{ start: 0, end: 1440 }])
    expect(coverage.get('2026-08-05')).toEqual([{ start: 0, end: 1440 }])
    expect(coverage.has('2026-08-06')).toBe(false)
  })

  it('filters a "days" recurrence to only the matching weekdays', () => {
    // 2026-08-03 is a Monday
    const entries: AvailabilityExpansionEntry[] = [
      {
        dateMode: 'range',
        fromDate: '03/08/2026',
        toDate: '09/08/2026',
        timeMode: 'allDay',
        recurrenceMode: 'days',
        recurrenceDays: ['mon', 'wed'],
      },
    ]

    const coverage = expandAvailability(entries, RANGE_START, RANGE_END)

    expect(coverage.has('2026-08-03')).toBe(true) // Mon
    expect(coverage.has('2026-08-04')).toBe(false) // Tue
    expect(coverage.has('2026-08-05')).toBe(true) // Wed
    expect(coverage.has('2026-08-06')).toBe(false) // Thu
  })

  it('unions overlapping entries on the same date', () => {
    const entries: AvailabilityExpansionEntry[] = [
      {
        dateMode: 'on',
        onDate: '05/08/2026',
        timeMode: 'between',
        startTime: '09:00',
        endTime: '12:00',
        recurrenceMode: 'everyday',
      },
      {
        dateMode: 'on',
        onDate: '05/08/2026',
        timeMode: 'between',
        startTime: '11:00',
        endTime: '14:00',
        recurrenceMode: 'everyday',
      },
    ]

    const coverage = expandAvailability(entries, RANGE_START, RANGE_END)

    expect(coverage.get('2026-08-05')).toEqual([{ start: 540, end: 840 }])
  })

  it('keeps non-overlapping windows on the same date separate', () => {
    const entries: AvailabilityExpansionEntry[] = [
      {
        dateMode: 'on',
        onDate: '05/08/2026',
        timeMode: 'between',
        startTime: '09:00',
        endTime: '10:00',
        recurrenceMode: 'everyday',
      },
      {
        dateMode: 'on',
        onDate: '05/08/2026',
        timeMode: 'between',
        startTime: '18:00',
        endTime: '20:00',
        recurrenceMode: 'everyday',
      },
    ]

    const coverage = expandAvailability(entries, RANGE_START, RANGE_END)

    expect(coverage.get('2026-08-05')).toEqual([
      { start: 540, end: 600 },
      { start: 1080, end: 1200 },
    ])
  })

  it('clips entries to the given range', () => {
    const entries: AvailabilityExpansionEntry[] = [
      {
        dateMode: 'range',
        fromDate: '25/07/2026',
        toDate: '05/08/2026',
        timeMode: 'allDay',
        recurrenceMode: 'everyday',
      },
    ]

    const coverage = expandAvailability(entries, RANGE_START, RANGE_END)

    expect(coverage.has('2026-07-30')).toBe(false)
    expect(coverage.get('2026-08-01')).toEqual([{ start: 0, end: 1440 }])
  })
})

describe('computeUnavailableGaps', () => {
  it('treats no coverage as fully unavailable', () => {
    expect(computeUnavailableGaps([])).toEqual([
      { start: 0, end: MINUTES_PER_DAY },
    ])
  })

  it('produces no gaps when a window fully covers the day', () => {
    expect(computeUnavailableGaps([{ start: 0, end: 1440 }])).toEqual([])
  })

  it('produces gaps before and after a partial-day window', () => {
    expect(computeUnavailableGaps([{ start: 540, end: 720 }])).toEqual([
      { start: 0, end: 540 },
      { start: 720, end: 1440 },
    ])
  })

  it('produces gaps between multiple non-adjacent windows', () => {
    expect(
      computeUnavailableGaps([
        { start: 540, end: 600 },
        { start: 1080, end: 1200 },
      ]),
    ).toEqual([
      { start: 0, end: 540 },
      { start: 600, end: 1080 },
      { start: 1200, end: 1440 },
    ])
  })
})

describe('formatMinutes', () => {
  it('formats minute-of-day values as HH:MM', () => {
    expect(formatMinutes(0)).toBe('00:00')
    expect(formatMinutes(540)).toBe('09:00')
    expect(formatMinutes(1439)).toBe('23:59')
  })
})

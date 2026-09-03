import {
  MINUTES_PER_DAY,
  computeUnavailableGaps,
  expandAvailability,
  formatMinutes,
} from '@/lib/availabilityExpansion'
import { DUMMY_AVAILABILITY_ENTRIES } from './Availability.data'
import type { BookingEvent, CalendarEvent } from './AgendaCalendar.types'

// Lessons aren't derivable from declared availability, unlike the
// unavailability blocks below — kept hand-authored.
const DUMMY_BOOKING_EVENTS: BookingEvent[] = [
  {
    id: 'booking-1',
    type: 'booking',
    date: '2026-08-04',
    time: '18:10 - 20:20',
    tailNumber: 'EC-EXL',
    instructorName: 'James Whitfield',
    studentName: 'Jamie Torres',
    lessonType: 'Dual instruction',
    trainingCode: 'VTD01',
  },
  {
    id: 'booking-2',
    type: 'booking',
    date: '2026-08-07',
    time: '13:10 - 15:20',
    tailNumber: 'EC-ERV',
    instructorName: 'Kate Ashford',
    studentName: 'Jamie Torres',
    lessonType: 'Checkride prep',
    trainingCode: 'VBD15',
  },
  {
    id: 'booking-3',
    type: 'booking',
    date: '2026-08-12',
    time: '09:00 - 12:30',
    tailNumber: 'EC-KLM',
    instructorName: 'James Whitfield',
    studentName: 'Jamie Torres',
    lessonType: 'Dual instruction',
    trainingCode: 'VTD04',
    cancelled: true,
  },
  {
    id: 'booking-4',
    type: 'booking',
    date: '2026-08-16',
    time: '18:00 - 19:30',
    instructorName: 'James Whitfield',
    studentName: 'Jamie Torres',
    lessonType: 'Theory',
    comments: 'Navigation theory — map reading and drift',
  },
  {
    id: 'booking-5',
    type: 'booking',
    date: '2026-09-02',
    time: '10:00 - 11:15',
    tailNumber: 'EC-FED',
    instructorName: 'Kate Ashford',
    studentName: 'Jamie Torres',
    lessonType: 'Dual instruction',
    trainingCode: 'VBD03',
  },
]

// Spans every date DUMMY_AVAILABILITY_ENTRIES declares anything for (31 Jul
// – 30 Aug 2026), so the derived unavailability below can't drift out of
// sync with that fixture or with the real expansion logic it wraps.
const RANGE_START = new Date(2026, 6, 31)
const RANGE_END = new Date(2026, 7, 30)

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

function deriveUnavailabilityEvents(): CalendarEvent[] {
  const coverageByDate = expandAvailability(
    DUMMY_AVAILABILITY_ENTRIES,
    RANGE_START,
    RANGE_END,
  )
  const events: CalendarEvent[] = []

  for (let date = RANGE_START; date <= RANGE_END; date = addDays(date, 1)) {
    const iso = toISODate(date)
    const gaps = computeUnavailableGaps(coverageByDate.get(iso) ?? [])

    gaps.forEach((gap, index) => {
      const isFullDay = gap.start === 0 && gap.end === MINUTES_PER_DAY
      events.push(
        isFullDay
          ? {
              id: `unavailability-${iso}-${index}`,
              type: 'unavailability',
              date: iso,
              allDay: true,
            }
          : {
              id: `unavailability-${iso}-${index}`,
              type: 'unavailability',
              date: iso,
              allDay: false,
              timeRange: `${formatMinutes(gap.start)} - ${formatMinutes(gap.end)}`,
            },
      )
    })
  }

  return events
}

export const DUMMY_AGENDA_EVENTS: CalendarEvent[] = [
  ...deriveUnavailabilityEvents(),
  ...DUMMY_BOOKING_EVENTS,
].sort((a, b) => a.date.localeCompare(b.date))

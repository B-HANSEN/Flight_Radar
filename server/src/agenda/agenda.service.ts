import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import {
  CalendarEvent,
  CalendarEventDocument,
} from './schemas/calendar-event.schema'
import {
  AvailabilityEntry,
  AvailabilityEntryDocument,
} from '../availability/schemas/availability-entry.schema'
import {
  MINUTES_PER_DAY,
  computeUnavailableGaps,
  expandAvailability,
  formatMinutes,
} from '../availability/availability-expansion'

// Bounds how far derived 'unavailability' events reach. Must match
// MAX_MONTHS_AHEAD/MAX_MONTHS_BEHIND in components/AgendaCalendar.tsx — the
// UI can't browse further than that, so deriving beyond it is wasted work.
// lib/ isn't shared with server/, so this is a deliberate duplicated constant.
const AGENDA_MONTHS_AHEAD = 3
const AGENDA_MONTHS_BEHIND = 3

// No Users module yet (no auth) — plain id for now, becomes a real
// ObjectId ref once the Users module exists.
const STUDENT_ID = 'student-1'

export type DerivedUnavailabilityEvent = {
  id: string
  type: 'unavailability'
  date: string
  studentId: string
} & ({ allDay: true } | { allDay: false; timeRange: string })

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, date.getDate())
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function toISODate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

@Injectable()
export class AgendaService {
  constructor(
    @InjectModel(CalendarEvent.name)
    private readonly calendarEventModel: Model<CalendarEventDocument>,
    @InjectModel(AvailabilityEntry.name)
    private readonly availabilityEntryModel: Model<AvailabilityEntryDocument>,
  ) {}

  async findAll() {
    const [bookings, availabilityEntries] = await Promise.all([
      this.calendarEventModel
        .find({ type: 'booking', studentId: STUDENT_ID })
        .exec(),
      this.availabilityEntryModel.find({ studentId: STUDENT_ID }).exec(),
    ])

    const rangeStart = startOfDay(addMonths(new Date(), -AGENDA_MONTHS_BEHIND))
    const rangeEnd = startOfDay(addMonths(new Date(), AGENDA_MONTHS_AHEAD))
    const coverageByDate = expandAvailability(
      availabilityEntries,
      rangeStart,
      rangeEnd,
    )

    const derivedUnavailability: DerivedUnavailabilityEvent[] = []
    for (let date = rangeStart; date <= rangeEnd; date = addDays(date, 1)) {
      const iso = toISODate(date)
      const gaps = computeUnavailableGaps(coverageByDate.get(iso) ?? [])

      gaps.forEach((gap, index) => {
        const isFullDay = gap.start === 0 && gap.end === MINUTES_PER_DAY
        derivedUnavailability.push(
          isFullDay
            ? {
                id: `unavailability-${iso}-${index}`,
                type: 'unavailability',
                date: iso,
                allDay: true,
                studentId: STUDENT_ID,
              }
            : {
                id: `unavailability-${iso}-${index}`,
                type: 'unavailability',
                date: iso,
                allDay: false,
                timeRange: `${formatMinutes(gap.start)} - ${formatMinutes(gap.end)}`,
                studentId: STUDENT_ID,
              },
        )
      })
    }

    return [...bookings, ...derivedUnavailability].sort((a, b) =>
      a.date.localeCompare(b.date),
    )
  }
}

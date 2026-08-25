import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import {
  ScheduleBlock,
  ScheduleBlockDocument,
  ScheduleBlockKind,
} from './schemas/schedule-block.schema'
import { Booking, BookingDocument } from '../bookings/schemas/booking.schema'
import { Aircraft, AircraftDocument } from '../aircraft/schemas/aircraft.schema'

// A real booking rendered as a reserved block. Unlike the seeded
// ScheduleBlock docs (which recur on every day/week with no date of their
// own), this only applies to the one calendar date it was booked for.
export type BookingScheduleBlock = {
  id: string
  aircraftId: string
  period: 'day' | 'week'
  label: string
  kind: 'reserved'
  start: number
  end: number
  date: string
}

export type BusyAircraft = {
  aircraftId: string
  kind: ScheduleBlockKind
  label: string
}

// Booking/availability form times are "HH:MM"; returns fractional
// hours-of-day, comparable against a block's start/end.
function parseHours(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours + minutes / 60
}

const DMY_PATTERN = /^(\d{2})\/(\d{2})\/(\d{4})$/

// Booking.date is DD/MM/YYYY (see bookings.service.ts's toDisplayDate).
function toISODate(displayDate: string): string | null {
  const match = displayDate.match(DMY_PATTERN)
  if (!match) return null
  const [, day, month, year] = match
  return `${year}-${month}-${day}`
}

// Monday = 0 ... Sunday = 6, matching ScheduleBoard's Monday-start weeks.
function weekdayIndex(isoDate: string): number {
  const day = new Date(`${isoDate}T00:00:00`).getDay()
  return (day + 6) % 7
}

// Booking.time is "HH:MM - HH:MM"; returns fractional hours-of-day.
function parseTimeRange(time: string): { start: number; end: number } | null {
  const [startStr, endStr] = time.split(' - ')
  if (!startStr || !endStr) return null

  return { start: parseHours(startStr), end: parseHours(endStr) }
}

@Injectable()
export class ScheduleService {
  constructor(
    @InjectModel(ScheduleBlock.name)
    private readonly scheduleBlockModel: Model<ScheduleBlockDocument>,
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    @InjectModel(Aircraft.name)
    private readonly aircraftModel: Model<AircraftDocument>,
  ) {}

  async findAll() {
    const [blocks, bookings, aircraft] = await Promise.all([
      this.scheduleBlockModel.find().exec(),
      this.bookingModel.find().exec(),
      this.aircraftModel.find().exec(),
    ])

    const aircraftIdByTail = new Map(
      aircraft.map((a) => [
        a.arcid,
        (a._id as { toString(): string }).toString(),
      ]),
    )

    const bookingBlocks: BookingScheduleBlock[] = []
    for (const booking of bookings) {
      const aircraftId = aircraftIdByTail.get(booking.tail)
      const date = toISODate(booking.date)
      const range = parseTimeRange(booking.time)
      if (!aircraftId || !date || !range) continue

      const id = (booking._id as { toString(): string }).toString()
      const label = `${booking.type} · ${booking.person}`
      const dayIndex = weekdayIndex(date)

      bookingBlocks.push(
        {
          id: `${id}-day`,
          aircraftId,
          period: 'day',
          label,
          kind: 'reserved',
          start: range.start,
          end: range.end,
          date,
        },
        {
          id: `${id}-week`,
          aircraftId,
          period: 'week',
          label,
          kind: 'reserved',
          start: dayIndex + range.start / 24,
          end: dayIndex + range.end / 24,
          date,
        },
      )
    }

    return [...blocks, ...bookingBlocks]
  }

  // Aircraft that are unavailable for a given date/time window — covers both
  // real bookings (dated) and the seeded maintenance/hold/reserved demo
  // blocks (undated, recurring every day), reusing findAll()'s merged data
  // instead of re-deriving the overlap math. Only 'day' period blocks are
  // considered: 'week' period blocks are the same data duplicated across
  // every weekday purely for the week-view UI (see seed.ts).
  async findBusyAircraft(
    date: string,
    startTime: string,
    endTime: string,
  ): Promise<BusyAircraft[]> {
    const blocks = await this.findAll()
    const startHour = parseHours(startTime)
    const endHour = parseHours(endTime)

    const busyByAircraftId = new Map<string, BusyAircraft>()
    for (const block of blocks) {
      if (block.period !== 'day') continue
      const blockDate = 'date' in block ? block.date : undefined
      if (blockDate !== undefined && blockDate !== date) continue
      if (!(startHour < block.end && block.start < endHour)) continue

      if (!busyByAircraftId.has(block.aircraftId)) {
        busyByAircraftId.set(block.aircraftId, {
          aircraftId: block.aircraftId,
          kind: block.kind,
          label: block.label,
        })
      }
    }

    return [...busyByAircraftId.values()]
  }
}

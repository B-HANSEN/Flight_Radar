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
import {
  Instructor,
  InstructorDocument,
} from '../instructors/schemas/instructor.schema'
import { toDisplayDate, toISODate } from '../common/date'

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
  // Who the reservation is for, surfaced in the schedule detail modal.
  studentName: string
  instructorName?: string
  // Instructor's note for the lesson (the topic, for a Theory lesson).
  comments?: string
}

export type BusyAircraft = {
  aircraftId: string
  kind: ScheduleBlockKind
  label: string
}

// A student's already-booked flight that day, shown in the scheduling modal
// so the instructor can see it before picking a new time.
export type StudentFlight = {
  id: string
  startTime: string
  endTime: string
  label: string
}

// Booking/availability form times are "HH:MM"; returns fractional
// hours-of-day, comparable against a block's start/end.
function parseHours(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours + minutes / 60
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
    @InjectModel(Instructor.name)
    private readonly instructorModel: Model<InstructorDocument>,
  ) {}

  async findAll() {
    const [blocks, bookings, aircraft, instructors] = await Promise.all([
      this.scheduleBlockModel.find().exec(),
      this.bookingModel.find().exec(),
      this.aircraftModel.find().exec(),
      this.instructorModel.find().exec(),
    ])

    // Guards against a Booking.aircraftId left over from a since-deleted
    // aircraft — same defensive intent as the old arcid lookup it replaces.
    const aircraftIds = new Set(
      aircraft.map((a) => (a._id as { toString(): string }).toString()),
    )

    const instructorNameById = new Map(
      instructors.map((instructor) => [
        (instructor._id as { toString(): string }).toString(),
        instructor.name,
      ]),
    )

    const bookingBlocks: BookingScheduleBlock[] = []
    for (const booking of bookings) {
      // A Theory lesson has no aircraft, so it maps to no aircraft row and
      // is skipped here (it still shows in the student's day / calendar).
      const bookingAircraftId = booking.aircraftId
        ? (booking.aircraftId as { toString(): string }).toString()
        : undefined
      const aircraftId =
        bookingAircraftId && aircraftIds.has(bookingAircraftId)
          ? bookingAircraftId
          : undefined
      const date = toISODate(booking.date)
      const range = parseTimeRange(booking.time)
      if (!aircraftId || !date || !range) continue

      const id = (booking._id as { toString(): string }).toString()
      const label = `${booking.type} · ${booking.person}`
      const dayIndex = weekdayIndex(date)
      const instructorName = instructorNameById.get(booking.instructorId)
      const who = {
        studentName: booking.person,
        instructorName,
        comments: booking.comments,
      }

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
          ...who,
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
          ...who,
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

  // A given student's already-booked flights on a given date, so the
  // scheduling modal can show them and enforce the 90 min buffer between
  // flights (see BookingsService.create).
  async findStudentFlights(
    studentId: string,
    date: string,
  ): Promise<StudentFlight[]> {
    const [bookings, instructors] = await Promise.all([
      this.bookingModel.find({ studentId, date: toDisplayDate(date) }).exec(),
      this.instructorModel.find().exec(),
    ])

    const instructorNameById = new Map(
      instructors.map((instructor) => [
        (instructor._id as { toString(): string }).toString(),
        instructor.name,
      ]),
    )

    const flights: StudentFlight[] = []
    for (const booking of bookings) {
      const [startTime, endTime] = booking.time.split(' - ')
      if (!startTime || !endTime) continue

      const instructorName = instructorNameById.get(booking.instructorId)
      // Theory lessons have no tail, so it's just left out of the label.
      const label = [booking.type, booking.tail, instructorName]
        .filter(Boolean)
        .join(' · ')

      flights.push({
        id: (booking._id as { toString(): string }).toString(),
        startTime,
        endTime,
        label,
      })
    }

    return flights.sort((a, b) => a.startTime.localeCompare(b.startTime))
  }
}

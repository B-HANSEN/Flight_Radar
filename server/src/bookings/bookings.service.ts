import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Booking, BookingDocument } from './schemas/booking.schema'
import { Student, StudentDocument } from '../students/schemas/student.schema'
import { Aircraft, AircraftDocument } from '../aircraft/schemas/aircraft.schema'
import {
  CalendarEvent,
  CalendarEventDocument,
} from '../agenda/schemas/calendar-event.schema'

export type CreateBookingInput = {
  studentId: string
  aircraftId: string
  date: string
  startTime: string
  endTime: string
  lessonType: string
  comments?: string
}

// Booking.date is a display string in DD/MM/YYYY (see seed.ts), while
// CalendarEvent.date — the field students.service.ts actually reads to
// subtract booked windows from availability — is ISO YYYY-MM-DD.
function toDisplayDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-')
  return `${day}/${month}/${year}`
}

// event.time is "HH:MM - HH:MM"; splits back into comparable HH:MM strings.
function parseTimeRange(time: string): { start: string; end: string } | null {
  const [start, end] = time.split(' - ')
  return start && end ? { start, end } : null
}

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    @InjectModel(Student.name)
    private readonly studentModel: Model<StudentDocument>,
    @InjectModel(Aircraft.name)
    private readonly aircraftModel: Model<AircraftDocument>,
    @InjectModel(CalendarEvent.name)
    private readonly calendarEventModel: Model<CalendarEventDocument>,
  ) {}

  findAll() {
    return this.bookingModel.find().exec()
  }

  async create(input: CreateBookingInput) {
    const [student, aircraft] = await Promise.all([
      this.studentModel.findById(input.studentId).exec(),
      this.aircraftModel.findById(input.aircraftId).exec(),
    ])

    if (!student) {
      throw new NotFoundException(`Student ${input.studentId} not found`)
    }
    if (!aircraft) {
      throw new NotFoundException(`Aircraft ${input.aircraftId} not found`)
    }

    const sameDayBookings = await this.calendarEventModel
      .find({
        type: 'booking',
        studentId: input.studentId,
        date: input.date,
        cancelled: { $ne: true },
      })
      .exec()

    const hasOverlap = sameDayBookings.some((event) => {
      const range = event.time ? parseTimeRange(event.time) : null
      return (
        range !== null &&
        input.startTime < range.end &&
        range.start < input.endTime
      )
    })

    if (hasOverlap) {
      throw new ConflictException(
        `Student ${input.studentId} already has a booking overlapping ${input.startTime}-${input.endTime} on ${input.date}`,
      )
    }

    const time = `${input.startTime} - ${input.endTime}`

    await this.calendarEventModel.create({
      type: 'booking',
      date: input.date,
      time,
      tailNumber: aircraft.arcid,
      flightLines: input.comments ? [input.comments] : undefined,
      studentId: input.studentId,
    })

    return this.bookingModel.create({
      type: input.lessonType,
      date: toDisplayDate(input.date),
      tail: aircraft.arcid,
      person: student.name,
      time,
      studentId: input.studentId,
    })
  }
}

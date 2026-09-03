import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'
import { Connection, Model } from 'mongoose'
import { Booking, BookingDocument } from './schemas/booking.schema'
import { Student, StudentDocument } from '../students/schemas/student.schema'
import { Aircraft, AircraftDocument } from '../aircraft/schemas/aircraft.schema'
import {
  Instructor,
  InstructorDocument,
} from '../instructors/schemas/instructor.schema'
import {
  CalendarEvent,
  CalendarEventDocument,
} from '../agenda/schemas/calendar-event.schema'
import {
  AvailabilityEntry,
  AvailabilityEntryDocument,
} from '../availability/schemas/availability-entry.schema'
import { expandAvailability } from '../availability/availability-expansion'
import { toDisplayDate } from '../common/date'

export type CreateBookingInput = {
  studentId: string
  // Omitted for a Theory (ground-school) lesson, which needs no aircraft.
  aircraftId?: string
  instructorId: string
  date: string
  startTime: string
  endTime: string
  lessonType: string
  comments?: string
}

// A student can't be dropped into a second lesson right after the first —
// briefing/debriefing needs a gap. Aircraft turnaround isn't held to the
// same rule (that's a pure overlap check below).
const STUDENT_BUFFER_MINUTES = 90

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// event.time is "HH:MM - HH:MM"; splits back into comparable HH:MM strings.
function parseTimeRange(time: string): { start: string; end: string } | null {
  const [start, end] = time.split(' - ')
  return start && end ? { start, end } : null
}

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name)

  constructor(
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    @InjectModel(Student.name)
    private readonly studentModel: Model<StudentDocument>,
    @InjectModel(Aircraft.name)
    private readonly aircraftModel: Model<AircraftDocument>,
    @InjectModel(CalendarEvent.name)
    private readonly calendarEventModel: Model<CalendarEventDocument>,
    @InjectModel(Instructor.name)
    private readonly instructorModel: Model<InstructorDocument>,
    @InjectModel(AvailabilityEntry.name)
    private readonly availabilityEntryModel: Model<AvailabilityEntryDocument>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  // True when [startTime, endTime] fits entirely inside one of the student's
  // declared availability windows for that ISO date (recurring entries
  // included). A date with no declared availability yields no window, so any
  // booking on it is "out of window".
  private async isWithinDeclaredAvailability(
    studentId: string,
    isoDate: string,
    startTime: string,
    endTime: string,
  ): Promise<boolean> {
    const entries = await this.availabilityEntryModel.find({ studentId }).exec()
    const day = new Date(`${isoDate}T00:00:00`)
    const windows = expandAvailability(entries, day, day).get(isoDate) ?? []
    const start = toMinutes(startTime)
    const end = toMinutes(endTime)
    return windows.some((w) => w.start <= start && end <= w.end)
  }

  findAll(filter: { studentId?: string; instructorId?: string } = {}) {
    const query: Record<string, string> = {}
    if (filter.studentId) query.studentId = filter.studentId
    if (filter.instructorId) query.instructorId = filter.instructorId
    return this.bookingModel.find(query).exec()
  }

  async create(input: CreateBookingInput) {
    // A non-Theory lesson is an actual flight — it must have a tail number
    // picked at booking time. Theory (ground school) carries no aircraft.
    if (input.lessonType !== 'Theory' && !input.aircraftId) {
      throw new BadRequestException(
        `An aircraft is required for a ${input.lessonType} booking`,
      )
    }

    const [student, instructor] = await Promise.all([
      this.studentModel.findById(input.studentId).exec(),
      this.instructorModel.findById(input.instructorId).exec(),
    ])

    if (!student) {
      throw new NotFoundException(`Student ${input.studentId} not found`)
    }
    if (!instructor) {
      throw new NotFoundException(`Instructor ${input.instructorId} not found`)
    }

    // A Theory (ground-school) lesson carries no aircraft.
    const aircraft = input.aircraftId
      ? await this.aircraftModel.findById(input.aircraftId).exec()
      : null
    if (input.aircraftId && !aircraft) {
      throw new NotFoundException(`Aircraft ${input.aircraftId} not found`)
    }

    const sameDayBookings = await this.calendarEventModel
      .find({
        type: 'booking',
        date: input.date,
        cancelled: { $ne: true },
        $or: [
          { studentId: input.studentId },
          ...(aircraft ? [{ tailNumber: aircraft.arcid }] : []),
        ],
      })
      .exec()

    const overlapping = sameDayBookings.filter((event) => {
      const range = event.time ? parseTimeRange(event.time) : null
      return (
        range !== null &&
        input.startTime < range.end &&
        range.start < input.endTime
      )
    })

    const inputStart = toMinutes(input.startTime)
    const inputEnd = toMinutes(input.endTime)
    const violatesStudentBuffer = sameDayBookings.some((event) => {
      if (event.studentId !== input.studentId) return false
      const range = event.time ? parseTimeRange(event.time) : null
      if (range === null) return false
      return (
        inputStart < toMinutes(range.end) + STUDENT_BUFFER_MINUTES &&
        toMinutes(range.start) < inputEnd + STUDENT_BUFFER_MINUTES
      )
    })

    if (violatesStudentBuffer) {
      throw new ConflictException(
        `Student ${input.studentId} needs a ${STUDENT_BUFFER_MINUTES} min buffer around ${input.startTime}-${input.endTime} on ${input.date}`,
      )
    }
    if (
      aircraft &&
      overlapping.some((event) => event.tailNumber === aircraft.arcid)
    ) {
      throw new ConflictException(
        `Aircraft ${aircraft.arcid} is already booked overlapping ${input.startTime}-${input.endTime} on ${input.date}`,
      )
    }

    const withinAvailability = await this.isWithinDeclaredAvailability(
      input.studentId,
      input.date,
      input.startTime,
      input.endTime,
    )
    if (!withinAvailability) {
      throw new ConflictException(
        `${input.startTime}-${input.endTime} on ${input.date} is outside student ${input.studentId}'s declared availability`,
      )
    }

    const time = `${input.startTime} - ${input.endTime}`

    // Booking (denormalized, read by /schedule, /bookings, homepage) and
    // CalendarEvent (proper ids, read by conflict detection above) both
    // represent this one lesson — a session transaction keeps them in sync:
    // if either write fails, both roll back instead of leaving an orphaned
    // CalendarEvent with no matching Booking.
    const session = await this.connection.startSession()
    try {
      let booking: BookingDocument
      try {
        await session.withTransaction(async () => {
          await this.calendarEventModel.create(
            [
              {
                type: 'booking',
                date: input.date,
                time,
                tailNumber: aircraft?.arcid,
                flightLines: input.comments ? [input.comments] : undefined,
                studentId: input.studentId,
              },
            ],
            { session },
          )

          const [created] = await this.bookingModel.create(
            [
              {
                type: input.lessonType,
                date: toDisplayDate(input.date),
                tail: aircraft?.arcid,
                person: student.name,
                time,
                studentId: input.studentId,
                instructorId: input.instructorId,
                comments: input.comments?.trim() || undefined,
              },
            ],
            { session },
          )
          booking = created
        })
      } catch (error) {
        this.logger.error(
          `Booking transaction failed for student ${input.studentId} on ${input.date}`,
          error instanceof Error ? error.stack : error,
        )
        throw new InternalServerErrorException(
          'Could not save the booking — please try again.',
        )
      }

      return booking!
    } finally {
      await session.endSession()
    }
  }
}

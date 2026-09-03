import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import {
  AvailabilityEntry,
  AvailabilityEntryDocument,
} from '../availability/schemas/availability-entry.schema'
import { Booking, BookingDocument } from '../bookings/schemas/booking.schema'
import {
  Instructor,
  InstructorDocument,
} from '../instructors/schemas/instructor.schema'
import {
  InstructorTimeOff,
  InstructorTimeOffDocument,
} from '../instructor-time-off/schemas/instructor-time-off.schema'
import { Student, StudentDocument } from '../students/schemas/student.schema'
import {
  MINUTES_PER_DAY,
  computeUnavailableGaps,
  expandAvailability,
  formatMinutes,
} from '../availability/availability-expansion'
import { isEntryInOrAfterMonth } from '../availability/availability.service'
import { formatISODate, startOfCurrentMonth, toISODate } from '../common/date'

// Bounds how far derived 'unavailability' events reach. Must match
// MAX_MONTHS_AHEAD in components/AgendaCalendar.tsx — the UI can't browse
// further than that, so deriving beyond it is wasted work. lib/ isn't shared
// with server/, so this is a deliberate duplicated constant.
const AGENDA_MONTHS_AHEAD = 3

// No Users module yet (no auth) — plain id for now, becomes a real
// ObjectId ref once the Users module exists.
const DEFAULT_STUDENT_ID = 'student-1'

export type AgendaQuery = {
  studentId?: string
  instructorId?: string
}

export type AgendaBookingEvent = {
  id: string
  type: 'booking'
  date: string
  time: string
  tailNumber?: string
  instructorName: string
  studentName: string
  lessonType: string
  trainingCode?: string
  comments?: string
  cancelled?: boolean
}

export type DerivedUnavailabilityEvent = {
  id: string
  type: 'unavailability'
  date: string
  // Set on an instructor's time off that the CFI has not approved yet — the
  // UI renders it as a request rather than a confirmed day off.
  pending?: boolean
} & ({ allDay: true } | { allDay: false; timeRange: string })

function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, date.getDate())
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

@Injectable()
export class AgendaService {
  constructor(
    @InjectModel(AvailabilityEntry.name)
    private readonly availabilityEntryModel: Model<AvailabilityEntryDocument>,
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    @InjectModel(Instructor.name)
    private readonly instructorModel: Model<InstructorDocument>,
    @InjectModel(InstructorTimeOff.name)
    private readonly instructorTimeOffModel: Model<InstructorTimeOffDocument>,
    @InjectModel(Student.name)
    private readonly studentModel: Model<StudentDocument>,
  ) {}

  async findAll(query: AgendaQuery = {}) {
    const isInstructorView = Boolean(query.instructorId)
    const studentId = query.studentId ?? DEFAULT_STUDENT_ID

    const bookingFilter = isInstructorView
      ? { instructorId: query.instructorId }
      : { studentId }

    const [bookings, instructors, students] = await Promise.all([
      this.bookingModel.find(bookingFilter).exec(),
      this.instructorModel.find().exec(),
      this.studentModel.find().exec(),
    ])

    const instructorNameById = new Map(
      instructors.map((instructor) => [
        (instructor._id as { toString(): string }).toString(),
        instructor.name,
      ]),
    )
    const studentNameById = new Map(
      students.map((student) => [
        (student._id as { toString(): string }).toString(),
        student.name,
      ]),
    )

    const bookingEvents: AgendaBookingEvent[] = []
    for (const booking of bookings) {
      const date = toISODate(booking.date)
      if (!date) continue
      bookingEvents.push({
        id: (booking._id as { toString(): string }).toString(),
        type: 'booking',
        date,
        time: booking.time,
        tailNumber: booking.tail,
        instructorName:
          instructorNameById.get(booking.instructorId) ?? 'Instructor',
        studentName: studentNameById.get(booking.studentId) ?? booking.person,
        lessonType: booking.type,
        trainingCode: booking.trainingCode,
        comments: booking.comments,
        cancelled: booking.cancelled,
      })
    }

    const monthStart = startOfCurrentMonth()
    const rangeStart = monthStart
    const rangeEnd = addMonths(new Date(), AGENDA_MONTHS_AHEAD)

    if (isInstructorView) {
      const timeOffEntries = await this.instructorTimeOffModel
        .find({
          instructorId: query.instructorId,
          status: { $in: ['approved', 'pending'] },
          date: {
            $gte: formatISODate(rangeStart),
            $lte: formatISODate(rangeEnd),
          },
        })
        .exec()

      const derivedUnavailability: DerivedUnavailabilityEvent[] =
        timeOffEntries.map((entry) => ({
          id: `time-off-${entry.date}`,
          type: 'unavailability',
          date: entry.date,
          allDay: true,
          ...(entry.status === 'pending' ? { pending: true } : {}),
        }))

      return [...bookingEvents, ...derivedUnavailability].sort((a, b) =>
        a.date.localeCompare(b.date),
      )
    }

    const availabilityEntries = (
      await this.availabilityEntryModel.find({ studentId }).exec()
    ).filter((entry) => isEntryInOrAfterMonth(entry, monthStart))

    const coverageByDate = expandAvailability(
      availabilityEntries,
      rangeStart,
      rangeEnd,
    )

    const derivedUnavailability: DerivedUnavailabilityEvent[] = []
    for (let date = rangeStart; date <= rangeEnd; date = addDays(date, 1)) {
      const iso = formatISODate(date)
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

    return [...bookingEvents, ...derivedUnavailability].sort((a, b) =>
      a.date.localeCompare(b.date),
    )
  }
}

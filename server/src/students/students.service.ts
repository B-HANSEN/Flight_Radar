import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Student, StudentDocument } from './schemas/student.schema'
import {
  AvailabilityEntry,
  AvailabilityEntryDocument,
} from '../availability/schemas/availability-entry.schema'
import {
  CalendarEvent,
  CalendarEventDocument,
} from '../agenda/schemas/calendar-event.schema'
import {
  MinuteWindow,
  expandAvailability,
  formatMinutes,
  subtractBookedWindows,
} from '../availability/availability-expansion'

// Bounds how far the schedule looks; matches AgendaService's window so the
// instructor view and a student's own agenda never disagree on "the future".
const SCHEDULE_MONTHS_AHEAD = 3
const SCHEDULE_MONTHS_BEHIND = 3

export type StudentScheduleSlot = {
  id: string
  date: string
  startTime: string
  endTime: string
}

export type StudentScheduleEntry = {
  id: string
  name: string
  course: string
  slots: StudentScheduleSlot[]
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, date.getDate())
}

function parseTimeRangeToWindow(timeRange: string): MinuteWindow | null {
  const [startStr, endStr] = timeRange.split(' - ')
  if (!startStr || !endStr) return null

  const [startHours, startMinutes] = startStr.split(':').map(Number)
  const [endHours, endMinutes] = endStr.split(':').map(Number)
  return {
    start: startHours * 60 + startMinutes,
    end: endHours * 60 + endMinutes,
  }
}

@Injectable()
export class StudentsService {
  constructor(
    @InjectModel(Student.name)
    private readonly studentModel: Model<StudentDocument>,
    @InjectModel(AvailabilityEntry.name)
    private readonly availabilityEntryModel: Model<AvailabilityEntryDocument>,
    @InjectModel(CalendarEvent.name)
    private readonly calendarEventModel: Model<CalendarEventDocument>,
  ) {}

  findAll() {
    return this.studentModel.find().exec()
  }

  async findSchedule(): Promise<StudentScheduleEntry[]> {
    const [students, availabilityEntries, bookings] = await Promise.all([
      this.studentModel.find().exec(),
      this.availabilityEntryModel.find().exec(),
      this.calendarEventModel.find({ type: 'booking' }).exec(),
    ])

    const rangeStart = startOfDay(
      addMonths(new Date(), -SCHEDULE_MONTHS_BEHIND),
    )
    const rangeEnd = startOfDay(addMonths(new Date(), SCHEDULE_MONTHS_AHEAD))

    return students.map((student) => {
      const studentId = student._id.toString()

      const coverageByDate = expandAvailability(
        availabilityEntries.filter((entry) => entry.studentId === studentId),
        rangeStart,
        rangeEnd,
      )

      const bookedWindowsByDate = new Map<string, MinuteWindow[]>()
      for (const booking of bookings) {
        if (booking.studentId !== studentId || !booking.time) continue
        const window = parseTimeRangeToWindow(booking.time)
        if (!window) continue
        const windows = bookedWindowsByDate.get(booking.date) ?? []
        windows.push(window)
        bookedWindowsByDate.set(booking.date, windows)
      }

      const slots: StudentScheduleSlot[] = []
      for (const [date, coveredWindows] of coverageByDate) {
        const openWindows = subtractBookedWindows(
          coveredWindows,
          bookedWindowsByDate.get(date) ?? [],
        )
        openWindows.forEach((window, index) => {
          slots.push({
            id: `${studentId}-${date}-${index}`,
            date,
            startTime: formatMinutes(window.start),
            endTime: formatMinutes(window.end),
          })
        })
      }
      slots.sort(
        (a, b) =>
          a.date.localeCompare(b.date) ||
          a.startTime.localeCompare(b.startTime),
      )

      return {
        id: studentId,
        name: student.name,
        course: student.course,
        slots,
      }
    })
  }
}

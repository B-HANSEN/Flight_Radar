import { Test, TestingModule } from '@nestjs/testing'
import { getModelToken } from '@nestjs/mongoose'
import { AgendaService } from './agenda.service'
import { AvailabilityEntry } from '../availability/schemas/availability-entry.schema'
import { Booking } from '../bookings/schemas/booking.schema'
import { Instructor } from '../instructors/schemas/instructor.schema'
import { InstructorTimeOff } from '../instructor-time-off/schemas/instructor-time-off.schema'
import { Student } from '../students/schemas/student.schema'

function toISODate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function toDMY(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

function findMock<T>(value: T[]) {
  return jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(value) })
}

describe('AgendaService', () => {
  const today = new Date()

  const bookings = [
    {
      _id: { toString: () => 'booking-1' },
      type: 'Dual instruction',
      date: toDMY(today),
      tail: 'EC-ERV',
      person: 'Jamie Torres',
      time: '09:00 - 10:00',
      studentId: 'student-1',
      instructorId: 'instructor-1',
      trainingCode: 'VBD15',
      comments: 'circuits',
    },
  ]

  const instructors = [
    { _id: { toString: () => 'instructor-1' }, name: 'James Whitfield' },
  ]
  const students = [
    { _id: { toString: () => 'student-1' }, name: 'Jamie Torres' },
  ]

  const availabilityEntries = [
    {
      dateLabel: `On ${toDMY(today)}`,
      dateMode: 'on',
      onDate: toDMY(today),
      timeLabel: 'Between 09:00 and 12:00',
      timeMode: 'between',
      startTime: '09:00',
      endTime: '12:00',
      recurrence: 'Everyday',
      recurrenceMode: 'everyday',
      studentId: 'student-1',
    },
  ]

  async function buildService(overrides?: {
    bookings?: unknown[]
    availabilityEntries?: unknown[]
    instructorTimeOff?: unknown[]
  }) {
    const bookingModel = { find: findMock(overrides?.bookings ?? bookings) }
    const availabilityEntryModel = {
      find: findMock(overrides?.availabilityEntries ?? availabilityEntries),
    }
    const instructorModel = { find: findMock(instructors) }
    const instructorTimeOffModel = {
      find: findMock(overrides?.instructorTimeOff ?? []),
    }
    const studentModel = { find: findMock(students) }

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        AgendaService,
        {
          provide: getModelToken(AvailabilityEntry.name),
          useValue: availabilityEntryModel,
        },
        { provide: getModelToken(Booking.name), useValue: bookingModel },
        { provide: getModelToken(Instructor.name), useValue: instructorModel },
        {
          provide: getModelToken(InstructorTimeOff.name),
          useValue: instructorTimeOffModel,
        },
        { provide: getModelToken(Student.name), useValue: studentModel },
      ],
    }).compile()

    return {
      service: app.get<AgendaService>(AgendaService),
      bookingModel,
      availabilityEntryModel,
      instructorTimeOffModel,
    }
  }

  it('scopes bookings to the given student and enriches them', async () => {
    const { service, bookingModel } = await buildService()
    const result = await service.findAll({ studentId: 'student-1' })

    expect(bookingModel.find).toHaveBeenCalledWith({ studentId: 'student-1' })
    expect(result).toContainEqual(
      expect.objectContaining({
        id: 'booking-1',
        type: 'booking',
        date: toISODate(today),
        time: '09:00 - 10:00',
        tailNumber: 'EC-ERV',
        instructorName: 'James Whitfield',
        studentName: 'Jamie Torres',
        lessonType: 'Dual instruction',
        trainingCode: 'VBD15',
        comments: 'circuits',
      }),
    )
  })

  it('derives partial-day unavailability gaps around a covered window', async () => {
    const { service } = await buildService()
    const result = await service.findAll({ studentId: 'student-1' })
    const todaysUnavailability = result.filter(
      (event) =>
        event.type === 'unavailability' && event.date === toISODate(today),
    )

    expect(todaysUnavailability).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ allDay: false, timeRange: '00:00 - 09:00' }),
        expect.objectContaining({ allDay: false, timeRange: '12:00 - 24:00' }),
      ]),
    )
  })

  it('derives a full-day unavailability block for a date with no availability', async () => {
    const { service } = await buildService()
    const result = await service.findAll({ studentId: 'student-1' })
    const tomorrow = toISODate(
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
    )
    const event = result.find(
      (candidate) =>
        candidate.type === 'unavailability' && candidate.date === tomorrow,
    ) as { allDay?: boolean } | undefined

    expect(event?.allDay).toBe(true)
  })

  it('produces no unavailability block for a fully covered date', async () => {
    const { service } = await buildService({
      bookings: [],
      availabilityEntries: [
        {
          dateLabel: `On ${toDMY(today)}`,
          dateMode: 'on',
          onDate: toDMY(today),
          timeLabel: 'All day',
          timeMode: 'allDay',
          recurrence: 'Everyday',
          recurrenceMode: 'everyday',
          studentId: 'student-1',
        },
      ],
    })
    const result = await service.findAll({ studentId: 'student-1' })

    expect(
      result.some(
        (event) =>
          event.type === 'unavailability' && event.date === toISODate(today),
      ),
    ).toBe(false)
  })

  it('for an instructor view with no time off returns only bookings', async () => {
    const { service, bookingModel, availabilityEntryModel } =
      await buildService()
    const result = await service.findAll({ instructorId: 'instructor-1' })

    expect(bookingModel.find).toHaveBeenCalledWith({
      instructorId: 'instructor-1',
    })
    expect(availabilityEntryModel.find).not.toHaveBeenCalled()
    expect(result.every((event) => event.type === 'booking')).toBe(true)
  })

  it('for an instructor view derives a full-day block for each time-off date', async () => {
    const { service, instructorTimeOffModel } = await buildService({
      instructorTimeOff: [
        {
          instructorId: 'instructor-1',
          date: '2026-09-07',
          type: 'regular',
          status: 'approved',
        },
      ],
    })
    const result = await service.findAll({ instructorId: 'instructor-1' })

    expect(instructorTimeOffModel.find).toHaveBeenCalledWith(
      expect.objectContaining({
        instructorId: 'instructor-1',
        status: { $in: ['approved', 'pending'] },
      }),
    )
    expect(result).toContainEqual(
      expect.objectContaining({
        type: 'unavailability',
        date: '2026-09-07',
        allDay: true,
      }),
    )
    expect(result).not.toContainEqual(
      expect.objectContaining({ date: '2026-09-07', pending: true }),
    )
  })

  it('for an instructor view flags a not-yet-approved day off as pending', async () => {
    const { service } = await buildService({
      instructorTimeOff: [
        {
          instructorId: 'instructor-1',
          date: '2026-09-07',
          type: 'personal',
          status: 'pending',
        },
      ],
    })
    const result = await service.findAll({ instructorId: 'instructor-1' })

    expect(result).toContainEqual(
      expect.objectContaining({
        type: 'unavailability',
        date: '2026-09-07',
        allDay: true,
        pending: true,
      }),
    )
  })
})

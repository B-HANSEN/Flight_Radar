import { Test, TestingModule } from '@nestjs/testing'
import { getModelToken } from '@nestjs/mongoose'
import { StudentsService } from './students.service'
import { Student } from './schemas/student.schema'
import { AvailabilityEntry } from '../availability/schemas/availability-entry.schema'
import { CalendarEvent } from '../agenda/schemas/calendar-event.schema'

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

describe('StudentsService', () => {
  let service: StudentsService
  const today = new Date()

  const students = [
    {
      _id: { toString: () => 'student-a' },
      name: 'Alex Moreau',
      course: 'CPL Flight Phase',
    },
    {
      _id: { toString: () => 'student-b' },
      name: 'Priya Shah',
      course: 'PPL Flight Phase',
    },
  ]

  const availabilityEntries = [
    {
      dateMode: 'on',
      onDate: toDMY(today),
      timeMode: 'between',
      startTime: '09:00',
      endTime: '12:00',
      recurrenceMode: 'everyday',
      studentId: 'student-a',
    },
  ]

  const bookings = [
    {
      type: 'booking',
      date: toISODate(today),
      time: '09:00 - 10:00',
      studentId: 'student-a',
    },
  ]

  const studentModel = {
    find: jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(students) }),
  }
  const availabilityEntryModel = {
    find: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(availabilityEntries),
    }),
  }
  const calendarEventModel = {
    find: jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(bookings) }),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    studentModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue(students),
    })
    availabilityEntryModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue(availabilityEntries),
    })
    calendarEventModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue(bookings),
    })

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        { provide: getModelToken(Student.name), useValue: studentModel },
        {
          provide: getModelToken(AvailabilityEntry.name),
          useValue: availabilityEntryModel,
        },
        {
          provide: getModelToken(CalendarEvent.name),
          useValue: calendarEventModel,
        },
      ],
    }).compile()

    service = app.get<StudentsService>(StudentsService)
  })

  it('only reads active (non-cancelled) booking-type calendar events', async () => {
    await service.findSchedule()
    expect(calendarEventModel.find).toHaveBeenCalledWith({
      type: 'booking',
      cancelled: { $ne: true },
    })
  })

  it('returns one entry per student, carrying name and course through', async () => {
    const result = await service.findSchedule()

    expect(result).toHaveLength(2)
    expect(result.map((entry) => entry.name)).toEqual([
      'Alex Moreau',
      'Priya Shah',
    ])
    expect(result[0].course).toBe('CPL Flight Phase')
  })

  it("subtracts a booked window from that student's open slots", async () => {
    const result = await service.findSchedule()
    const alex = result.find((entry) => entry.id === 'student-a')

    expect(alex?.slots).toEqual([
      {
        id: `student-a-${toISODate(today)}-0`,
        date: toISODate(today),
        startTime: '10:00',
        endTime: '12:00',
      },
    ])
  })

  it('gives a student with no availability an empty slot list', async () => {
    const result = await service.findSchedule()
    const priya = result.find((entry) => entry.id === 'student-b')

    expect(priya?.slots).toEqual([])
  })
})

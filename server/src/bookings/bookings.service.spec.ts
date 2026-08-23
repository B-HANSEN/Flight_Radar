import { ConflictException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { getModelToken } from '@nestjs/mongoose'
import { BookingsService } from './bookings.service'
import { Booking } from './schemas/booking.schema'
import { Student } from '../students/schemas/student.schema'
import { Aircraft } from '../aircraft/schemas/aircraft.schema'
import { CalendarEvent } from '../agenda/schemas/calendar-event.schema'

describe('BookingsService', () => {
  let service: BookingsService

  const student = { _id: 'student-1', name: 'Jamie Torres' }
  const aircraft = { _id: 'aircraft-1', arcid: 'EC-JOB' }

  const bookingModel = { find: jest.fn(), create: jest.fn() }
  const studentModel = { findById: jest.fn() }
  const aircraftModel = { findById: jest.fn() }
  const calendarEventModel = { find: jest.fn(), create: jest.fn() }

  const input = {
    studentId: 'student-1',
    aircraftId: 'aircraft-1',
    date: '2026-08-27',
    startTime: '09:00',
    endTime: '11:00',
    lessonType: 'Dual instruction',
    comments: 'Cover steep turns',
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    studentModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(student),
    })
    aircraftModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(aircraft),
    })
    calendarEventModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue([]),
    })
    calendarEventModel.create.mockResolvedValue({})
    bookingModel.create.mockResolvedValue({ id: 'booking-1', ...input })

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        { provide: getModelToken(Booking.name), useValue: bookingModel },
        { provide: getModelToken(Student.name), useValue: studentModel },
        { provide: getModelToken(Aircraft.name), useValue: aircraftModel },
        {
          provide: getModelToken(CalendarEvent.name),
          useValue: calendarEventModel,
        },
      ],
    }).compile()

    service = app.get<BookingsService>(BookingsService)
  })

  it('creates a booking-type calendar event so the slot no longer shows as open', async () => {
    await service.create(input)

    expect(calendarEventModel.create).toHaveBeenCalledWith({
      type: 'booking',
      date: '2026-08-27',
      time: '09:00 - 11:00',
      tailNumber: 'EC-JOB',
      flightLines: ['Cover steep turns'],
      studentId: 'student-1',
    })
  })

  it('creates a booking with the display-formatted date and resolved student/aircraft', async () => {
    await service.create(input)

    expect(bookingModel.create).toHaveBeenCalledWith({
      type: 'Dual instruction',
      date: '27/08/2026',
      tail: 'EC-JOB',
      person: 'Jamie Torres',
      time: '09:00 - 11:00',
      studentId: 'student-1',
    })
  })

  it('throws when the student does not exist', async () => {
    studentModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    })

    await expect(service.create(input)).rejects.toThrow(NotFoundException)
  })

  it('throws when the aircraft does not exist', async () => {
    aircraftModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    })

    await expect(service.create(input)).rejects.toThrow(NotFoundException)
  })

  it('throws a conflict when the student already has an overlapping booking that day', async () => {
    calendarEventModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue([
        {
          type: 'booking',
          studentId: 'student-1',
          date: '2026-08-27',
          time: '10:00 - 12:00',
        },
      ]),
    })

    await expect(service.create(input)).rejects.toThrow(ConflictException)
    expect(bookingModel.create).not.toHaveBeenCalled()
  })

  it('allows a booking that only touches the edge of an existing one', async () => {
    calendarEventModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue([
        {
          type: 'booking',
          studentId: 'student-1',
          date: '2026-08-27',
          time: '11:00 - 13:00',
        },
      ]),
    })

    await expect(service.create(input)).resolves.toBeDefined()
  })

  it('ignores cancelled bookings when checking for a conflict', async () => {
    calendarEventModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue([]),
    })

    await service.create(input)

    expect(calendarEventModel.find).toHaveBeenCalledWith({
      type: 'booking',
      studentId: 'student-1',
      date: '2026-08-27',
      cancelled: { $ne: true },
    })
  })
})

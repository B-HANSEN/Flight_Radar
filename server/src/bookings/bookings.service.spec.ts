import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { getModelToken } from '@nestjs/mongoose'
import { BookingsService } from './bookings.service'
import { Booking } from './schemas/booking.schema'
import { Student } from '../students/schemas/student.schema'
import { Aircraft } from '../aircraft/schemas/aircraft.schema'
import { Instructor } from '../instructors/schemas/instructor.schema'
import { CalendarEvent } from '../agenda/schemas/calendar-event.schema'
import { AvailabilityEntry } from '../availability/schemas/availability-entry.schema'

describe('BookingsService', () => {
  let service: BookingsService

  const student = { _id: 'student-1', name: 'Jamie Torres' }
  const aircraft = { _id: 'aircraft-1', arcid: 'EC-JOB' }
  const instructor = { _id: 'instructor-1', name: 'James Whitfield' }

  // Covers the `input` window (27/08/2026, 09:00-11:00) so the availability
  // check passes by default; individual tests override it.
  const availabilityCoveringInput = {
    dateMode: 'on',
    onDate: '27/08/2026',
    timeMode: 'between',
    startTime: '08:00',
    endTime: '18:00',
    recurrenceMode: 'everyday',
  }

  const bookingModel = { find: jest.fn(), create: jest.fn() }
  const studentModel = { findById: jest.fn() }
  const aircraftModel = { findById: jest.fn() }
  const instructorModel = { findById: jest.fn() }
  const calendarEventModel = { find: jest.fn(), create: jest.fn() }
  const availabilityEntryModel = { find: jest.fn() }

  const input = {
    studentId: 'student-1',
    aircraftId: 'aircraft-1',
    instructorId: 'instructor-1',
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
    instructorModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(instructor),
    })
    calendarEventModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue([]),
    })
    calendarEventModel.create.mockResolvedValue({})
    availabilityEntryModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue([availabilityCoveringInput]),
    })
    bookingModel.create.mockResolvedValue({ id: 'booking-1', ...input })

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        { provide: getModelToken(Booking.name), useValue: bookingModel },
        { provide: getModelToken(Student.name), useValue: studentModel },
        { provide: getModelToken(Aircraft.name), useValue: aircraftModel },
        {
          provide: getModelToken(Instructor.name),
          useValue: instructorModel,
        },
        {
          provide: getModelToken(CalendarEvent.name),
          useValue: calendarEventModel,
        },
        {
          provide: getModelToken(AvailabilityEntry.name),
          useValue: availabilityEntryModel,
        },
      ],
    }).compile()

    service = app.get<BookingsService>(BookingsService)
  })

  it('lists every booking when no filter is given', async () => {
    bookingModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue([]),
    })

    await service.findAll()

    expect(bookingModel.find).toHaveBeenCalledWith({})
  })

  it('scopes the list to one student when a studentId is given', async () => {
    bookingModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue([]),
    })

    await service.findAll({ studentId: 'student-1' })

    expect(bookingModel.find).toHaveBeenCalledWith({ studentId: 'student-1' })
  })

  it('scopes the list to one instructor when an instructorId is given', async () => {
    bookingModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue([]),
    })

    await service.findAll({ instructorId: 'instructor-1' })

    expect(bookingModel.find).toHaveBeenCalledWith({
      instructorId: 'instructor-1',
    })
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

  it('creates a booking with the display-formatted date and resolved student/aircraft/instructor', async () => {
    await service.create(input)

    expect(bookingModel.create).toHaveBeenCalledWith({
      type: 'Dual instruction',
      date: '27/08/2026',
      tail: 'EC-JOB',
      person: 'Jamie Torres',
      time: '09:00 - 11:00',
      studentId: 'student-1',
      instructorId: 'instructor-1',
      comments: 'Cover steep turns',
    })
  })

  it('stores no comments when the note is blank', async () => {
    await service.create({ ...input, comments: '   ' })

    expect(bookingModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ comments: undefined }),
    )
  })

  it('creates a Theory lesson with no aircraft when aircraftId is omitted', async () => {
    await service.create({
      studentId: input.studentId,
      instructorId: input.instructorId,
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
      lessonType: 'Theory',
      comments: 'Navigation',
    })

    expect(aircraftModel.findById).not.toHaveBeenCalled()
    expect(bookingModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'Theory', tail: undefined }),
    )
    expect(calendarEventModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ tailNumber: undefined }),
    )
  })

  it('rejects a non-Theory booking with no aircraft', async () => {
    await expect(
      service.create({
        studentId: input.studentId,
        instructorId: input.instructorId,
        date: input.date,
        startTime: input.startTime,
        endTime: input.endTime,
        lessonType: 'Dual instruction',
      }),
    ).rejects.toThrow(BadRequestException)

    expect(bookingModel.create).not.toHaveBeenCalled()
  })

  it('throws when the student does not exist', async () => {
    studentModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    })

    await expect(service.create(input)).rejects.toThrow(NotFoundException)
  })

  it('throws when the instructor does not exist', async () => {
    instructorModel.findById.mockReturnValue({
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

  it('throws when a booking only touches the edge of an existing one for the same student (inside the 90 min buffer)', async () => {
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

    await expect(service.create(input)).rejects.toThrow(ConflictException)
    expect(bookingModel.create).not.toHaveBeenCalled()
  })

  it('throws when a booking is within the 90 min buffer but does not overlap', async () => {
    calendarEventModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue([
        {
          type: 'booking',
          studentId: 'student-1',
          date: '2026-08-27',
          time: '11:30 - 13:00',
        },
      ]),
    })

    await expect(service.create(input)).rejects.toThrow(ConflictException)
    expect(bookingModel.create).not.toHaveBeenCalled()
  })

  it('allows a booking that clears the 90 min buffer', async () => {
    calendarEventModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue([
        {
          type: 'booking',
          studentId: 'student-1',
          date: '2026-08-27',
          time: '12:30 - 14:00',
        },
      ]),
    })

    await expect(service.create(input)).resolves.toBeDefined()
  })

  it('does not apply the student buffer to a different student on the same aircraft', async () => {
    calendarEventModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue([
        {
          type: 'booking',
          studentId: 'student-2',
          date: '2026-08-27',
          time: '11:00 - 13:00',
        },
      ]),
    })

    await expect(service.create(input)).resolves.toBeDefined()
  })

  it('throws a conflict when a different student already has the aircraft booked at an overlapping time', async () => {
    calendarEventModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue([
        {
          type: 'booking',
          studentId: 'student-2',
          tailNumber: 'EC-JOB',
          date: '2026-08-27',
          time: '10:00 - 12:00',
        },
      ]),
    })

    await expect(service.create(input)).rejects.toThrow(ConflictException)
    expect(bookingModel.create).not.toHaveBeenCalled()
  })

  it('rejects a booking placed outside the student’s declared availability', async () => {
    availabilityEntryModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue([
        {
          dateMode: 'on',
          onDate: '27/08/2026',
          timeMode: 'between',
          startTime: '13:00',
          endTime: '17:00',
          recurrenceMode: 'everyday',
        },
      ]),
    })

    await expect(service.create(input)).rejects.toThrow(ConflictException)
    expect(bookingModel.create).not.toHaveBeenCalled()
  })

  it('rejects a booking on a day the student declared no availability', async () => {
    availabilityEntryModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue([]),
    })

    await expect(service.create(input)).rejects.toThrow(ConflictException)
    expect(bookingModel.create).not.toHaveBeenCalled()
  })

  it('allows a booking that a recurring weekday availability entry covers', async () => {
    availabilityEntryModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue([
        {
          dateMode: 'range',
          fromDate: '01/08/2026',
          toDate: '31/08/2026',
          timeMode: 'between',
          startTime: '08:00',
          endTime: '12:00',
          recurrenceMode: 'days',
          recurrenceDays: ['thu'], // 27/08/2026 is a Thursday
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
      date: '2026-08-27',
      cancelled: { $ne: true },
      $or: [{ studentId: 'student-1' }, { tailNumber: 'EC-JOB' }],
    })
  })
})

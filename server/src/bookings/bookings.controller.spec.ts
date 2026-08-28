import { Test, TestingModule } from '@nestjs/testing'
import { BookingsController } from './bookings.controller'
import { BookingsService } from './bookings.service'
import { Booking } from './schemas/booking.schema'

describe('BookingsController', () => {
  let controller: BookingsController
  const bookings: Booking[] = [
    {
      type: 'Instruction',
      date: '15/08/2026',
      tail: 'EC-ERV',
      person: 'J. Whitfield',
      time: '10:00 - 11:30',
      studentId: 'student-1',
      instructorId: 'instructor-1',
    },
  ]
  const bookingsService = {
    findAll: jest.fn().mockResolvedValue(bookings),
    create: jest.fn().mockResolvedValue(bookings[0]),
  }

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [BookingsController],
      providers: [{ provide: BookingsService, useValue: bookingsService }],
    }).compile()

    controller = app.get<BookingsController>(BookingsController)
  })

  it('returns the bookings from the service', async () => {
    await expect(controller.findAll()).resolves.toBe(bookings)
    expect(bookingsService.findAll).toHaveBeenCalled()
  })

  it('creates a booking through the service', async () => {
    const input = {
      studentId: 'student-1',
      aircraftId: 'aircraft-1',
      instructorId: 'instructor-1',
      date: '2026-08-27',
      startTime: '09:00',
      endTime: '11:00',
      lessonType: 'Dual instruction',
    }

    await expect(controller.create(input)).resolves.toBe(bookings[0])
    expect(bookingsService.create).toHaveBeenCalledWith(input)
  })
})

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
    },
  ]
  const bookingsService = { findAll: jest.fn().mockResolvedValue(bookings) }

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
})

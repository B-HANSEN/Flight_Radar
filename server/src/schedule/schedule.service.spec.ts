import { Test, TestingModule } from '@nestjs/testing'
import { getModelToken } from '@nestjs/mongoose'
import { ScheduleService } from './schedule.service'
import { ScheduleBlock } from './schemas/schedule-block.schema'
import { Booking } from '../bookings/schemas/booking.schema'
import { Aircraft } from '../aircraft/schemas/aircraft.schema'

describe('ScheduleService', () => {
  let service: ScheduleService

  const staticBlock = {
    aircraftId: 'aircraft-1',
    period: 'day',
    label: 'Not available',
    kind: 'unavailable',
    start: 9,
    end: 14.5,
  }

  const aircraft = [{ _id: { toString: () => 'aircraft-2' }, arcid: 'EC-DKN' }]

  const scheduleBlockModel = { find: jest.fn() }
  const bookingModel = { find: jest.fn() }
  const aircraftModel = { find: jest.fn() }

  beforeEach(async () => {
    jest.clearAllMocks()
    scheduleBlockModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue([staticBlock]),
    })
    bookingModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue([]),
    })
    aircraftModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue(aircraft),
    })

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduleService,
        {
          provide: getModelToken(ScheduleBlock.name),
          useValue: scheduleBlockModel,
        },
        { provide: getModelToken(Booking.name), useValue: bookingModel },
        { provide: getModelToken(Aircraft.name), useValue: aircraftModel },
      ],
    }).compile()

    service = app.get<ScheduleService>(ScheduleService)
  })

  it('returns the seeded schedule blocks untouched', async () => {
    const result = await service.findAll()

    expect(result).toContainEqual(staticBlock)
  })

  it('turns a booking into a dated day block and a dated week block', async () => {
    bookingModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue([
        {
          _id: { toString: () => 'booking-1' },
          type: 'Dual instruction',
          date: '24/08/2026',
          tail: 'EC-DKN',
          person: 'Alex Moreau',
          time: '13:00 - 14:30',
          studentId: 'student-1',
        },
      ]),
    })

    const result = await service.findAll()

    expect(result).toContainEqual({
      id: 'booking-1-day',
      aircraftId: 'aircraft-2',
      period: 'day',
      label: 'Dual instruction · Alex Moreau',
      kind: 'reserved',
      start: 13,
      end: 14.5,
      date: '2026-08-24',
    })
    // 2026-08-24 is a Monday -> week day-index 0
    expect(result).toContainEqual({
      id: 'booking-1-week',
      aircraftId: 'aircraft-2',
      period: 'week',
      label: 'Dual instruction · Alex Moreau',
      kind: 'reserved',
      start: 13 / 24,
      end: 14.5 / 24,
      date: '2026-08-24',
    })
  })

  it('skips a booking whose aircraft tail is not in the fleet', async () => {
    bookingModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue([
        {
          _id: { toString: () => 'booking-1' },
          type: 'Dual instruction',
          date: '24/08/2026',
          tail: 'EC-UNKNOWN',
          person: 'Alex Moreau',
          time: '13:00 - 14:30',
          studentId: 'student-1',
        },
      ]),
    })

    const result = await service.findAll()

    expect(result).toEqual([staticBlock])
  })
})

import { Test, TestingModule } from '@nestjs/testing'
import { getModelToken } from '@nestjs/mongoose'
import { ScheduleService } from './schedule.service'
import { ScheduleBlock } from './schemas/schedule-block.schema'
import { Booking } from '../bookings/schemas/booking.schema'
import { Aircraft } from '../aircraft/schemas/aircraft.schema'
import { Instructor } from '../instructors/schemas/instructor.schema'

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
  const instructorModel = { find: jest.fn() }

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
    instructorModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue([]),
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
        {
          provide: getModelToken(Instructor.name),
          useValue: instructorModel,
        },
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
          aircraftId: { toString: () => 'aircraft-2' },
          person: 'Alex Moreau',
          time: '13:00 - 14:30',
          studentId: 'student-1',
          instructorId: 'instructor-1',
        },
      ]),
    })
    instructorModel.find.mockReturnValue({
      exec: jest
        .fn()
        .mockResolvedValue([
          { _id: { toString: () => 'instructor-1' }, name: 'James Whitfield' },
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
      studentName: 'Alex Moreau',
      instructorName: 'James Whitfield',
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
      studentName: 'Alex Moreau',
      instructorName: 'James Whitfield',
    })
  })

  it('leaves instructorName undefined when the booking instructor is unknown', async () => {
    bookingModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue([
        {
          _id: { toString: () => 'booking-1' },
          type: 'Dual instruction',
          date: '24/08/2026',
          aircraftId: { toString: () => 'aircraft-2' },
          person: 'Alex Moreau',
          time: '13:00 - 14:30',
          studentId: 'student-1',
          instructorId: 'ghost',
        },
      ]),
    })

    const result = await service.findAll()

    expect(result).toContainEqual(
      expect.objectContaining({
        id: 'booking-1-day',
        studentName: 'Alex Moreau',
        instructorName: undefined,
      }),
    )
  })

  it('carries the booking comments onto the day and week blocks', async () => {
    bookingModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue([
        {
          _id: { toString: () => 'booking-1' },
          type: 'Theory',
          date: '24/08/2026',
          aircraftId: { toString: () => 'aircraft-2' },
          person: 'Alex Moreau',
          time: '13:00 - 14:30',
          studentId: 'student-1',
          instructorId: 'instructor-1',
          comments: 'Navigation',
        },
      ]),
    })

    const result = await service.findAll()

    expect(result).toContainEqual(
      expect.objectContaining({ id: 'booking-1-day', comments: 'Navigation' }),
    )
    expect(result).toContainEqual(
      expect.objectContaining({ id: 'booking-1-week', comments: 'Navigation' }),
    )
  })

  it('skips a booking with no tail (a Theory lesson) since the board has no row for it', async () => {
    bookingModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue([
        {
          _id: { toString: () => 'booking-1' },
          type: 'Theory',
          date: '24/08/2026',
          person: 'Alex Moreau',
          time: '13:00 - 14:30',
          studentId: 'student-1',
          instructorId: 'instructor-1',
          comments: 'Navigation',
        },
      ]),
    })

    const result = await service.findAll()

    expect(result).toEqual([staticBlock])
  })

  describe('findBusyAircraft', () => {
    it('flags an aircraft with a recurring demo block overlapping the window', async () => {
      const result = await service.findBusyAircraft(
        '2026-08-24',
        '10:00',
        '11:00',
      )

      expect(result).toEqual([
        {
          aircraftId: 'aircraft-1',
          kind: 'unavailable',
          label: 'Not available',
        },
      ])
    })

    it('ignores a demo block that does not overlap the requested time', async () => {
      const result = await service.findBusyAircraft(
        '2026-08-24',
        '15:00',
        '16:00',
      )

      expect(result).toEqual([])
    })

    it('flags an aircraft with a real booking only on the booked date', async () => {
      bookingModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([
          {
            _id: { toString: () => 'booking-1' },
            type: 'Dual instruction',
            date: '24/08/2026',
            aircraftId: { toString: () => 'aircraft-2' },
            person: 'Alex Moreau',
            time: '13:00 - 14:30',
            studentId: 'student-1',
          },
        ]),
      })

      const onDate = await service.findBusyAircraft(
        '2026-08-24',
        '13:30',
        '14:00',
      )
      expect(onDate).toContainEqual({
        aircraftId: 'aircraft-2',
        kind: 'reserved',
        label: 'Dual instruction · Alex Moreau',
      })

      const otherDate = await service.findBusyAircraft(
        '2026-08-25',
        '13:30',
        '14:00',
      )
      expect(otherDate).not.toContainEqual(
        expect.objectContaining({ aircraftId: 'aircraft-2' }),
      )
    })
  })

  describe('findStudentFlights', () => {
    it("returns a student's bookings on the given date, with the instructor's name in the label", async () => {
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
            instructorId: 'instructor-1',
          },
        ]),
      })
      instructorModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([
          {
            _id: { toString: () => 'instructor-1' },
            name: 'James Whitfield',
          },
        ]),
      })

      const result = await service.findStudentFlights('student-1', '2026-08-24')

      expect(bookingModel.find).toHaveBeenCalledWith({
        studentId: 'student-1',
        date: '24/08/2026',
      })
      expect(result).toEqual([
        {
          id: 'booking-1',
          startTime: '13:00',
          endTime: '14:30',
          label: 'Dual instruction · EC-DKN · James Whitfield',
        },
      ])
    })

    it('omits the instructor name from the label when the instructor cannot be resolved', async () => {
      bookingModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([
          {
            _id: { toString: () => 'booking-1' },
            type: 'Dual instruction',
            date: '24/08/2026',
            tail: 'EC-DKN',
            time: '13:00 - 14:30',
            studentId: 'student-1',
            instructorId: 'unknown-instructor',
          },
        ]),
      })

      const result = await service.findStudentFlights('student-1', '2026-08-24')

      expect(result).toEqual([
        {
          id: 'booking-1',
          startTime: '13:00',
          endTime: '14:30',
          label: 'Dual instruction · EC-DKN',
        },
      ])
    })

    it('sorts multiple flights by start time', async () => {
      bookingModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([
          {
            _id: { toString: () => 'booking-2' },
            type: 'Checkride prep',
            date: '24/08/2026',
            tail: 'EC-DMC',
            time: '15:00 - 16:00',
            studentId: 'student-1',
          },
          {
            _id: { toString: () => 'booking-1' },
            type: 'Dual instruction',
            date: '24/08/2026',
            tail: 'EC-DKN',
            time: '13:00 - 14:30',
            studentId: 'student-1',
          },
        ]),
      })

      const result = await service.findStudentFlights('student-1', '2026-08-24')

      expect(result.map((flight) => flight.id)).toEqual([
        'booking-1',
        'booking-2',
      ])
    })
  })

  it('skips a booking whose aircraft is not (or no longer) in the fleet', async () => {
    bookingModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue([
        {
          _id: { toString: () => 'booking-1' },
          type: 'Dual instruction',
          date: '24/08/2026',
          aircraftId: { toString: () => 'aircraft-deleted' },
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

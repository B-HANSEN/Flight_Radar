import { Test, TestingModule } from '@nestjs/testing'
import { getModelToken } from '@nestjs/mongoose'
import { AgendaService } from './agenda.service'
import { CalendarEvent } from './schemas/calendar-event.schema'
import { AvailabilityEntry } from '../availability/schemas/availability-entry.schema'

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

describe('AgendaService', () => {
  let service: AgendaService
  const today = new Date()

  const bookings = [
    {
      type: 'booking',
      date: toISODate(today),
      time: '09:00 - 10:00',
      tailNumber: 'EC-ERV',
      pilotInCommand: 'J. Whitfield [PIC]',
      flightLines: ['VBD01'],
      studentId: 'student-1',
    },
  ]

  const availabilityEntries: Omit<AvailabilityEntry, 'studentId'>[] = [
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
    },
  ]

  const calendarEventModel = {
    find: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(bookings),
    }),
  }
  const availabilityEntryModel = {
    find: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(
        availabilityEntries.map((entry) => ({
          ...entry,
          studentId: 'student-1',
        })),
      ),
    }),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    calendarEventModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue(bookings),
    })
    availabilityEntryModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue(
        availabilityEntries.map((entry) => ({
          ...entry,
          studentId: 'student-1',
        })),
      ),
    })

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        AgendaService,
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

    service = app.get<AgendaService>(AgendaService)
  })

  it('only reads bookings from CalendarEvent, never stored unavailability', async () => {
    await service.findAll()
    expect(calendarEventModel.find).toHaveBeenCalledWith({
      type: 'booking',
      studentId: 'student-1',
    })
  })

  it('includes the real bookings in the result', async () => {
    const result = await service.findAll()
    expect(result).toContainEqual(bookings[0])
  })

  it('derives a partial-day unavailability gap around a covered window', async () => {
    const result = await service.findAll()
    const todayIso = toISODate(today)
    const todaysUnavailability = result.filter(
      (event) => event.type === 'unavailability' && event.date === todayIso,
    ) as Array<{ allDay: boolean; timeRange?: string }>

    expect(todaysUnavailability).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ allDay: false, timeRange: '00:00 - 09:00' }),
        expect.objectContaining({ allDay: false, timeRange: '12:00 - 24:00' }),
      ]),
    )
  })

  it('derives a full-day unavailability block for a date with no availability entry', async () => {
    const result = await service.findAll()
    const uncoveredDate = toISODate(
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
    )
    const event = result.find(
      (candidate) =>
        candidate.type === 'unavailability' && candidate.date === uncoveredDate,
    ) as { allDay?: boolean } | undefined

    expect(event?.allDay).toBe(true)
  })

  it('produces no unavailability block for a date fully covered by availability', async () => {
    const calendarEventModelFullDay = {
      find: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
    }
    const availabilityEntryModelFullDay = {
      find: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([
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
        ]),
      }),
    }

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        AgendaService,
        {
          provide: getModelToken(CalendarEvent.name),
          useValue: calendarEventModelFullDay,
        },
        {
          provide: getModelToken(AvailabilityEntry.name),
          useValue: availabilityEntryModelFullDay,
        },
      ],
    }).compile()

    const fullDayService = app.get<AgendaService>(AgendaService)
    const result = await fullDayService.findAll()
    const todayIso = toISODate(today)

    expect(
      result.some(
        (event) => event.type === 'unavailability' && event.date === todayIso,
      ),
    ).toBe(false)
  })
})

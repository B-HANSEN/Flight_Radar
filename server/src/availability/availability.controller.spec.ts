import { Test, TestingModule } from '@nestjs/testing'
import { AvailabilityController } from './availability.controller'
import { AvailabilityService } from './availability.service'
import { AvailabilityEntry } from './schemas/availability-entry.schema'

describe('AvailabilityController', () => {
  let controller: AvailabilityController
  const entries: AvailabilityEntry[] = [
    {
      dateLabel: 'From 27/08/2026 to 30/08/2026',
      dateMode: 'range',
      fromDate: '27/08/2026',
      toDate: '30/08/2026',
      timeLabel: 'Between 18:00 and 21:00',
      timeMode: 'between',
      startTime: '18:00',
      endTime: '21:00',
      recurrence: 'Everyday',
      recurrenceMode: 'everyday',
      studentId: 'student-1',
    },
  ]
  const createdEntry = entries[0]
  const updatedEntry = { ...entries[0], timeLabel: 'Between 09:00 and 10:00' }
  const availabilityService = {
    findAll: jest.fn().mockResolvedValue(entries),
    create: jest.fn().mockResolvedValue(createdEntry),
    update: jest.fn().mockResolvedValue(updatedEntry),
    remove: jest.fn().mockResolvedValue(entries[0]),
  }

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AvailabilityController],
      providers: [
        { provide: AvailabilityService, useValue: availabilityService },
      ],
    }).compile()

    controller = app.get<AvailabilityController>(AvailabilityController)
  })

  it('returns the availability entries from the service', async () => {
    await expect(controller.findAll()).resolves.toBe(entries)
    expect(availabilityService.findAll).toHaveBeenCalled()
  })

  it('creates an availability entry via the service', async () => {
    const input = {
      dateLabel: 'From 27/08/2026 to 30/08/2026',
      dateMode: 'range' as const,
      fromDate: '27/08/2026',
      toDate: '30/08/2026',
      timeLabel: 'Between 18:00 and 21:00',
      timeMode: 'between' as const,
      startTime: '18:00',
      endTime: '21:00',
      recurrence: 'On Monday, Wednesday',
      recurrenceMode: 'days' as const,
      recurrenceDays: ['mon', 'wed'] as ('mon' | 'wed')[],
    }
    await expect(controller.create(input)).resolves.toBe(createdEntry)
    expect(availabilityService.create).toHaveBeenCalledWith(input)
  })

  it('updates an availability entry via the service', async () => {
    const input = {
      dateLabel: 'From 27/08/2026 to 30/08/2026',
      dateMode: 'range' as const,
      fromDate: '27/08/2026',
      toDate: '30/08/2026',
      timeLabel: 'Between 09:00 and 10:00',
      timeMode: 'between' as const,
      startTime: '09:00',
      endTime: '10:00',
      recurrence: 'Everyday',
      recurrenceMode: 'everyday' as const,
    }
    await expect(controller.update('entry-1', input)).resolves.toBe(
      updatedEntry,
    )
    expect(availabilityService.update).toHaveBeenCalledWith('entry-1', input)
  })

  it('removes an availability entry via the service', async () => {
    await expect(controller.remove('entry-1')).resolves.toBe(entries[0])
    expect(availabilityService.remove).toHaveBeenCalledWith('entry-1')
  })
})

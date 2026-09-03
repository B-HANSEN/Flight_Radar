import { Test, TestingModule } from '@nestjs/testing'
import { AvailabilityController } from './availability.controller'
import { AvailabilityService } from './availability.service'
import { AvailabilityEntry } from './schemas/availability-entry.schema'

describe('AvailabilityController', () => {
  let controller: AvailabilityController
  const entries: AvailabilityEntry[] = [
    {
      dateMode: 'range',
      fromDate: '27/08/2026',
      toDate: '30/08/2026',
      timeMode: 'between',
      startTime: '18:00',
      endTime: '21:00',
      recurrenceMode: 'everyday',
      studentId: 'student-1',
    },
  ]
  const createdEntry = entries[0]
  const updatedEntry = { ...entries[0], startTime: '09:00', endTime: '10:00' }
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
      dateMode: 'range' as const,
      fromDate: '27/08/2026',
      toDate: '30/08/2026',
      timeMode: 'between' as const,
      startTime: '18:00',
      endTime: '21:00',
      recurrenceMode: 'days' as const,
      recurrenceDays: ['mon', 'wed'] as ('mon' | 'wed')[],
    }
    await expect(controller.create(input)).resolves.toBe(createdEntry)
    expect(availabilityService.create).toHaveBeenCalledWith(input, undefined)
  })

  it('forwards the studentId from the body when creating', async () => {
    const input = {
      dateMode: 'on' as const,
      onDate: '05/10/2026',
      timeMode: 'allDay' as const,
      recurrenceMode: 'everyday' as const,
    }
    await controller.create({ ...input, studentId: 'student-7' })
    expect(availabilityService.create).toHaveBeenCalledWith(input, 'student-7')
  })

  it('passes a studentId query through to findAll', async () => {
    await controller.findAll('student-9')
    expect(availabilityService.findAll).toHaveBeenCalledWith('student-9')
  })

  it('updates an availability entry via the service', async () => {
    const input = {
      dateMode: 'range' as const,
      fromDate: '27/08/2026',
      toDate: '30/08/2026',
      timeMode: 'between' as const,
      startTime: '09:00',
      endTime: '10:00',
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

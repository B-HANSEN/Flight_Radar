import { Test, TestingModule } from '@nestjs/testing'
import { AvailabilityController } from './availability.controller'
import { AvailabilityService } from './availability.service'
import { AvailabilityEntry } from './schemas/availability-entry.schema'

describe('AvailabilityController', () => {
  let controller: AvailabilityController
  const entries: AvailabilityEntry[] = [
    {
      dateLabel: 'From 27/08/2026 to 30/08/2026',
      timeLabel: 'Between 18:00 and 21:00',
      recurrence: 'Everyday',
      studentId: 'student-1',
    },
  ]
  const availabilityService = {
    findAll: jest.fn().mockResolvedValue(entries),
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
})

import { Test, TestingModule } from '@nestjs/testing'
import { ScheduleController } from './schedule.controller'
import { ScheduleService } from './schedule.service'
import { ScheduleBlock } from './schemas/schedule-block.schema'

describe('ScheduleController', () => {
  let controller: ScheduleController
  const blocks: ScheduleBlock[] = [
    {
      aircraftId: '64f0000000000000000000a1',
      period: 'day',
      label: 'Reserved 09:00–12:00',
      kind: 'reserved',
      start: 9,
      end: 12,
    },
  ]
  const busyAircraft = [
    {
      aircraftId: '64f0000000000000000000a1',
      kind: 'reserved',
      label: 'Reserved 09:00–12:00',
    },
  ]
  const scheduleService = {
    findAll: jest.fn().mockResolvedValue(blocks),
    findBusyAircraft: jest.fn().mockResolvedValue(busyAircraft),
  }

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ScheduleController],
      providers: [{ provide: ScheduleService, useValue: scheduleService }],
    }).compile()

    controller = app.get<ScheduleController>(ScheduleController)
  })

  it('returns the schedule blocks from the service', async () => {
    await expect(controller.findAll()).resolves.toBe(blocks)
    expect(scheduleService.findAll).toHaveBeenCalled()
  })

  it('returns busy aircraft for a date/time window from the service', async () => {
    await expect(
      controller.findAvailability('2026-08-24', '09:00', '11:00'),
    ).resolves.toBe(busyAircraft)
    expect(scheduleService.findBusyAircraft).toHaveBeenCalledWith(
      '2026-08-24',
      '09:00',
      '11:00',
    )
  })
})

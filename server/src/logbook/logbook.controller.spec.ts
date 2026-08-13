import { Test, TestingModule } from '@nestjs/testing'
import { LogbookController } from './logbook.controller'
import { LogbookService } from './logbook.service'
import { LogbookEntry } from './schemas/logbook-entry.schema'

describe('LogbookController', () => {
  let controller: LogbookController
  const entries: LogbookEntry[] = [
    {
      date: '19/07/2025',
      depPlace: 'LELL',
      depTime: '15:34',
      arrPlace: 'LELL',
      arrTime: '16:44',
      model: 'Cessna 152',
      reg: 'EC-ERV',
      se: '1:10',
      total: '1:10',
      pic: 'J. Whitfield',
      landingsDay: 3,
      remarks: 'Circuit and landing practice',
      studentId: 'student-1',
    },
  ]
  const logbookService = {
    findAll: jest.fn().mockResolvedValue(entries),
  }

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [LogbookController],
      providers: [{ provide: LogbookService, useValue: logbookService }],
    }).compile()

    controller = app.get<LogbookController>(LogbookController)
  })

  it('returns the logbook entries from the service', async () => {
    await expect(controller.findAll()).resolves.toBe(entries)
    expect(logbookService.findAll).toHaveBeenCalled()
  })
})

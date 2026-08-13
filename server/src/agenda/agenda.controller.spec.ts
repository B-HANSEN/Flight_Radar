import { Test, TestingModule } from '@nestjs/testing'
import { AgendaController } from './agenda.controller'
import { AgendaService } from './agenda.service'
import { CalendarEvent } from './schemas/calendar-event.schema'

describe('AgendaController', () => {
  let controller: AgendaController
  const events: CalendarEvent[] = [
    {
      type: 'unavailability',
      date: '2026-07-28',
      allDay: true,
      studentId: 'student-1',
    },
  ]
  const agendaService = { findAll: jest.fn().mockResolvedValue(events) }

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AgendaController],
      providers: [{ provide: AgendaService, useValue: agendaService }],
    }).compile()

    controller = app.get<AgendaController>(AgendaController)
  })

  it('returns the calendar events from the service', async () => {
    await expect(controller.findAll()).resolves.toBe(events)
    expect(agendaService.findAll).toHaveBeenCalled()
  })
})

import { Controller, Get, Query } from '@nestjs/common'
import { AgendaService } from './agenda.service'

@Controller('agenda')
export class AgendaController {
  constructor(private readonly agendaService: AgendaService) {}

  @Get()
  findAll(
    @Query('studentId') studentId?: string,
    @Query('instructorId') instructorId?: string,
  ) {
    return this.agendaService.findAll({ studentId, instructorId })
  }
}

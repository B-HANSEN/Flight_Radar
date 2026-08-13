import { Controller, Get } from '@nestjs/common'
import { LogbookService } from './logbook.service'

@Controller('logbook')
export class LogbookController {
  constructor(private readonly logbookService: LogbookService) {}

  @Get()
  findAll() {
    return this.logbookService.findAll()
  }
}

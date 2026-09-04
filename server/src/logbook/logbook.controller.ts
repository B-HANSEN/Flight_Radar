import { Controller, Get, Query } from '@nestjs/common'
import { LogbookService } from './logbook.service'

@Controller('logbook')
export class LogbookController {
  constructor(private readonly logbookService: LogbookService) {}

  // `studentId` scopes the list to one student's flights (the /me logbook
  // passes it so a persona only sees their own); omitted, it returns every
  // entry.
  @Get()
  findAll(@Query('studentId') studentId?: string) {
    return this.logbookService.findAll(studentId)
  }
}

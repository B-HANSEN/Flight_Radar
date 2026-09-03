import { Controller, Get, Query } from '@nestjs/common'
import { InstructorTimeOffService } from './instructor-time-off.service'

@Controller('instructor-time-off')
export class InstructorTimeOffController {
  constructor(
    private readonly instructorTimeOffService: InstructorTimeOffService,
  ) {}

  @Get()
  findAll(@Query('instructorId') instructorId?: string) {
    return this.instructorTimeOffService.findAll(instructorId)
  }
}

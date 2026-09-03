import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { InstructorTimeOffService } from './instructor-time-off.service'
import type { CreateInstructorTimeOffInput } from './instructor-time-off.service'

@Controller('instructor-time-off')
export class InstructorTimeOffController {
  constructor(
    private readonly instructorTimeOffService: InstructorTimeOffService,
  ) {}

  @Get()
  findAll(@Query('instructorId') instructorId?: string) {
    return this.instructorTimeOffService.findAll(instructorId)
  }

  @Post()
  create(@Body() body: CreateInstructorTimeOffInput) {
    return this.instructorTimeOffService.create(body)
  }

  @Patch(':id')
  setStatus(
    @Param('id') id: string,
    @Body() body: { status: 'approved' | 'denied' },
  ) {
    return this.instructorTimeOffService.setStatus(id, body.status)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.instructorTimeOffService.remove(id)
  }
}

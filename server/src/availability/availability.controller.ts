import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common'
import { AvailabilityService } from './availability.service'
import type {
  CreateAvailabilityEntryInput,
  UpdateAvailabilityEntryInput,
} from './availability.service'

// The client sends the current persona's student id alongside the entry
// fields; kept optional so the service falls back to the demo persona.
type CreateAvailabilityEntryBody = CreateAvailabilityEntryInput & {
  studentId?: string
}

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get()
  findAll(@Query('studentId') studentId?: string) {
    return this.availabilityService.findAll(studentId)
  }

  @Post()
  create(@Body() body: CreateAvailabilityEntryBody) {
    const { studentId, ...input } = body
    return this.availabilityService.create(input, studentId)
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: UpdateAvailabilityEntryInput) {
    return this.availabilityService.update(id, body)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.availabilityService.remove(id)
  }
}

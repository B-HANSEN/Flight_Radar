import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { AvailabilityService } from './availability.service'
import type {
  CreateAvailabilityEntryInput,
  UpdateAvailabilityEntryInput,
} from './availability.service'

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get()
  findAll() {
    return this.availabilityService.findAll()
  }

  @Post()
  create(@Body() body: CreateAvailabilityEntryInput) {
    return this.availabilityService.create(body)
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

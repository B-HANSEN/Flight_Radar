import { Controller, Get } from '@nestjs/common'
import { AvailabilityService } from './availability.service'

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get()
  findAll() {
    return this.availabilityService.findAll()
  }
}

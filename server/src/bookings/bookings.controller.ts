import { Controller, Get } from '@nestjs/common'
import { BookingsService } from './bookings.service'

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  findAll() {
    return this.bookingsService.findAll()
  }
}

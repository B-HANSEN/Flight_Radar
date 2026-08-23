import { Body, Controller, Get, Post } from '@nestjs/common'
import { BookingsService } from './bookings.service'
import type { CreateBookingInput } from './bookings.service'

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  findAll() {
    return this.bookingsService.findAll()
  }

  @Post()
  create(@Body() body: CreateBookingInput) {
    return this.bookingsService.create(body)
  }
}

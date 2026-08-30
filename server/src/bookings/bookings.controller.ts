import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { BookingsService } from './bookings.service'
import type { CreateBookingInput } from './bookings.service'

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // `studentId` / `instructorId` scope the list to one person's own
  // bookings — the homepage passes whichever matches the current persona so
  // a student sees only their upcoming lessons and an instructor only the
  // lessons assigned to them. Omitted, it returns every booking.
  @Get()
  findAll(
    @Query('studentId') studentId?: string,
    @Query('instructorId') instructorId?: string,
  ) {
    return this.bookingsService.findAll({ studentId, instructorId })
  }

  @Post()
  create(@Body() body: CreateBookingInput) {
    return this.bookingsService.create(body)
  }
}

import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { BookingsController } from './bookings.controller'
import { BookingsService } from './bookings.service'
import { Booking, BookingSchema } from './schemas/booking.schema'
import { Student, StudentSchema } from '../students/schemas/student.schema'
import { Aircraft, AircraftSchema } from '../aircraft/schemas/aircraft.schema'
import {
  Instructor,
  InstructorSchema,
} from '../instructors/schemas/instructor.schema'
import {
  CalendarEvent,
  CalendarEventSchema,
} from '../agenda/schemas/calendar-event.schema'
import {
  AvailabilityEntry,
  AvailabilityEntrySchema,
} from '../availability/schemas/availability-entry.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: Student.name, schema: StudentSchema },
      { name: Aircraft.name, schema: AircraftSchema },
      { name: Instructor.name, schema: InstructorSchema },
      { name: CalendarEvent.name, schema: CalendarEventSchema },
      { name: AvailabilityEntry.name, schema: AvailabilityEntrySchema },
    ]),
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}

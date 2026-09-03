import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AgendaController } from './agenda.controller'
import { AgendaService } from './agenda.service'
import {
  AvailabilityEntry,
  AvailabilityEntrySchema,
} from '../availability/schemas/availability-entry.schema'
import { Booking, BookingSchema } from '../bookings/schemas/booking.schema'
import {
  Instructor,
  InstructorSchema,
} from '../instructors/schemas/instructor.schema'
import {
  InstructorTimeOff,
  InstructorTimeOffSchema,
} from '../instructor-time-off/schemas/instructor-time-off.schema'
import { Student, StudentSchema } from '../students/schemas/student.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AvailabilityEntry.name, schema: AvailabilityEntrySchema },
      { name: Booking.name, schema: BookingSchema },
      { name: Instructor.name, schema: InstructorSchema },
      { name: InstructorTimeOff.name, schema: InstructorTimeOffSchema },
      { name: Student.name, schema: StudentSchema },
    ]),
  ],
  controllers: [AgendaController],
  providers: [AgendaService],
})
export class AgendaModule {}

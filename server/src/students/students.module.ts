import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { StudentsController } from './students.controller'
import { StudentsService } from './students.service'
import { Student, StudentSchema } from './schemas/student.schema'
import {
  AvailabilityEntry,
  AvailabilityEntrySchema,
} from '../availability/schemas/availability-entry.schema'
import {
  CalendarEvent,
  CalendarEventSchema,
} from '../agenda/schemas/calendar-event.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Student.name, schema: StudentSchema },
      { name: AvailabilityEntry.name, schema: AvailabilityEntrySchema },
      { name: CalendarEvent.name, schema: CalendarEventSchema },
    ]),
  ],
  controllers: [StudentsController],
  providers: [StudentsService],
})
export class StudentsModule {}

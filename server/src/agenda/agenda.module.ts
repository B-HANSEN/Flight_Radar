import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AgendaController } from './agenda.controller'
import { AgendaService } from './agenda.service'
import {
  CalendarEvent,
  CalendarEventSchema,
} from './schemas/calendar-event.schema'
import {
  AvailabilityEntry,
  AvailabilityEntrySchema,
} from '../availability/schemas/availability-entry.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CalendarEvent.name, schema: CalendarEventSchema },
      { name: AvailabilityEntry.name, schema: AvailabilityEntrySchema },
    ]),
  ],
  controllers: [AgendaController],
  providers: [AgendaService],
})
export class AgendaModule {}

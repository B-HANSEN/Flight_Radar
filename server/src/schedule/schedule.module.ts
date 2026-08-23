import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ScheduleController } from './schedule.controller'
import { ScheduleService } from './schedule.service'
import {
  ScheduleBlock,
  ScheduleBlockSchema,
} from './schemas/schedule-block.schema'
import { Booking, BookingSchema } from '../bookings/schemas/booking.schema'
import { Aircraft, AircraftSchema } from '../aircraft/schemas/aircraft.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ScheduleBlock.name, schema: ScheduleBlockSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: Aircraft.name, schema: AircraftSchema },
    ]),
  ],
  controllers: [ScheduleController],
  providers: [ScheduleService],
})
export class ScheduleModule {}

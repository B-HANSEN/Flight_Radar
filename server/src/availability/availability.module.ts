import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AvailabilityController } from './availability.controller'
import { AvailabilityService } from './availability.service'
import {
  AvailabilityEntry,
  AvailabilityEntrySchema,
} from './schemas/availability-entry.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AvailabilityEntry.name, schema: AvailabilityEntrySchema },
    ]),
  ],
  controllers: [AvailabilityController],
  providers: [AvailabilityService],
})
export class AvailabilityModule {}

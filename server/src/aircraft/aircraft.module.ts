import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AircraftController } from './aircraft.controller'
import { AircraftService } from './aircraft.service'
import { Aircraft, AircraftSchema } from './schemas/aircraft.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Aircraft.name, schema: AircraftSchema },
    ]),
  ],
  controllers: [AircraftController],
  providers: [AircraftService],
})
export class AircraftModule {}

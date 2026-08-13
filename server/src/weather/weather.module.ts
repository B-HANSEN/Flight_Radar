import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { WeatherController } from './weather.controller'
import { WeatherService } from './weather.service'
import {
  WeatherReport,
  WeatherReportSchema,
} from './schemas/weather-report.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WeatherReport.name, schema: WeatherReportSchema },
    ]),
  ],
  controllers: [WeatherController],
  providers: [WeatherService],
})
export class WeatherModule {}

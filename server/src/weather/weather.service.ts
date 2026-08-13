import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import {
  WeatherReport,
  WeatherReportDocument,
} from './schemas/weather-report.schema'

@Injectable()
export class WeatherService {
  constructor(
    @InjectModel(WeatherReport.name)
    private readonly weatherReportModel: Model<WeatherReportDocument>,
  ) {}

  findAll() {
    return this.weatherReportModel.find().exec()
  }
}

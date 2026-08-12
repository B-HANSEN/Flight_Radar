import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Aircraft, AircraftDocument } from './schemas/aircraft.schema'

@Injectable()
export class AircraftService {
  constructor(
    @InjectModel(Aircraft.name)
    private readonly aircraftModel: Model<AircraftDocument>,
  ) {}

  findAll() {
    return this.aircraftModel.find().exec()
  }
}

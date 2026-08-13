import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import {
  AvailabilityEntry,
  AvailabilityEntryDocument,
} from './schemas/availability-entry.schema'

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectModel(AvailabilityEntry.name)
    private readonly availabilityEntryModel: Model<AvailabilityEntryDocument>,
  ) {}

  findAll() {
    return this.availabilityEntryModel.find().exec()
  }
}

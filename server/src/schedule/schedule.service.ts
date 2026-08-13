import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import {
  ScheduleBlock,
  ScheduleBlockDocument,
} from './schemas/schedule-block.schema'

@Injectable()
export class ScheduleService {
  constructor(
    @InjectModel(ScheduleBlock.name)
    private readonly scheduleBlockModel: Model<ScheduleBlockDocument>,
  ) {}

  findAll() {
    return this.scheduleBlockModel.find().exec()
  }
}

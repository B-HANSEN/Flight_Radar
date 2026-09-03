import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import {
  InstructorTimeOff,
  InstructorTimeOffDocument,
} from './schemas/instructor-time-off.schema'

@Injectable()
export class InstructorTimeOffService {
  constructor(
    @InjectModel(InstructorTimeOff.name)
    private readonly instructorTimeOffModel: Model<InstructorTimeOffDocument>,
  ) {}

  findAll(instructorId?: string) {
    return this.instructorTimeOffModel
      .find(instructorId ? { instructorId } : {})
      .exec()
  }
}

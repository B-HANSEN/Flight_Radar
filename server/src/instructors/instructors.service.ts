import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Instructor, InstructorDocument } from './schemas/instructor.schema'

@Injectable()
export class InstructorsService {
  constructor(
    @InjectModel(Instructor.name)
    private readonly instructorModel: Model<InstructorDocument>,
  ) {}

  findAll() {
    return this.instructorModel.find().exec()
  }
}

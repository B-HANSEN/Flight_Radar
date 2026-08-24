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
    // Sort by insertion order (seed.ts seeds James Whitfield before Kate
    // Ashford) so the RoleSwitcher dropdown lists him first, deterministically
    // — MongoDB doesn't guarantee natural order for an unsorted find().
    return this.instructorModel.find().sort({ _id: 1 }).exec()
  }
}

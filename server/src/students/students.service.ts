import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Student, StudentDocument } from './schemas/student.schema'

@Injectable()
export class StudentsService {
  constructor(
    @InjectModel(Student.name)
    private readonly studentModel: Model<StudentDocument>,
  ) {}

  findAll() {
    return this.studentModel.find().exec()
  }
}

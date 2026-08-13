import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import {
  CourseProgress,
  CourseProgressDocument,
} from './schemas/course-progress.schema'

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(CourseProgress.name)
    private readonly courseProgressModel: Model<CourseProgressDocument>,
  ) {}

  findOne() {
    return this.courseProgressModel.findOne().exec()
  }
}

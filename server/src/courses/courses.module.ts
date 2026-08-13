import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { CoursesController } from './courses.controller'
import { CoursesService } from './courses.service'
import {
  CourseProgress,
  CourseProgressSchema,
} from './schemas/course-progress.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CourseProgress.name, schema: CourseProgressSchema },
    ]),
  ],
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule {}

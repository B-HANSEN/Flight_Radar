import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { InstructorTimeOffController } from './instructor-time-off.controller'
import { InstructorTimeOffService } from './instructor-time-off.service'
import {
  InstructorTimeOff,
  InstructorTimeOffSchema,
} from './schemas/instructor-time-off.schema'
import {
  Instructor,
  InstructorSchema,
} from '../instructors/schemas/instructor.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InstructorTimeOff.name, schema: InstructorTimeOffSchema },
      { name: Instructor.name, schema: InstructorSchema },
    ]),
  ],
  controllers: [InstructorTimeOffController],
  providers: [InstructorTimeOffService],
})
export class InstructorTimeOffModule {}

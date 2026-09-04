import { Controller, Get, Query } from '@nestjs/common'
import { CoursesService } from './courses.service'

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  // `studentId` scopes the progress to one student (the /me courses page
  // passes it); omitted, it returns the first record.
  @Get()
  findOne(@Query('studentId') studentId?: string) {
    return this.coursesService.findOne(studentId)
  }
}

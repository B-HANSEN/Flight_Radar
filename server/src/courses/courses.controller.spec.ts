import { Test, TestingModule } from '@nestjs/testing'
import { CoursesController } from './courses.controller'
import { CoursesService } from './courses.service'
import { CourseProgress } from './schemas/course-progress.schema'

describe('CoursesController', () => {
  let controller: CoursesController
  const progress: CourseProgress = {
    overallActualHours: '26:02',
    overallTargetHours: '45:00',
    overallPct: 58,
    vfrTotalHours: '26:02',
    ifrTotalHours: '0:00',
    mccTotalHours: '0:00',
    groups: [],
    phases: [],
    studentId: 'student-1',
  }
  const coursesService = { findOne: jest.fn().mockResolvedValue(progress) }

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CoursesController],
      providers: [{ provide: CoursesService, useValue: coursesService }],
    }).compile()

    controller = app.get<CoursesController>(CoursesController)
  })

  it('returns the course progress from the service', async () => {
    await expect(controller.findOne()).resolves.toBe(progress)
    expect(coursesService.findOne).toHaveBeenCalled()
  })

  it('forwards the studentId query to the service', async () => {
    await controller.findOne('student-1')
    expect(coursesService.findOne).toHaveBeenCalledWith('student-1')
  })
})

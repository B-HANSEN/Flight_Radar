import { Test, TestingModule } from '@nestjs/testing'
import { InstructorTimeOffController } from './instructor-time-off.controller'
import { InstructorTimeOffService } from './instructor-time-off.service'
import { InstructorTimeOff } from './schemas/instructor-time-off.schema'

describe('InstructorTimeOffController', () => {
  let controller: InstructorTimeOffController
  const items: InstructorTimeOff[] = [
    { instructorId: 'instructor-1', date: '2026-09-07' },
  ]
  const instructorTimeOffService = {
    findAll: jest.fn().mockResolvedValue(items),
  }

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [InstructorTimeOffController],
      providers: [
        {
          provide: InstructorTimeOffService,
          useValue: instructorTimeOffService,
        },
      ],
    }).compile()

    controller = app.get<InstructorTimeOffController>(
      InstructorTimeOffController,
    )
  })

  it('returns the instructor time off from the service', async () => {
    await expect(controller.findAll('instructor-1')).resolves.toBe(items)
    expect(instructorTimeOffService.findAll).toHaveBeenCalledWith(
      'instructor-1',
    )
  })
})

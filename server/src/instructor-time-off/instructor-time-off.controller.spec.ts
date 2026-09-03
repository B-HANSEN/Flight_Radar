import { Test, TestingModule } from '@nestjs/testing'
import { InstructorTimeOffController } from './instructor-time-off.controller'
import { InstructorTimeOffService } from './instructor-time-off.service'
import { InstructorTimeOff } from './schemas/instructor-time-off.schema'

describe('InstructorTimeOffController', () => {
  let controller: InstructorTimeOffController
  const items: InstructorTimeOff[] = [
    {
      instructorId: 'instructor-1',
      date: '2026-09-07',
      type: 'regular',
      status: 'approved',
    },
  ]
  const instructorTimeOffService = {
    findAll: jest.fn().mockResolvedValue(items),
    create: jest.fn().mockResolvedValue(items[0]),
    setStatus: jest.fn().mockResolvedValue(items[0]),
    remove: jest.fn().mockResolvedValue(items[0]),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
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

  it('delegates a create to the service', async () => {
    const body = {
      instructorId: 'instructor-1',
      date: '2026-10-05',
      type: 'personal' as const,
      reason: 'Family trip',
    }
    await controller.create(body)
    expect(instructorTimeOffService.create).toHaveBeenCalledWith(body)
  })

  it('delegates a status change to the service', async () => {
    await controller.setStatus('entry-1', { status: 'approved' })
    expect(instructorTimeOffService.setStatus).toHaveBeenCalledWith(
      'entry-1',
      'approved',
    )
  })

  it('delegates a delete to the service', async () => {
    await controller.remove('entry-1')
    expect(instructorTimeOffService.remove).toHaveBeenCalledWith('entry-1')
  })
})

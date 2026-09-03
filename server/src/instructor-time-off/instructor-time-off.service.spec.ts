import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { getModelToken } from '@nestjs/mongoose'
import { InstructorTimeOffService } from './instructor-time-off.service'
import { InstructorTimeOff } from './schemas/instructor-time-off.schema'
import { Instructor } from '../instructors/schemas/instructor.schema'

describe('InstructorTimeOffService', () => {
  let service: InstructorTimeOffService

  const instructorTimeOffModel = {
    find: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  }
  const instructorModel = { findById: jest.fn() }

  function mockInstructor(value: unknown) {
    instructorModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(value),
    })
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    instructorTimeOffModel.create.mockImplementation((doc) =>
      Promise.resolve(doc),
    )
    mockInstructor({
      _id: 'instructor-1',
      name: 'Kate Ashford',
      isChief: false,
    })

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        InstructorTimeOffService,
        {
          provide: getModelToken(InstructorTimeOff.name),
          useValue: instructorTimeOffModel,
        },
        {
          provide: getModelToken(Instructor.name),
          useValue: instructorModel,
        },
      ],
    }).compile()

    service = app.get<InstructorTimeOffService>(InstructorTimeOffService)
  })

  it('grants a regular day off immediately without touching the instructor', async () => {
    const created = await service.create({
      instructorId: 'instructor-1',
      date: '2026-10-05',
      type: 'regular',
    })

    expect(created).toMatchObject({ status: 'approved', type: 'regular' })
    expect(instructorModel.findById).not.toHaveBeenCalled()
  })

  it('leaves personal leave pending when a non-chief instructor requests it', async () => {
    const created = await service.create({
      instructorId: 'instructor-1',
      date: '2026-10-05',
      type: 'personal',
      reason: 'Family trip',
    })

    expect(created).toMatchObject({ status: 'pending', reason: 'Family trip' })
  })

  it('auto-approves personal leave the Chief Flight Instructor requests', async () => {
    mockInstructor({
      _id: 'instructor-2',
      name: 'James Whitfield',
      isChief: true,
    })

    const created = await service.create({
      instructorId: 'instructor-2',
      date: '2026-10-05',
      type: 'personal',
    })

    expect(created).toMatchObject({ status: 'approved' })
  })

  it('throws when approving an entry that does not exist', async () => {
    instructorTimeOffModel.findByIdAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    })

    await expect(service.setStatus('missing', 'approved')).rejects.toThrow(
      NotFoundException,
    )
  })

  it('throws when removing an entry that does not exist', async () => {
    instructorTimeOffModel.findByIdAndDelete.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    })

    await expect(service.remove('missing')).rejects.toThrow(NotFoundException)
  })

  it('filters the list by instructor and to the current + next month', async () => {
    instructorTimeOffModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue([]),
    })

    await service.findAll('instructor-1')

    const now = new Date()
    const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
    const untilDate = new Date(now.getFullYear(), now.getMonth() + 2, 1)
    const until = `${untilDate.getFullYear()}-${String(untilDate.getMonth() + 1).padStart(2, '0')}-01`

    expect(instructorTimeOffModel.find).toHaveBeenCalledWith({
      instructorId: 'instructor-1',
      date: { $gte: from, $lt: until },
    })
  })

  it('still applies the month window when no instructor id is given', async () => {
    instructorTimeOffModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue([]),
    })

    await service.findAll()

    const call = instructorTimeOffModel.find.mock.calls[0][0]
    expect(call).not.toHaveProperty('instructorId')
    expect(call.date).toEqual({
      $gte: expect.stringMatching(/^\d{4}-\d{2}-01$/),
      $lt: expect.stringMatching(/^\d{4}-\d{2}-01$/),
    })
  })
})

import { Test, TestingModule } from '@nestjs/testing'
import { StudentsController } from './students.controller'
import { StudentsService } from './students.service'
import { Student } from './schemas/student.schema'

describe('StudentsController', () => {
  let controller: StudentsController
  const students: Student[] = [
    {
      name: 'Alex Moreau',
      initials: 'AM',
      color: '#0ea5e9',
      track: 'PPL',
      course: 'CPL Flight Phase',
      email: 'alex.moreau@example.com',
      phone: '+34 600 234 567',
      birthday: '22 June 1998',
      info: 'CPL online · Q3 2025',
    },
  ]
  const schedule = [
    {
      id: 'student-1',
      name: 'Alex Moreau',
      course: 'CPL Flight Phase',
      slots: [],
    },
  ]
  const studentsService = {
    findAll: jest.fn().mockResolvedValue(students),
    findSchedule: jest.fn().mockResolvedValue(schedule),
  }

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [StudentsController],
      providers: [{ provide: StudentsService, useValue: studentsService }],
    }).compile()

    controller = app.get<StudentsController>(StudentsController)
  })

  it('returns the students from the service', async () => {
    await expect(controller.findAll()).resolves.toBe(students)
    expect(studentsService.findAll).toHaveBeenCalled()
  })

  it('returns the per-student schedule from the service', async () => {
    await expect(controller.findSchedule()).resolves.toBe(schedule)
    expect(studentsService.findSchedule).toHaveBeenCalled()
  })
})

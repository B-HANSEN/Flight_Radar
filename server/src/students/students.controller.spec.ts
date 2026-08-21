import { Test, TestingModule } from '@nestjs/testing'
import { StudentsController } from './students.controller'
import { StudentsService } from './students.service'
import { Student } from './schemas/student.schema'

describe('StudentsController', () => {
  let controller: StudentsController
  const students: Student[] = [
    { name: 'Alex Moreau', initials: 'AM', color: '#0ea5e9' },
  ]
  const studentsService = { findAll: jest.fn().mockResolvedValue(students) }

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
})

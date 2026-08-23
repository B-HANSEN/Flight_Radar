import { Test, TestingModule } from '@nestjs/testing'
import { InstructorsController } from './instructors.controller'
import { InstructorsService } from './instructors.service'
import { Instructor } from './schemas/instructor.schema'

describe('InstructorsController', () => {
  let controller: InstructorsController
  const instructors: Instructor[] = [
    {
      name: 'James Whitfield',
      initials: 'JW',
      color: '#0ea5e9',
      photoSrc: '/instructors/james-whitfield.webp',
      email: 'james.whitfield@example.com',
      phone: '+34 600 111 222',
      birthday: '8 September 1985',
      info: 'CFI · Since 2015',
    },
  ]
  const instructorsService = {
    findAll: jest.fn().mockResolvedValue(instructors),
  }

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [InstructorsController],
      providers: [
        { provide: InstructorsService, useValue: instructorsService },
      ],
    }).compile()

    controller = app.get<InstructorsController>(InstructorsController)
  })

  it('returns the instructors from the service', async () => {
    await expect(controller.findAll()).resolves.toBe(instructors)
    expect(instructorsService.findAll).toHaveBeenCalled()
  })
})

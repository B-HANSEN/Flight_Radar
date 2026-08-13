import { Test, TestingModule } from '@nestjs/testing'
import { MissingSignaturesController } from './missing-signatures.controller'
import { MissingSignaturesService } from './missing-signatures.service'
import { MissingSignature } from './schemas/missing-signature.schema'

describe('MissingSignaturesController', () => {
  let controller: MissingSignaturesController
  const signatures: MissingSignature[] = [
    {
      date: '07/08/2026',
      label: 'Instruction #4041369',
      studentId: 'student-1',
    },
  ]
  const missingSignaturesService = {
    findAll: jest.fn().mockResolvedValue(signatures),
  }

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MissingSignaturesController],
      providers: [
        {
          provide: MissingSignaturesService,
          useValue: missingSignaturesService,
        },
      ],
    }).compile()

    controller = app.get<MissingSignaturesController>(
      MissingSignaturesController,
    )
  })

  it('returns the missing signatures from the service', async () => {
    await expect(controller.findAll()).resolves.toBe(signatures)
    expect(missingSignaturesService.findAll).toHaveBeenCalled()
  })
})

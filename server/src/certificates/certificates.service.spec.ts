import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { getModelToken } from '@nestjs/mongoose'
import { CertificatesService } from './certificates.service'
import { Certificate } from './schemas/certificate.schema'

const VALID_ID = '6a99a0b134b696ee6a36698f'

describe('CertificatesService', () => {
  let service: CertificatesService

  const certificateModel = { find: jest.fn(), findById: jest.fn() }

  beforeEach(async () => {
    jest.clearAllMocks()

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        CertificatesService,
        {
          provide: getModelToken(Certificate.name),
          useValue: certificateModel,
        },
      ],
    }).compile()

    service = app.get<CertificatesService>(CertificatesService)
  })

  describe('findByPerson', () => {
    it('returns the person’s certificates newest-issued first', async () => {
      certificateModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([
          { name: 'Old', issued: '01/02/2023' },
          { name: 'New', issued: '15/06/2025' },
          { name: 'Mid', issued: '10/09/2024' },
        ]),
      })

      const result = await service.findByPerson('student-1')

      expect(certificateModel.find).toHaveBeenCalledWith({
        personId: 'student-1',
      })
      expect(result.map((c) => c.name)).toEqual(['New', 'Mid', 'Old'])
    })
  })

  describe('findById', () => {
    it('returns the certificate for a valid id', async () => {
      const certificate = { name: 'Medical certificate class 1' }
      certificateModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(certificate),
      })

      await expect(service.findById(VALID_ID)).resolves.toBe(certificate)
      expect(certificateModel.findById).toHaveBeenCalledWith(VALID_ID)
    })

    it('throws NotFoundException when the id is well-formed but unknown', async () => {
      certificateModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      })

      await expect(service.findById(VALID_ID)).rejects.toBeInstanceOf(
        NotFoundException,
      )
    })

    it('throws NotFoundException (not a CastError) for a malformed id', async () => {
      await expect(service.findById('not-an-object-id')).rejects.toBeInstanceOf(
        NotFoundException,
      )
      expect(certificateModel.findById).not.toHaveBeenCalled()
    })
  })
})

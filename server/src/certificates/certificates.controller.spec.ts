import { Test, TestingModule } from '@nestjs/testing'
import { CertificatesController } from './certificates.controller'
import { CertificatesService } from './certificates.service'
import { Certificate } from './schemas/certificate.schema'

describe('CertificatesController', () => {
  let controller: CertificatesController
  const certificates: Certificate[] = [
    {
      name: 'Medical certificate class 2',
      category: 'Certificates',
      status: 'current',
      issued: '12/03/2025',
      expiration: '06/03/2027',
      studentId: 'student-1',
    },
  ]
  const certificatesService = {
    findAll: jest.fn().mockResolvedValue(certificates),
  }

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CertificatesController],
      providers: [
        { provide: CertificatesService, useValue: certificatesService },
      ],
    }).compile()

    controller = app.get<CertificatesController>(CertificatesController)
  })

  it('returns the certificates from the service', async () => {
    await expect(controller.findAll()).resolves.toBe(certificates)
    expect(certificatesService.findAll).toHaveBeenCalled()
  })
})

import { Test, TestingModule } from '@nestjs/testing'
import type { Response } from 'express'
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
      personId: 'student-1',
    },
  ]
  const certificatesService = {
    findByPerson: jest.fn().mockResolvedValue(certificates),
    findById: jest.fn().mockResolvedValue(certificates[0]),
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
    await expect(controller.findByPerson('student-1')).resolves.toBe(
      certificates,
    )
    expect(certificatesService.findByPerson).toHaveBeenCalledWith('student-1')
  })

  it('streams a generated PDF for the certificate document', async () => {
    const set = jest.fn().mockReturnThis()
    const send = jest.fn().mockReturnThis()
    const res = { set, send } as unknown as Response

    await controller.document('cert-1', res)

    expect(certificatesService.findById).toHaveBeenCalledWith('cert-1')
    expect(set).toHaveBeenCalledWith(
      expect.objectContaining({
        'Content-Type': 'application/pdf',
        'Content-Disposition':
          'attachment; filename="Medical certificate class 2.pdf"',
      }),
    )
    const [pdf] = send.mock.calls[0] as [Buffer]
    expect(pdf.subarray(0, 4).toString()).toBe('%PDF')
  })
})

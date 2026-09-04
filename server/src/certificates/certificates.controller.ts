import { Controller, Get, Param, Query, Res } from '@nestjs/common'
import type { Response } from 'express'
import { CertificatesService } from './certificates.service'
import { generateCertificatePdf } from './certificate-document'

@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Get()
  findByPerson(@Query('personId') personId: string) {
    return this.certificatesService.findByPerson(personId)
  }

  // A generated PDF stand-in for the certificate document, downloaded from
  // the certificate list — there is no real scanned document behind the
  // seed data yet (see certificate-document.ts). Mirrors the documents
  // module's download endpoint.
  @Get(':id/document')
  async document(@Param('id') id: string, @Res() res: Response) {
    const certificate = await this.certificatesService.findById(id)
    const pdf = await generateCertificatePdf(certificate)
    // Keep the human-readable name (matching the frontend's `download`
    // attribute); only strip characters that would break the quoted
    // header value or allow header injection.
    const fileName = `${certificate.name.replace(/["\\\r\n]+/g, '')}.pdf`

    res
      .set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      })
      .send(pdf)
  }
}

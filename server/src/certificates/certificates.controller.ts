import { Controller, Get, Query } from '@nestjs/common'
import { CertificatesService } from './certificates.service'

@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Get()
  findByPerson(@Query('personId') personId: string) {
    return this.certificatesService.findByPerson(personId)
  }
}

import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Certificate, CertificateDocument } from './schemas/certificate.schema'

// issued is a display string in DD/MM/YYYY (see seed.ts), not sortable as
// plain text — parse it to a comparable timestamp.
function parseIssuedDate(issued: string): number {
  const [day, month, year] = issued.split('/').map(Number)
  return new Date(year, month - 1, day).getTime()
}

@Injectable()
export class CertificatesService {
  constructor(
    @InjectModel(Certificate.name)
    private readonly certificateModel: Model<CertificateDocument>,
  ) {}

  async findByPerson(personId: string) {
    const certificates = await this.certificateModel.find({ personId }).exec()
    return certificates.sort(
      (a, b) => parseIssuedDate(b.issued) - parseIssuedDate(a.issued),
    )
  }
}

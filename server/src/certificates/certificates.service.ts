import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, isValidObjectId } from 'mongoose'
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

  async findById(id: string): Promise<CertificateDocument> {
    // A malformed id would make findById throw a CastError (→ 500); treat
    // anything that isn't a valid ObjectId as simply not found.
    const certificate = isValidObjectId(id)
      ? await this.certificateModel.findById(id).exec()
      : null

    if (!certificate) {
      throw new NotFoundException(`Certificate ${id} not found`)
    }

    return certificate
  }
}

import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import {
  MissingSignature,
  MissingSignatureDocument,
} from './schemas/missing-signature.schema'

@Injectable()
export class MissingSignaturesService {
  constructor(
    @InjectModel(MissingSignature.name)
    private readonly missingSignatureModel: Model<MissingSignatureDocument>,
  ) {}

  findAll() {
    return this.missingSignatureModel.find().exec()
  }
}

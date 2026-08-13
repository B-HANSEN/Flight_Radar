import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { MissingSignaturesController } from './missing-signatures.controller'
import { MissingSignaturesService } from './missing-signatures.service'
import {
  MissingSignature,
  MissingSignatureSchema,
} from './schemas/missing-signature.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MissingSignature.name, schema: MissingSignatureSchema },
    ]),
  ],
  controllers: [MissingSignaturesController],
  providers: [MissingSignaturesService],
})
export class MissingSignaturesModule {}

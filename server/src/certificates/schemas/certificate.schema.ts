import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type CertificateStatus = 'current' | 'archived'

export type CertificateDocument = HydratedDocument<Certificate>

@Schema({
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret: Record<string, unknown>) => {
      ret.id = (ret._id as { toString(): string }).toString()
      delete ret._id
    },
  },
})
export class Certificate {
  @Prop({ required: true })
  name!: string

  @Prop({ required: true })
  category!: string

  @Prop({ required: true, enum: ['current', 'archived'] })
  status!: CertificateStatus

  @Prop({ required: true })
  issued!: string

  @Prop()
  renewed?: string

  @Prop({ required: true })
  expiration!: string

  @Prop()
  comment?: string

  @Prop()
  documentNumber?: string

  @Prop()
  issuingAuthority?: string

  @Prop()
  holderName?: string

  // No Users module yet (no auth) — plain id for now, becomes a real
  // ObjectId ref once the Users module exists.
  @Prop({ required: true })
  studentId!: string
}

export const CertificateSchema = SchemaFactory.createForClass(Certificate)

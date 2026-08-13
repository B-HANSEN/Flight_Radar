import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type MissingSignatureDocument = HydratedDocument<MissingSignature>

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
export class MissingSignature {
  @Prop({ required: true })
  date!: string

  @Prop({ required: true })
  label!: string

  // No Users module yet (no auth) — plain id for now, becomes a real
  // ObjectId ref once the Users module exists.
  @Prop({ required: true })
  studentId!: string
}

export const MissingSignatureSchema =
  SchemaFactory.createForClass(MissingSignature)

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type EmergencyContactDocument = HydratedDocument<EmergencyContact>

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
export class EmergencyContact {
  @Prop({ required: true })
  name!: string

  @Prop({ required: true })
  relation!: string

  @Prop({ required: true })
  phone!: string

  // A student or an instructor (previewing their own profile) — no Users
  // module yet (no auth), so this is a plain id for now, becomes a real
  // ObjectId ref once the Users module exists.
  @Prop({ required: true })
  personId!: string
}

export const EmergencyContactSchema =
  SchemaFactory.createForClass(EmergencyContact)

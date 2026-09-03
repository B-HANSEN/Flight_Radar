import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type InstructorTimeOffDocument = HydratedDocument<InstructorTimeOff>

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
export class InstructorTimeOff {
  // No Users module yet (no auth) — plain id for now, becomes a real
  // ObjectId ref once the Users module exists.
  @Prop({ required: true })
  instructorId!: string

  @Prop({ required: true })
  date!: string
}

export const InstructorTimeOffSchema =
  SchemaFactory.createForClass(InstructorTimeOff)

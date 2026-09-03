import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type InstructorTimeOffDocument = HydratedDocument<InstructorTimeOff>

// A 'regular' day off is the standing weekly entitlement and needs no
// approval; 'personal' leave beyond that must be approved by the Chief
// Flight Instructor (auto-approved when the CFI requests it themselves).
export type InstructorTimeOffType = 'regular' | 'personal'
export type InstructorTimeOffStatus = 'approved' | 'pending' | 'denied'

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

  @Prop({ required: true, enum: ['regular', 'personal'] })
  type!: InstructorTimeOffType

  @Prop({ required: true, enum: ['approved', 'pending', 'denied'] })
  status!: InstructorTimeOffStatus

  @Prop()
  reason?: string
}

export const InstructorTimeOffSchema =
  SchemaFactory.createForClass(InstructorTimeOff)

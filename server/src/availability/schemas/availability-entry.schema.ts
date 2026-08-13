import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type AvailabilityEntryDocument = HydratedDocument<AvailabilityEntry>

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
export class AvailabilityEntry {
  @Prop({ required: true })
  dateLabel!: string

  @Prop({ required: true })
  timeLabel!: string

  @Prop({ required: true })
  recurrence!: string

  // No Users module yet (no auth) — plain id for now, becomes a real
  // ObjectId ref once the Users module exists.
  @Prop({ required: true })
  studentId!: string
}

export const AvailabilityEntrySchema =
  SchemaFactory.createForClass(AvailabilityEntry)

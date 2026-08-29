import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type BookingDocument = HydratedDocument<Booking>

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
export class Booking {
  @Prop({ required: true })
  type!: string

  @Prop({ required: true })
  date!: string

  // Absent for a Theory (ground-school) lesson, which uses no aircraft.
  @Prop()
  tail?: string

  @Prop({ required: true })
  person!: string

  @Prop({ required: true })
  time!: string

  // No Users module yet (no auth) — plain id for now, becomes a real
  // ObjectId ref once the Users module exists.
  @Prop({ required: true })
  studentId!: string

  // Same plain-id convention as studentId — which instructor is assigned
  // to teach this lesson (see ScheduleFlightModal's instructor picker).
  @Prop({ required: true })
  instructorId!: string

  // Free-text note from the instructor. For a Theory lesson this is where
  // the topic lives (e.g. "navigation", "radio procedures").
  @Prop()
  comments?: string
}

export const BookingSchema = SchemaFactory.createForClass(Booking)

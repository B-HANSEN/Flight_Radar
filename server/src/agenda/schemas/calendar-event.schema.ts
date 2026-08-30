import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type CalendarEventType = 'unavailability' | 'booking'

export type CalendarEventDocument = HydratedDocument<CalendarEvent>

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
export class CalendarEvent {
  @Prop({ required: true, enum: ['unavailability', 'booking'] })
  type!: CalendarEventType

  @Prop({ required: true })
  date!: string

  // unavailability fields
  @Prop()
  allDay?: boolean

  @Prop()
  timeRange?: string

  // booking fields
  @Prop()
  time?: string

  @Prop()
  tailNumber?: string

  @Prop()
  pilotInCommand?: string

  @Prop({ type: [String] })
  flightLines?: string[]

  // Hardcoded syllabus code (e.g. VBD15) — mirrors Booking.trainingCode so a
  // booking created at runtime can carry it through to the agenda later.
  @Prop()
  trainingCode?: string

  @Prop()
  cancelled?: boolean

  // No Users module yet (no auth) — plain id for now, becomes a real
  // ObjectId ref once the Users module exists.
  @Prop({ required: true })
  studentId!: string
}

export const CalendarEventSchema = SchemaFactory.createForClass(CalendarEvent)

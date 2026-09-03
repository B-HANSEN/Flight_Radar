import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'
import { Aircraft } from '../../aircraft/schemas/aircraft.schema'

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

  // Real relational link to the aircraft, used to join against
  // schedule/conflict data. Absent for a Theory (ground-school) lesson,
  // which uses no aircraft.
  @Prop({ type: Types.ObjectId, ref: Aircraft.name })
  aircraftId?: Types.ObjectId

  // Denormalized copy of the aircraft's tail number for display (agenda,
  // homepage) without a populate() round trip. Not used for joins — see
  // aircraftId above.
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

  // Hardcoded syllabus code for a flight lesson (e.g. VBD15, NAV06, SOLO01),
  // resolved to a title + briefing checklist by lib/trainingContent.ts on the
  // agenda. Absent for Theory lessons (their topic comes from `comments`).
  @Prop()
  trainingCode?: string

  // A booking the student/instructor later cancelled — shown struck-through
  // on the agenda by default, hidden by the "Hide cancelations" toggle.
  @Prop()
  cancelled?: boolean
}

export const BookingSchema = SchemaFactory.createForClass(Booking)

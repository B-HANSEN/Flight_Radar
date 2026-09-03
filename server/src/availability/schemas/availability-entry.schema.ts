import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type AvailabilityEntryDocument = HydratedDocument<AvailabilityEntry>

export type AvailabilityDateMode = 'on' | 'range'
export type AvailabilityTimeMode = 'allDay' | 'between'
export type AvailabilityRecurrenceMode = 'everyday' | 'days'
export type AvailabilityWeekday =
  'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

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
  // Human-readable date/time/recurrence labels are derived on the client from
  // the structured fields below (see lib/availabilityLabels.ts) so they stay
  // localised — they are deliberately not persisted here.
  @Prop({ required: true, enum: ['on', 'range'] })
  dateMode!: AvailabilityDateMode

  @Prop()
  onDate?: string

  @Prop()
  fromDate?: string

  @Prop()
  toDate?: string

  @Prop({ required: true, enum: ['allDay', 'between'] })
  timeMode!: AvailabilityTimeMode

  @Prop()
  startTime?: string

  @Prop()
  endTime?: string

  @Prop({ required: true, enum: ['everyday', 'days'] })
  recurrenceMode!: AvailabilityRecurrenceMode

  @Prop({ type: [String] })
  recurrenceDays?: AvailabilityWeekday[]

  // No Users module yet (no auth) — plain id for now, becomes a real
  // ObjectId ref once the Users module exists.
  @Prop({ required: true })
  studentId!: string
}

export const AvailabilityEntrySchema =
  SchemaFactory.createForClass(AvailabilityEntry)

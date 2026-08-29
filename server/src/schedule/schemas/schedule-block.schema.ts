import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type SchedulePeriod = 'day' | 'week'
export type ScheduleBlockKind =
  'reserved' | 'maintenance' | 'hold' | 'unavailable'

export type ScheduleBlockDocument = HydratedDocument<ScheduleBlock>

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
export class ScheduleBlock {
  // References an Aircraft document's id — no relational Aircraft ref yet
  // since it's stored as a plain string across the codebase (see studentId).
  @Prop({ required: true })
  aircraftId!: string

  @Prop({ required: true, enum: ['day', 'week'] })
  period!: SchedulePeriod

  @Prop({ required: true })
  label!: string

  @Prop({
    required: true,
    enum: ['reserved', 'maintenance', 'hold', 'unavailable'],
  })
  kind!: ScheduleBlockKind

  @Prop({ required: true })
  start!: number

  @Prop({ required: true })
  end!: number

  // Who a reserved block is for, shown in the schedule detail modal. Only
  // set on `reserved` blocks; absent on maintenance/hold/unavailable.
  @Prop()
  studentName?: string

  @Prop()
  instructorName?: string
}

export const ScheduleBlockSchema = SchemaFactory.createForClass(ScheduleBlock)

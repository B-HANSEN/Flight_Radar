import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type LogbookEntryDocument = HydratedDocument<LogbookEntry>

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
export class LogbookEntry {
  @Prop({ required: true })
  date!: string

  @Prop({ required: true })
  depPlace!: string

  @Prop({ required: true })
  depTime!: string

  @Prop({ required: true })
  arrPlace!: string

  @Prop({ required: true })
  arrTime!: string

  @Prop({ required: true })
  model!: string

  @Prop({ required: true })
  reg!: string

  @Prop()
  se?: string

  @Prop()
  xcDual?: string

  @Prop({ required: true })
  total!: string

  @Prop({ required: true })
  pic!: string

  @Prop({ required: true })
  landingsDay!: number

  @Prop()
  landingsNight?: number

  @Prop()
  night?: boolean

  @Prop()
  remarks?: string

  // Plain id of a seeded demo student, not an ObjectId ref.
  @Prop({ required: true })
  studentId!: string
}

export const LogbookEntrySchema = SchemaFactory.createForClass(LogbookEntry)

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type CourseHoursRowKey = 'syllabus' | 'actual' | 'remaining'
export type CourseHoursGroupKey = 'currentLesson' | 'fullCourse'
export type CourseHoursTone = 'positive' | 'negative'

export type CourseProgressDocument = HydratedDocument<CourseProgress>

@Schema({ _id: false })
export class CourseHoursValues {
  @Prop()
  vfrDual?: string

  @Prop()
  vfrPic?: string

  @Prop()
  vfrSpic?: string

  @Prop()
  vfrPicus?: string

  @Prop()
  vfrNight?: string

  @Prop()
  vfrXc?: string

  @Prop()
  ifrDual?: string

  @Prop()
  ifrPic?: string

  @Prop()
  ifrSpic?: string

  @Prop()
  ifrPicus?: string

  @Prop()
  ifrNight?: string

  @Prop()
  ifrXc?: string

  @Prop()
  mccPf?: string

  @Prop()
  mccPm?: string

  @Prop()
  acSe?: string

  @Prop()
  acMe?: string

  @Prop()
  acAb?: string

  @Prop()
  acFstd?: string
}

const CourseHoursValuesSchema = SchemaFactory.createForClass(CourseHoursValues)

@Schema({ _id: false })
export class CourseHoursRow {
  @Prop({ required: true, enum: ['syllabus', 'actual', 'remaining'] })
  key!: CourseHoursRowKey

  @Prop({ enum: ['positive', 'negative'] })
  tone?: CourseHoursTone

  @Prop({ type: CourseHoursValuesSchema, required: true })
  values!: CourseHoursValues
}

const CourseHoursRowSchema = SchemaFactory.createForClass(CourseHoursRow)

@Schema({ _id: false })
export class CourseHoursGroup {
  @Prop({ required: true, enum: ['currentLesson', 'fullCourse'] })
  key!: CourseHoursGroupKey

  @Prop({ type: [CourseHoursRowSchema], required: true })
  rows!: CourseHoursRow[]
}

const CourseHoursGroupSchema = SchemaFactory.createForClass(CourseHoursGroup)

@Schema({ _id: false })
export class CoursePhase {
  @Prop({ required: true })
  number!: number

  @Prop({ required: true })
  actualHours!: string

  @Prop({ required: true })
  targetHours!: string

  @Prop({ required: true })
  pct!: number

  @Prop({ required: true })
  detail!: string
}

const CoursePhaseSchema = SchemaFactory.createForClass(CoursePhase)

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
export class CourseProgress {
  @Prop({ required: true })
  overallActualHours!: string

  @Prop({ required: true })
  overallTargetHours!: string

  @Prop({ required: true })
  overallPct!: number

  @Prop({ required: true })
  vfrTotalHours!: string

  @Prop({ required: true })
  ifrTotalHours!: string

  @Prop({ required: true })
  mccTotalHours!: string

  @Prop({ type: [CourseHoursGroupSchema], required: true })
  groups!: CourseHoursGroup[]

  @Prop({ type: [CoursePhaseSchema], required: true })
  phases!: CoursePhase[]

  // No Users module yet (no auth) — plain id for now, becomes a real
  // ObjectId ref once the Users module exists.
  @Prop({ required: true })
  studentId!: string
}

export const CourseProgressSchema = SchemaFactory.createForClass(CourseProgress)

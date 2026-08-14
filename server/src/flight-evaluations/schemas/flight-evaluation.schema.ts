import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type FlightEvaluationDocument = HydratedDocument<FlightEvaluation>

@Schema({ _id: false })
export class ManeuverAssessment {
  @Prop({ required: true })
  title!: string

  @Prop()
  score?: string
}

const ManeuverAssessmentSchema =
  SchemaFactory.createForClass(ManeuverAssessment)

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
export class FlightEvaluation {
  // Matches the school's own session numbering (e.g. "Instruction #4041369")
  // so it can be cross-referenced with other parts of the app.
  @Prop({ required: true })
  sessionId!: string

  @Prop({ required: true })
  date!: string

  @Prop({ required: true })
  type!: string

  @Prop({ required: true })
  signed!: boolean

  @Prop({ required: true })
  student!: string

  @Prop({ required: true })
  instructor!: string

  @Prop({ required: true })
  course!: string

  @Prop({ required: true })
  sessionTitle!: string

  @Prop({ required: true })
  aircraft!: string

  @Prop({ required: true })
  role!: string

  @Prop({ required: true })
  route!: string

  @Prop({ required: true })
  flightTimeDual!: string

  @Prop({ required: true })
  flightTimeSolo!: string

  @Prop({ required: true })
  landingsDual!: number

  @Prop({ required: true })
  landingsSolo!: number

  @Prop({ type: [ManeuverAssessmentSchema], required: true })
  maneuvers!: ManeuverAssessment[]

  @Prop({ required: true })
  observations!: string

  @Prop({ required: true })
  scorePreparation!: number

  @Prop({ required: true })
  scoreTechnique!: number

  @Prop({ required: true })
  scoreInitiative!: number

  @Prop({ required: true })
  scoreInterest!: number

  @Prop({ required: true })
  scoreAssimilation!: number

  @Prop({ required: true })
  finalScore!: number

  @Prop({ required: true })
  finalNote!: string

  // No Users module yet (no auth) — plain id for now, becomes a real
  // ObjectId ref once the Users module exists.
  @Prop({ required: true })
  studentId!: string
}

export const FlightEvaluationSchema =
  SchemaFactory.createForClass(FlightEvaluation)

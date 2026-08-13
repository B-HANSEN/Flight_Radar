import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type WeatherReportDocument = HydratedDocument<WeatherReport>

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
export class WeatherReport {
  @Prop({ required: true })
  code!: string

  @Prop({ required: true })
  metar!: string

  @Prop({ required: true })
  taf!: string
}

export const WeatherReportSchema = SchemaFactory.createForClass(WeatherReport)

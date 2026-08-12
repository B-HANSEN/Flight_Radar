import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type AircraftDocument = HydratedDocument<Aircraft>

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
export class Aircraft {
  @Prop({ required: true })
  arcid!: string

  @Prop({ required: true })
  type!: string

  @Prop()
  photoSrc?: string
}

export const AircraftSchema = SchemaFactory.createForClass(Aircraft)

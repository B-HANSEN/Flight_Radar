import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type InstructorDocument = HydratedDocument<Instructor>

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
export class Instructor {
  @Prop({ required: true })
  name!: string

  @Prop({ required: true })
  initials!: string

  @Prop({ required: true })
  color!: string

  @Prop({ required: true })
  photoSrc!: string

  @Prop({ required: true })
  email!: string

  @Prop({ required: true })
  phone!: string

  @Prop({ required: true })
  birthday!: string

  @Prop({ required: true })
  info!: string
}

export const InstructorSchema = SchemaFactory.createForClass(Instructor)

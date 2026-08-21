import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type StudentDocument = HydratedDocument<Student>

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
export class Student {
  @Prop({ required: true })
  name!: string

  @Prop({ required: true })
  initials!: string

  @Prop({ required: true })
  color!: string
}

export const StudentSchema = SchemaFactory.createForClass(Student)

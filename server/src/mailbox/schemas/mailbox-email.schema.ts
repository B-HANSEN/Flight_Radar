import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type MailboxEmailDocument = HydratedDocument<MailboxEmail>

@Schema({ _id: false })
export class MailboxSignOff {
  @Prop({ required: true })
  name!: string

  @Prop({ required: true })
  role!: string

  @Prop({ required: true })
  org!: string
}

const MailboxSignOffSchema = SchemaFactory.createForClass(MailboxSignOff)

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
export class MailboxEmail {
  @Prop({ required: true })
  sender!: string

  @Prop({ required: true })
  subject!: string

  @Prop({ required: true })
  date!: string

  @Prop({ required: true })
  dateFull!: string

  @Prop({ required: true })
  preview!: string

  @Prop({ type: [String], required: true })
  body!: string[]

  @Prop({ required: true })
  linkText!: string

  @Prop({ type: MailboxSignOffSchema, required: true })
  signOff!: MailboxSignOff

  @Prop()
  automatic?: boolean

  @Prop()
  read?: boolean

  // No Users module yet (no auth) — plain id for now, becomes a real
  // ObjectId ref once the Users module exists.
  @Prop({ required: true })
  studentId!: string
}

export const MailboxEmailSchema = SchemaFactory.createForClass(MailboxEmail)

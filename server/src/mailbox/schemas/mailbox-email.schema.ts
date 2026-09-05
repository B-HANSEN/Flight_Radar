import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type MailboxEmailDocument = HydratedDocument<MailboxEmail>

// Where a message came from — drives the sender styling and the "from a
// desk vs. from a person" reading. 'personal' is a real person-to-person
// message (senderId is set); the rest are desk- or system-sourced and
// carry no senderId.
export type MailboxCategory =
  'operations' | 'exams' | 'training' | 'community' | 'system' | 'personal'

// The single call-to-action rendered under a message body. 'view'/'join'
// open `href` in a new tab; 'download' streams a generated PDF from
// GET /mailbox/:id/attachment and ignores `href`.
export type MailboxActionType = 'view' | 'download' | 'join'

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

@Schema({ _id: false })
export class MailboxAction {
  @Prop({ required: true, enum: ['view', 'download', 'join'] })
  type!: MailboxActionType

  @Prop({ required: true })
  label!: string

  @Prop()
  href?: string
}

const MailboxActionSchema = SchemaFactory.createForClass(MailboxAction)

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

  // ISO datetime — the sort key, so 'sent' and 'inbox' both list
  // newest-first regardless of the display strings above.
  @Prop({ required: true })
  sentAt!: string

  @Prop({ required: true })
  preview!: string

  @Prop({ type: [String], required: true })
  body!: string[]

  @Prop({ type: MailboxSignOffSchema, required: true })
  signOff!: MailboxSignOff

  @Prop({
    required: true,
    enum: [
      'operations',
      'exams',
      'training',
      'community',
      'system',
      'personal',
    ],
  })
  category!: MailboxCategory

  @Prop({ type: MailboxActionSchema })
  action?: MailboxAction

  @Prop()
  automatic?: boolean

  @Prop({ default: false })
  read?: boolean

  // No Users module yet (no auth) — plain person ids for now (a student or
  // instructor id), become real ObjectId refs once the Users module
  // exists. `recipientId` owns the mailbox the message lands in;
  // `senderId` is set only when a real person sent it (category
  // 'personal'), absent for desk/system mail.
  @Prop({ required: true })
  recipientId!: string

  @Prop()
  senderId?: string
}

export const MailboxEmailSchema = SchemaFactory.createForClass(MailboxEmail)

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export const PERSON_FILE_CATEGORIES = [
  'checklist',
  'license',
  'medical',
  'other',
] as const

export type PersonFileCategory = (typeof PERSON_FILE_CATEGORIES)[number]

export type PersonFileDocument = HydratedDocument<PersonFile>

@Schema({
  timestamps: { createdAt: 'uploadedAt', updatedAt: false },
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret: Record<string, unknown>) => {
      ret.id = (ret._id as { toString(): string }).toString()
      delete ret._id
      // Internal storage key — downloads go through the API, never
      // straight to the private blob.
      delete ret.blobPathname
    },
  },
})
export class PersonFile {
  @Prop({ required: true })
  label!: string

  @Prop({ required: true, type: String, enum: PERSON_FILE_CATEGORIES })
  category!: PersonFileCategory

  // ISO date (YYYY-MM-DD) — e.g. when a license or medical lapses.
  @Prop()
  expiresAt?: string

  // The original file name, used for the download's Content-Disposition.
  @Prop({ required: true })
  fileName!: string

  @Prop({ required: true })
  mimeType!: string

  @Prop({ required: true })
  size!: number

  // Pathname of the private Vercel Blob holding the bytes.
  @Prop({ required: true })
  blobPathname!: string

  // The recipient: a student, or an instructor (whose documents another
  // instructor uploads — four-eyes principle). Plain id of a seeded demo
  // person, not an ObjectId ref.
  @Prop({ required: true })
  personId!: string

  // Plain id of the seeded demo instructor who uploaded it.
  @Prop({ required: true })
  uploadedBy!: string

  uploadedAt?: Date
}

export const PersonFileSchema = SchemaFactory.createForClass(PersonFile)

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export const STUDENT_FILE_CATEGORIES = [
  'checklist',
  'license',
  'medical',
  'other',
] as const

export type StudentFileCategory = (typeof STUDENT_FILE_CATEGORIES)[number]

export type StudentFileDocument = HydratedDocument<StudentFile>

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
export class StudentFile {
  @Prop({ required: true })
  label!: string

  @Prop({ required: true, type: String, enum: STUDENT_FILE_CATEGORIES })
  category!: StudentFileCategory

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

  // Plain id of a seeded demo student, not an ObjectId ref.
  @Prop({ required: true })
  studentId!: string

  // Plain id of the seeded demo instructor who uploaded it.
  @Prop()
  uploadedBy?: string

  uploadedAt?: Date
}

export const StudentFileSchema = SchemaFactory.createForClass(StudentFile)

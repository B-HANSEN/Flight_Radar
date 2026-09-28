import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type DocumentFolderDocument = HydratedDocument<DocumentFolder>

@Schema({ _id: false })
export class DocumentFile {
  @Prop({ required: true })
  name!: string

  @Prop({ required: true })
  ext!: string

  @Prop({ required: true })
  mimeType!: string

  // Each file lives in exactly one of two places. Seeded demo files keep
  // their raw bytes here, so the seed runs without a blob token; uploaded
  // files live in a private Vercel Blob instead. Both are excluded from the
  // folder listing (DocumentsService.findAll) — the bytes to keep
  // /documents light, the pathname because downloads go through the API.
  @Prop()
  data?: Buffer

  @Prop()
  blobPathname?: string

  // Plain id of the seeded demo instructor who uploaded it; absent on
  // seeded files.
  @Prop()
  uploadedBy?: string

  @Prop()
  uploadedAt?: Date
}

const DocumentFileSchema = SchemaFactory.createForClass(DocumentFile)

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
export class DocumentFolder {
  @Prop({ required: true })
  name!: string

  @Prop({ type: [DocumentFileSchema], required: true })
  files!: DocumentFile[]
}

export const DocumentFolderSchema = SchemaFactory.createForClass(DocumentFolder)

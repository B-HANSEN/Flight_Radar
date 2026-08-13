import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type DocumentFolderDocument = HydratedDocument<DocumentFolder>

@Schema({ _id: false })
export class DocumentFile {
  @Prop({ required: true })
  name!: string

  @Prop({ required: true })
  ext!: string
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

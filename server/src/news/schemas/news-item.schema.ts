import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type NewsTag = 'operations' | 'fuel' | 'atc'

export type NewsItemDocument = HydratedDocument<NewsItem>

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
export class NewsItem {
  @Prop({ required: true, enum: ['operations', 'fuel', 'atc'] })
  tag!: NewsTag

  @Prop({ required: true })
  date!: string

  @Prop({ required: true })
  title!: string

  @Prop({ required: true })
  summary!: string
}

export const NewsItemSchema = SchemaFactory.createForClass(NewsItem)

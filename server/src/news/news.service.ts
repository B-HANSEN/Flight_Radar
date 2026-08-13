import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { NewsItem, NewsItemDocument } from './schemas/news-item.schema'

@Injectable()
export class NewsService {
  constructor(
    @InjectModel(NewsItem.name)
    private readonly newsItemModel: Model<NewsItemDocument>,
  ) {}

  findAll() {
    return this.newsItemModel.find().exec()
  }
}

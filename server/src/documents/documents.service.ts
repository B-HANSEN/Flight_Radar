import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import {
  DocumentFolder,
  DocumentFolderDocument,
} from './schemas/document-folder.schema'

@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(DocumentFolder.name)
    private readonly documentFolderModel: Model<DocumentFolderDocument>,
  ) {}

  findAll() {
    return this.documentFolderModel.find().exec()
  }
}

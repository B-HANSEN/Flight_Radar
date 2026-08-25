import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import {
  DocumentFile,
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
    return this.documentFolderModel.find().select('-files.data').exec()
  }

  async findFile(folderId: string, fileName: string): Promise<DocumentFile> {
    const folder = await this.documentFolderModel.findById(folderId).exec()
    const file = folder?.files.find((candidate) => candidate.name === fileName)

    if (!file) {
      throw new NotFoundException(
        `File ${fileName} not found in folder ${folderId}`,
      )
    }

    return file
  }
}

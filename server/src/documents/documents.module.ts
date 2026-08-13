import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { DocumentsController } from './documents.controller'
import { DocumentsService } from './documents.service'
import {
  DocumentFolder,
  DocumentFolderSchema,
} from './schemas/document-folder.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DocumentFolder.name, schema: DocumentFolderSchema },
    ]),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule {}

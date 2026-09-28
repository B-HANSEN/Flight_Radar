import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { BlobStorageService } from '../common/blob-storage.service'
import {
  Instructor,
  InstructorSchema,
} from '../instructors/schemas/instructor.schema'
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
      { name: Instructor.name, schema: InstructorSchema },
    ]),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService, BlobStorageService],
})
export class DocumentsModule {}

import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { BlobStorageService } from './blob-storage.service'
import { StudentFilesController } from './student-files.controller'
import { StudentFilesService } from './student-files.service'
import { StudentFile, StudentFileSchema } from './schemas/student-file.schema'
import { Student, StudentSchema } from '../students/schemas/student.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StudentFile.name, schema: StudentFileSchema },
      { name: Student.name, schema: StudentSchema },
    ]),
  ],
  controllers: [StudentFilesController],
  providers: [StudentFilesService, BlobStorageService],
})
export class StudentFilesModule {}

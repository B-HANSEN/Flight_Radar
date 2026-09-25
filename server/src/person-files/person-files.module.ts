import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { BlobStorageService } from './blob-storage.service'
import { PersonFilesController } from './person-files.controller'
import { PersonFilesService } from './person-files.service'
import { PersonFile, PersonFileSchema } from './schemas/person-file.schema'
import { Student, StudentSchema } from '../students/schemas/student.schema'
import {
  Instructor,
  InstructorSchema,
} from '../instructors/schemas/instructor.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PersonFile.name, schema: PersonFileSchema },
      { name: Student.name, schema: StudentSchema },
      { name: Instructor.name, schema: InstructorSchema },
    ]),
  ],
  controllers: [PersonFilesController],
  providers: [PersonFilesService, BlobStorageService],
})
export class PersonFilesModule {}

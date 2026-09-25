import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import type { Response } from 'express'
import { pipeline } from 'node:stream/promises'
import {
  MAX_FILE_BYTES,
  StudentFilesService,
  type IncomingFile,
  type UploadStudentFileInput,
} from './student-files.service'

@Controller('student-files')
export class StudentFilesController {
  constructor(private readonly studentFilesService: StudentFilesService) {}

  @Get()
  findByStudent(@Query('studentId') studentId: string) {
    return this.studentFilesService.findByStudent(studentId)
  }

  // Multipart upload: a `file` part plus the metadata fields. Multer rejects
  // an oversized file with a 413 before it reaches the service.
  @Post()
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_FILE_BYTES } }),
  )
  upload(
    @UploadedFile() file: IncomingFile | undefined,
    @Body() body: UploadStudentFileInput,
  ) {
    return this.studentFilesService.upload(file, body)
  }

  // Streams the private blob through the API — the browser never sees the
  // blob URL. Mirrors the documents module's download endpoint.
  @Get(':id/download')
  async download(@Param('id') id: string, @Res() res: Response) {
    const { file, stream } = await this.studentFilesService.openDownload(id)

    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="${file.fileName}"`,
    })
    await pipeline(stream, res)
  }
}

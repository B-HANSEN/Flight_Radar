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
  PersonFilesService,
  type IncomingFile,
  type UploadPersonFileInput,
} from './person-files.service'

@Controller('person-files')
export class PersonFilesController {
  constructor(private readonly personFilesService: PersonFilesService) {}

  // `personId` is a student or an instructor.
  @Get()
  findByPerson(@Query('personId') personId: string) {
    return this.personFilesService.findByPerson(personId)
  }

  // Multipart upload: a `file` part plus the metadata fields. Multer rejects
  // an oversized file with a 413 before it reaches the service.
  @Post()
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_FILE_BYTES } }),
  )
  upload(
    @UploadedFile() file: IncomingFile | undefined,
    @Body() body: UploadPersonFileInput,
  ) {
    return this.personFilesService.upload(file, body)
  }

  // Streams the private blob through the API — the browser never sees the
  // blob URL. Mirrors the documents module's download endpoint.
  @Get(':id/download')
  async download(@Param('id') id: string, @Res() res: Response) {
    const { file, stream } = await this.personFilesService.openDownload(id)

    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="${file.fileName}"`,
    })
    await pipeline(stream, res)
  }
}

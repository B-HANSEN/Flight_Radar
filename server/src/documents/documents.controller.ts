import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import type { Response } from 'express'
import { pipeline } from 'node:stream/promises'
import { attachmentDisposition, uploadOptions } from '../common/file-transfer'
import {
  DocumentsService,
  MAX_FILE_BYTES,
  type IncomingFile,
} from './documents.service'

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  findAll() {
    return this.documentsService.findAll()
  }

  // Multipart upload: a `file` part plus the uploading instructor's id.
  // Multer rejects an oversized file with a 413 before it reaches the
  // service. Responds with the updated folder.
  @Post(':folderId/files')
  @UseInterceptors(FileInterceptor('file', uploadOptions(MAX_FILE_BYTES)))
  upload(
    @Param('folderId') folderId: string,
    @UploadedFile() file: IncomingFile | undefined,
    @Body('uploadedBy') uploadedBy: string,
  ) {
    return this.documentsService.upload(folderId, file, uploadedBy)
  }

  @Get(':folderId/files/:fileName')
  async downloadFile(
    @Param('folderId') folderId: string,
    @Param('fileName') fileName: string,
    @Res() res: Response,
  ) {
    const { file, body } = await this.documentsService.openDownload(
      folderId,
      fileName,
    )

    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': attachmentDisposition(file.name),
    })
    if (Buffer.isBuffer(body)) {
      res.send(body)
    } else {
      await pipeline(body, res)
    }
  }

  @Delete(':folderId/files/:fileName')
  deleteFile(
    @Param('folderId') folderId: string,
    @Param('fileName') fileName: string,
  ) {
    return this.documentsService.deleteFile(folderId, fileName)
  }
}

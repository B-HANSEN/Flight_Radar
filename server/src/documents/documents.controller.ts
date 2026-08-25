import { Controller, Get, Param, Res } from '@nestjs/common'
import type { Response } from 'express'
import { DocumentsService } from './documents.service'

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  findAll() {
    return this.documentsService.findAll()
  }

  @Get(':folderId/files/:fileName')
  async downloadFile(
    @Param('folderId') folderId: string,
    @Param('fileName') fileName: string,
    @Res() res: Response,
  ) {
    const file = await this.documentsService.findFile(folderId, fileName)

    res
      .set({
        'Content-Type': file.mimeType,
        'Content-Disposition': `attachment; filename="${file.name}"`,
      })
      .send(file.data)
  }
}

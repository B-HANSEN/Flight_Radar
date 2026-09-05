import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common'
import type { Response } from 'express'
import { MailboxService } from './mailbox.service'
import type { CreateMailboxEmailInput } from './mailbox.service'

@Controller('mailbox')
export class MailboxController {
  constructor(private readonly mailboxService: MailboxService) {}

  @Get()
  findAll(
    @Query('recipientId') recipientId?: string,
    @Query('senderId') senderId?: string,
  ) {
    return this.mailboxService.findAll(recipientId, senderId)
  }

  @Post()
  create(@Body() body: CreateMailboxEmailInput) {
    return this.mailboxService.create(body)
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string) {
    return this.mailboxService.markRead(id)
  }

  @Get(':id/attachment')
  async downloadAttachment(@Param('id') id: string, @Res() res: Response) {
    const file = await this.mailboxService.getAttachment(id)

    res
      .set({
        'Content-Type': file.mimeType,
        'Content-Disposition': `attachment; filename="${file.fileName}"`,
      })
      .send(file.data)
  }
}

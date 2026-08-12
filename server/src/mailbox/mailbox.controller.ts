import { Controller, Get } from '@nestjs/common'
import { MailboxService } from './mailbox.service'

@Controller('mailbox')
export class MailboxController {
  constructor(private readonly mailboxService: MailboxService) {}

  @Get()
  findAll() {
    return this.mailboxService.findAll()
  }
}

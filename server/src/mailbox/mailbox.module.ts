import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { MailboxController } from './mailbox.controller'
import { MailboxService } from './mailbox.service'
import {
  MailboxEmail,
  MailboxEmailSchema,
} from './schemas/mailbox-email.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MailboxEmail.name, schema: MailboxEmailSchema },
    ]),
  ],
  controllers: [MailboxController],
  providers: [MailboxService],
})
export class MailboxModule {}

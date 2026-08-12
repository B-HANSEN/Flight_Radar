import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import {
  MailboxEmail,
  MailboxEmailDocument,
} from './schemas/mailbox-email.schema'

@Injectable()
export class MailboxService {
  constructor(
    @InjectModel(MailboxEmail.name)
    private readonly mailboxEmailModel: Model<MailboxEmailDocument>,
  ) {}

  findAll() {
    return this.mailboxEmailModel.find().exec()
  }
}

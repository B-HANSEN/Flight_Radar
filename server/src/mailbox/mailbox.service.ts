import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import {
  MailboxAction,
  MailboxCategory,
  MailboxEmail,
  MailboxEmailDocument,
  MailboxSignOff,
} from './schemas/mailbox-email.schema'
import { toDisplayDate, formatISODate } from '../common/date'
import { withErrorLogging } from '../common/logging'
import {
  buildMailboxAttachmentPdf,
  mailboxAttachmentFileName,
} from './mailbox-attachment'

export type CreateMailboxEmailInput = {
  recipientId: string
  senderId?: string
  sender: string
  category: MailboxCategory
  subject: string
  body: string[]
  signOff: MailboxSignOff
  action?: MailboxAction
  automatic?: boolean
}

const PREVIEW_MAX_LENGTH = 80

function buildPreview(body: string[]): string {
  const first = body.find((paragraph) => paragraph.trim() !== '') ?? ''
  if (first.length <= PREVIEW_MAX_LENGTH) return first
  return `${first.slice(0, PREVIEW_MAX_LENGTH).trimEnd()}...`
}

@Injectable()
export class MailboxService {
  private readonly logger = new Logger(MailboxService.name)

  constructor(
    @InjectModel(MailboxEmail.name)
    private readonly mailboxEmailModel: Model<MailboxEmailDocument>,
  ) {}

  // `recipientId` gives a person their inbox, `senderId` their sent items;
  // with neither it returns everything (dev/debug only). Newest first.
  findAll(recipientId?: string, senderId?: string) {
    const filter: Record<string, string> = {}
    if (recipientId) filter.recipientId = recipientId
    if (senderId) filter.senderId = senderId
    return this.mailboxEmailModel.find(filter).sort({ sentAt: -1 }).exec()
  }

  async create(input: CreateMailboxEmailInput) {
    const now = new Date()
    const date = toDisplayDate(formatISODate(now))
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes(),
    ).padStart(2, '0')}`

    return withErrorLogging(
      this.logger,
      `Send mailbox email to ${input.recipientId}`,
      () =>
        this.mailboxEmailModel.create({
          ...input,
          date,
          dateFull: `${date} ${time}`,
          sentAt: now.toISOString(),
          preview: buildPreview(input.body),
          read: false,
        }),
    )
  }

  async markRead(id: string) {
    const email = await withErrorLogging(
      this.logger,
      `Mark mailbox email ${id} read`,
      () =>
        this.mailboxEmailModel
          .findByIdAndUpdate(id, { read: true }, { returnDocument: 'after' })
          .exec(),
    )

    if (!email) {
      throw new NotFoundException(`Mailbox email ${id} not found`)
    }

    return email
  }

  async getAttachment(id: string) {
    const email = await this.mailboxEmailModel.findById(id).exec()

    if (!email || email.action?.type !== 'download') {
      throw new NotFoundException(
        `No downloadable attachment for mailbox email ${id}`,
      )
    }

    return {
      mimeType: 'application/pdf',
      fileName: mailboxAttachmentFileName(email),
      data: await buildMailboxAttachmentPdf(email),
    }
  }
}

import { Test, TestingModule } from '@nestjs/testing'
import { MailboxController } from './mailbox.controller'
import { MailboxService } from './mailbox.service'
import { MailboxEmail } from './schemas/mailbox-email.schema'
import type { CreateMailboxEmailInput } from './mailbox.service'

describe('MailboxController', () => {
  let controller: MailboxController
  const emails: MailboxEmail[] = [
    {
      sender: 'Operations Desk',
      subject: 'Runway 07/25 closed for resurfacing',
      date: '30/05/2026',
      dateFull: '30/05/2026 16:20',
      sentAt: '2026-05-30T16:20:00.000Z',
      preview: 'Scheduled maintenance work will close the main runway...',
      body: ['Scheduled resurfacing work will close runway 07/25.'],
      signOff: {
        name: 'Operations Desk',
        role: 'Airfield Operations',
        org: 'Flight Radar Academy',
      },
      category: 'operations',
      recipientId: 'student-1',
    },
  ]
  const mailboxService = {
    findAll: jest.fn().mockResolvedValue(emails),
    create: jest.fn().mockResolvedValue(emails[0]),
    markRead: jest.fn().mockResolvedValue(emails[0]),
    getAttachment: jest.fn().mockResolvedValue({
      mimeType: 'application/pdf',
      fileName: 'runway-07-25-closed-for-resurfacing.pdf',
      data: Buffer.from('%PDF-1.4'),
    }),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MailboxController],
      providers: [{ provide: MailboxService, useValue: mailboxService }],
    }).compile()

    controller = app.get<MailboxController>(MailboxController)
  })

  it('passes the recipient and sender filters through to the service', async () => {
    await expect(controller.findAll('student-1', undefined)).resolves.toBe(
      emails,
    )
    expect(mailboxService.findAll).toHaveBeenCalledWith('student-1', undefined)
  })

  it('delegates a send to the service', async () => {
    const body: CreateMailboxEmailInput = {
      recipientId: 'instructor-2',
      senderId: 'instructor-1',
      sender: 'James Whitfield',
      category: 'personal',
      subject: 'Cover my Thursday slots?',
      body: ['Could you take my two Thursday afternoon lessons?'],
      signOff: {
        name: 'James Whitfield',
        role: 'Chief Flight Instructor',
        org: 'Flight Radar Academy',
      },
    }
    await controller.create(body)
    expect(mailboxService.create).toHaveBeenCalledWith(body)
  })

  it('delegates a mark-as-read to the service', async () => {
    await controller.markRead('email-1')
    expect(mailboxService.markRead).toHaveBeenCalledWith('email-1')
  })

  it('streams the generated attachment with a download disposition', async () => {
    const send = jest.fn()
    const set = jest.fn().mockReturnValue({ send })
    const res = { set } as unknown as Parameters<
      MailboxController['downloadAttachment']
    >[1]

    await controller.downloadAttachment('email-1', res)

    expect(mailboxService.getAttachment).toHaveBeenCalledWith('email-1')
    expect(set).toHaveBeenCalledWith({
      'Content-Type': 'application/pdf',
      'Content-Disposition':
        'attachment; filename="runway-07-25-closed-for-resurfacing.pdf"',
    })
    expect(send).toHaveBeenCalledWith(expect.any(Buffer))
  })
})

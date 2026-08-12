import { Test, TestingModule } from '@nestjs/testing'
import { MailboxController } from './mailbox.controller'
import { MailboxService } from './mailbox.service'
import { MailboxEmail } from './schemas/mailbox-email.schema'

describe('MailboxController', () => {
  let controller: MailboxController
  const emails: MailboxEmail[] = [
    {
      sender: 'Training Office',
      subject: 'We value your feedback',
      date: '30/05/2026',
      dateFull: '30/05/2026 16:20',
      preview: 'A short survey on your recent training experience...',
      body: ['We are reaching out to invite you to complete our survey.'],
      linkText: 'flightschoolsurvey.example.com',
      signOff: {
        name: 'Training Office',
        role: 'Head of Training',
        org: 'Flight Radar Academy',
      },
      studentId: 'student-1',
    },
  ]
  const mailboxService = { findAll: jest.fn().mockResolvedValue(emails) }

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MailboxController],
      providers: [{ provide: MailboxService, useValue: mailboxService }],
    }).compile()

    controller = app.get<MailboxController>(MailboxController)
  })

  it('returns the mailbox emails from the service', async () => {
    await expect(controller.findAll()).resolves.toBe(emails)
    expect(mailboxService.findAll).toHaveBeenCalled()
  })
})

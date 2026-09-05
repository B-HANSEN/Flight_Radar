import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { getModelToken } from '@nestjs/mongoose'
import { MailboxService } from './mailbox.service'
import { MailboxEmail } from './schemas/mailbox-email.schema'

describe('MailboxService', () => {
  let service: MailboxService

  const sort = jest.fn()
  const mailboxEmailModel = {
    find: jest.fn().mockReturnValue({ sort }),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findById: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    sort.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) })
    mailboxEmailModel.create.mockImplementation((doc) => Promise.resolve(doc))

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        MailboxService,
        {
          provide: getModelToken(MailboxEmail.name),
          useValue: mailboxEmailModel,
        },
      ],
    }).compile()

    service = app.get<MailboxService>(MailboxService)
  })

  it('filters an inbox query by recipient and sorts newest first', async () => {
    await service.findAll('student-1')

    expect(mailboxEmailModel.find).toHaveBeenCalledWith({
      recipientId: 'student-1',
    })
    expect(sort).toHaveBeenCalledWith({ sentAt: -1 })
  })

  it('filters a sent query by sender only', async () => {
    await service.findAll(undefined, 'instructor-1')

    expect(mailboxEmailModel.find).toHaveBeenCalledWith({
      senderId: 'instructor-1',
    })
  })

  it('stamps date, preview and an unread flag on a sent message', async () => {
    const created = await service.create({
      recipientId: 'instructor-2',
      senderId: 'instructor-1',
      sender: 'James Whitfield',
      category: 'personal',
      subject: 'Stage check standardisation',
      body: [
        'A really long opening paragraph that comfortably exceeds the eighty character preview cutoff so it gets truncated',
        'Second paragraph.',
      ],
      signOff: {
        name: 'James Whitfield',
        role: 'Chief Flight Instructor',
        org: 'Flight Radar Academy',
      },
    })

    expect(created).toMatchObject({
      read: false,
      recipientId: 'instructor-2',
      category: 'personal',
    })
    expect(created.date).toMatch(/^\d{2}\/\d{2}\/\d{4}$/)
    expect(created.dateFull).toMatch(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/)
    expect(created.preview.endsWith('...')).toBe(true)
    expect(created.preview.length).toBeLessThanOrEqual(83)
  })

  it('marks a message read and returns the updated document', async () => {
    mailboxEmailModel.findByIdAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ id: 'email-1', read: true }),
    })

    await expect(service.markRead('email-1')).resolves.toEqual({
      id: 'email-1',
      read: true,
    })
    expect(mailboxEmailModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'email-1',
      { read: true },
      { returnDocument: 'after' },
    )
  })

  it('throws when marking a message that does not exist', async () => {
    mailboxEmailModel.findByIdAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    })

    await expect(service.markRead('missing')).rejects.toThrow(NotFoundException)
  })

  it('generates a PDF attachment for a download-action message', async () => {
    mailboxEmailModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        sender: 'Exams Office',
        subject: 'Official Exams Calendar 2026',
        dateFull: '27/11/2025 11:45',
        body: ['Please find the calendar attached.'],
        signOff: { name: 'Exams Office', role: 'Academics', org: 'Academy' },
        action: { type: 'download', label: 'Download the calendar' },
      }),
    })

    const file = await service.getAttachment('email-1')

    expect(file.mimeType).toBe('application/pdf')
    expect(file.fileName).toBe('official-exams-calendar-2026.pdf')
    expect(file.data.subarray(0, 4).toString()).toBe('%PDF')
  })

  it('throws when a message has no download action', async () => {
    mailboxEmailModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        subject: 'No attachment here',
        action: { type: 'view', label: 'View', href: 'https://example.com' },
      }),
    })

    await expect(service.getAttachment('email-1')).rejects.toThrow(
      NotFoundException,
    )
  })
})

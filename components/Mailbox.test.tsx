import { fireEvent, render, screen, within } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import Mailbox from './Mailbox'
import {
  DUMMY_MAILBOX_EMAILS,
  DUMMY_MAILBOX_PEOPLE,
  DUMMY_MAILBOX_SENT,
} from './Mailbox.data'
import type { MailboxEmail, MailboxPerson } from './Mailbox.types'
import { fetchApi } from '@/lib/api'
import enMessages from '@/messages/en.json'

const mockRouterRefresh = vi.fn()
vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ refresh: mockRouterRefresh }),
}))

vi.mock('@/lib/api', async (importActual) => ({
  ...(await importActual<typeof import('@/lib/api')>()),
  apiUrl: (path: string) => `http://api.test${path}`,
  fetchApi: vi.fn(),
}))

const PEOPLE: MailboxPerson[] = [
  { id: 'instructor-kate', name: 'Kate Ashford', kind: 'instructor' },
  { id: 'student-priya', name: 'Priya Shah', kind: 'student' },
]

const INBOX: MailboxEmail[] = [
  {
    id: 'ops-notice',
    sender: 'Operations Desk',
    recipientId: 'student-jamie',
    category: 'operations',
    subject: 'Runway closure',
    date: '01/06/2026',
    dateFull: '01/06/2026 09:00',
    sentAt: '2026-06-01T09:00:00.000Z',
    preview: 'Runway 07/25 closed for maintenance...',
    body: ['Runway 07/25 will be closed for maintenance.'],
    signOff: { name: 'Operations Desk', role: 'Ops', org: 'Academy' },
    action: {
      type: 'view',
      label: 'View the NOTAM',
      href: 'https://notams.example.com/x',
    },
    read: false,
  },
  {
    id: 'survey',
    sender: 'Training Office',
    recipientId: 'student-jamie',
    category: 'training',
    subject: 'We value your feedback',
    date: '02/06/2026',
    dateFull: '02/06/2026 10:00',
    sentAt: '2026-06-02T10:00:00.000Z',
    preview: 'A short survey...',
    body: ['Please complete our survey.'],
    signOff: { name: 'Training Office', role: 'Head', org: 'Academy' },
    action: { type: 'download', label: 'Download the calendar' },
    automatic: true,
  },
]

const SENT: MailboxEmail[] = [
  {
    id: 'to-kate',
    sender: 'Jamie Torres',
    senderId: 'student-jamie',
    recipientId: 'instructor-kate',
    category: 'personal',
    subject: 'Crosswind question',
    date: '03/06/2026',
    dateFull: '03/06/2026 20:00',
    sentAt: '2026-06-03T20:00:00.000Z',
    preview: 'What crosswind limit...',
    body: ['What crosswind should I treat as my personal limit?'],
    signOff: { name: 'Jamie Torres', role: 'PPL student', org: 'Academy' },
    read: true,
  },
]

function renderMailbox(
  props: Partial<React.ComponentProps<typeof Mailbox>> = {},
) {
  return render(
    <NextIntlClientProvider locale='en' messages={enMessages}>
      <Mailbox
        emails={INBOX}
        sentEmails={SENT}
        people={PEOPLE}
        currentPersonId='student-jamie'
        currentPersonName='Jamie Torres'
        currentPersonRole='Student'
        {...props}
      />
    </NextIntlClientProvider>,
  )
}

beforeEach(() => {
  vi.mocked(fetchApi).mockReset()
  vi.mocked(fetchApi).mockResolvedValue(undefined as never)
  mockRouterRefresh.mockReset()
})

describe('Mailbox', () => {
  it('renders the shared demo fixtures without crashing', () => {
    renderMailbox({
      emails: DUMMY_MAILBOX_EMAILS,
      sentEmails: DUMMY_MAILBOX_SENT,
      people: DUMMY_MAILBOX_PEOPLE,
    })

    expect(
      screen.getByRole('heading', { name: /solo cross-country/ }),
    ).toBeInTheDocument()
  })

  it('shows an empty-state message when there are no emails in either folder', () => {
    renderMailbox({ emails: [], sentEmails: [] })

    expect(screen.getByText('No emails to show.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Compose' })).toBeInTheDocument()
  })

  it('lists the inbox, hides automatic emails by default, and opens the first visible one', () => {
    renderMailbox()

    expect(screen.getByText('2 emails')).toBeInTheDocument()
    expect(screen.getByText('1 unread')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Operations Desk/ }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /Training Office/ }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Runway closure' }),
    ).toBeInTheDocument()
    expect(screen.getByText('to Jamie Torres')).toBeInTheDocument()
  })

  it('reveals automatic emails when the filter checkbox is unchecked', () => {
    renderMailbox()

    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Hide automatic notifications' }),
    )

    expect(
      screen.getByRole('button', { name: /Training Office/ }),
    ).toBeInTheDocument()
  })

  it('hides read emails when the hide-read filter is checked', () => {
    renderMailbox()

    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Hide automatic notifications' }),
    )
    fireEvent.click(screen.getByRole('checkbox', { name: 'Hide read emails' }))

    expect(
      screen.queryByRole('button', { name: /Training Office/ }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Operations Desk/ }),
    ).toBeInTheDocument()
  })

  it('marks an email read on open, drops the unread count, and notifies the backend', () => {
    renderMailbox()

    const opsButton = screen.getByRole('button', { name: /Operations Desk/ })
    const subject = within(opsButton).getByText('Runway closure')
    expect(subject).toHaveClass('font-bold')

    fireEvent.click(opsButton)

    expect(subject).toHaveClass('font-normal')
    expect(screen.getByText('0 unread')).toBeInTheDocument()
    expect(fetchApi).toHaveBeenCalledWith('/mailbox/ops-notice/read', {
      method: 'PATCH',
      cache: 'no-store',
    })
  })

  it('surfaces a toast when the mark-as-read call fails', async () => {
    vi.mocked(fetchApi).mockRejectedValueOnce(new Error('boom'))
    renderMailbox()

    fireEvent.click(screen.getByRole('button', { name: /Operations Desk/ }))

    expect(
      await screen.findByText('Could not update the read status.'),
    ).toBeInTheDocument()
  })

  it('exposes an "Unread" label to assistive tech only while unread', () => {
    renderMailbox()

    const opsButton = screen.getByRole('button', { name: /Operations Desk/ })
    expect(within(opsButton).getByText('Unread:')).toBeInTheDocument()

    fireEvent.click(opsButton)

    expect(within(opsButton).queryByText('Unread:')).not.toBeInTheDocument()
  })

  it('refreshes the route, resets local read-state, and shows a fetching toast', () => {
    renderMailbox()

    fireEvent.click(screen.getByRole('button', { name: /Operations Desk/ }))
    expect(screen.getByText('0 unread')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }))

    expect(mockRouterRefresh).toHaveBeenCalled()
    expect(screen.getByRole('status')).toHaveTextContent('Fetching…')
    expect(screen.getByText('1 unread')).toBeInTheDocument()
  })

  it('renders a view action as a new-tab link and a download action as an attachment link', () => {
    renderMailbox()

    expect(
      screen.getByRole('link', { name: /View the NOTAM/ }),
    ).toHaveAttribute('href', 'https://notams.example.com/x')

    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Hide automatic notifications' }),
    )
    fireEvent.click(screen.getByRole('button', { name: /Training Office/ }))

    expect(
      screen.getByRole('link', { name: /Download the calendar/ }),
    ).toHaveAttribute('href', 'http://api.test/mailbox/survey/attachment')
  })

  it('switches to the Sent folder, showing recipients and no unread controls', () => {
    renderMailbox()

    fireEvent.click(screen.getByRole('button', { name: 'Sent' }))

    expect(screen.getByText('1 email')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /To Kate Ashford/ }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('checkbox', { name: 'Hide read emails' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Crosswind question' }),
    ).toBeInTheDocument()
    expect(screen.getByText('to Kate Ashford')).toBeInTheDocument()
  })

  it('sends a composed message, posts it to the API, and switches to Sent', async () => {
    renderMailbox()

    fireEvent.click(screen.getByRole('button', { name: 'Compose' }))
    fireEvent.change(screen.getByLabelText('To'), {
      target: { value: 'instructor-kate' },
    })
    fireEvent.change(screen.getByLabelText('Subject'), {
      target: { value: 'Thursday plan' },
    })
    fireEvent.change(screen.getByLabelText('Message'), {
      target: { value: 'First para.\n\nSecond para.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))

    await screen.findByText('Message sent')

    expect(fetchApi).toHaveBeenCalledWith(
      '/mailbox',
      expect.objectContaining({ method: 'POST' }),
    )
    const [, options] = vi
      .mocked(fetchApi)
      .mock.calls.find(([path]) => path === '/mailbox')!
    expect(JSON.parse((options as RequestInit).body as string)).toEqual({
      recipientId: 'instructor-kate',
      senderId: 'student-jamie',
      sender: 'Jamie Torres',
      category: 'personal',
      subject: 'Thursday plan',
      body: ['First para.', 'Second para.'],
      signOff: {
        name: 'Jamie Torres',
        role: 'Student',
        org: 'Flight Radar Academy',
      },
    })
    expect(mockRouterRefresh).toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Sent' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('offers the "send as" desk picker only for instructor personas', () => {
    const { rerender } = renderMailbox({ canSendAsDesk: false })
    fireEvent.click(screen.getByRole('button', { name: 'Compose' }))
    expect(screen.queryByLabelText('Send as')).not.toBeInTheDocument()

    rerender(
      <NextIntlClientProvider locale='en' messages={enMessages}>
        <Mailbox
          emails={INBOX}
          sentEmails={SENT}
          people={PEOPLE}
          currentPersonId='instructor-james'
          currentPersonName='James Whitfield'
          currentPersonRole='Instructor'
          canSendAsDesk
        />
      </NextIntlClientProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Compose' }))
    expect(screen.getByLabelText('Send as')).toBeInTheDocument()
  })

  it('shows an error toast when sending fails and keeps the compose modal open', async () => {
    vi.mocked(fetchApi).mockRejectedValueOnce(new Error('network'))
    renderMailbox()

    fireEvent.click(screen.getByRole('button', { name: 'Compose' }))
    fireEvent.change(screen.getByLabelText('To'), {
      target: { value: 'instructor-kate' },
    })
    fireEvent.change(screen.getByLabelText('Subject'), {
      target: { value: 'Hi' },
    })
    fireEvent.change(screen.getByLabelText('Message'), {
      target: { value: 'Body' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))

    expect(
      await screen.findByText(
        'Your message could not be sent. Please try again.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Subject')).toBeInTheDocument()
  })

  it('shows an empty-filter message when every email is filtered out', () => {
    renderMailbox({
      emails: [
        {
          id: 'only-automatic',
          sender: 'Training Office',
          recipientId: 'student-jamie',
          category: 'training',
          subject: 'We value your feedback',
          date: '03/06/2026',
          dateFull: '03/06/2026 11:00',
          sentAt: '2026-06-03T11:00:00.000Z',
          preview: 'A short survey...',
          body: ['Please complete our survey.'],
          signOff: { name: 'Training Office', role: 'Head', org: 'Academy' },
          automatic: true,
        },
      ],
      sentEmails: [],
    })

    expect(
      screen.getAllByText('No emails match the current filter.'),
    ).toHaveLength(2)
  })
})

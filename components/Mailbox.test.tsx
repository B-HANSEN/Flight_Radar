import { act, fireEvent, render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import Mailbox from './Mailbox'
import type { MailboxEmail } from './Mailbox.types'
import enMessages from '@/messages/en.json'

const EMAILS: MailboxEmail[] = [
  {
    id: 'ops-notice',
    sender: 'Operations Desk',
    subject: 'Runway closure',
    date: '01/06/2026',
    dateFull: '01/06/2026 09:00',
    preview: 'Runway 07/25 closed for maintenance...',
    body: ['Runway 07/25 will be closed for maintenance.'],
    linkText: 'View the NOTAM',
    signOff: { name: 'Operations Desk', role: 'Ops', org: 'Academy' },
    read: false,
  },
  {
    id: 'survey',
    sender: 'Training Office',
    subject: 'We value your feedback',
    date: '02/06/2026',
    dateFull: '02/06/2026 10:00',
    preview: 'A short survey...',
    body: ['Please complete our survey.'],
    linkText: 'Take the survey',
    signOff: { name: 'Training Office', role: 'Head', org: 'Academy' },
    automatic: true,
  },
]

function renderMailbox(
  props: Partial<React.ComponentProps<typeof Mailbox>> = {},
) {
  return render(
    <NextIntlClientProvider locale='en' messages={enMessages}>
      <Mailbox emails={EMAILS} {...props} />
    </NextIntlClientProvider>,
  )
}

describe('Mailbox', () => {
  it('shows an empty-state message when there are no emails', () => {
    renderMailbox({ emails: [] })

    expect(screen.getByText('No emails to show.')).toBeInTheDocument()
  })

  it('lists visible emails, hides automatic ones by default, and reads the first visible one', () => {
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
    expect(
      screen.getByText('Runway 07/25 will be closed for maintenance.'),
    ).toBeInTheDocument()
    expect(screen.getByText('to John Doe')).toBeInTheDocument()
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

  it('switches the reading pane when a different email is selected', () => {
    renderMailbox()

    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Hide automatic notifications' }),
    )
    fireEvent.click(screen.getByRole('button', { name: /Training Office/ }))

    expect(
      screen.getByRole('heading', { name: 'We value your feedback' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Please complete our survey.')).toBeInTheDocument()
  })

  it('shows a self-dismissing fetching toast and calls onRefresh when refresh is clicked', () => {
    vi.useFakeTimers()
    const onRefresh = vi.fn()
    renderMailbox({ onRefresh })

    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }))

    expect(onRefresh).toHaveBeenCalledOnce()
    expect(screen.getByRole('status')).toHaveTextContent('Fetching…')

    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(screen.queryByRole('status')).not.toBeInTheDocument()

    vi.useRealTimers()
  })

  it('shows an empty-filter message when every email is hidden by the filter', () => {
    renderMailbox({
      emails: [
        {
          id: 'only-automatic',
          sender: 'Training Office',
          subject: 'We value your feedback',
          date: '03/06/2026',
          dateFull: '03/06/2026 11:00',
          preview: 'A short survey...',
          body: ['Please complete our survey.'],
          linkText: 'Take the survey',
          signOff: { name: 'Training Office', role: 'Head', org: 'Academy' },
          automatic: true,
        },
      ],
    })

    expect(
      screen.getAllByText('No emails match the current filter.'),
    ).toHaveLength(2)
  })
})

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import ComposeEmailModal from './ComposeEmailModal'
import type { MailboxPerson } from './Mailbox.types'
import enMessages from '@/messages/en.json'

const PEOPLE: MailboxPerson[] = [
  { id: 'instructor-kate', name: 'Kate Ashford', kind: 'instructor' },
  { id: 'student-priya', name: 'Priya Shah', kind: 'student' },
]

function renderModal(
  props: Partial<React.ComponentProps<typeof ComposeEmailModal>> = {},
) {
  const onSend = props.onSend ?? vi.fn().mockResolvedValue(undefined)
  const onClose = props.onClose ?? vi.fn()
  render(
    <NextIntlClientProvider locale='en' messages={enMessages}>
      <ComposeEmailModal
        isOpen
        onClose={onClose}
        people={PEOPLE}
        onSend={onSend}
        {...props}
      />
    </NextIntlClientProvider>,
  )
  return { onSend, onClose }
}

describe('ComposeEmailModal', () => {
  it('renders nothing when closed', () => {
    renderModal({ isOpen: false })
    expect(screen.queryByText('New message')).not.toBeInTheDocument()
  })

  it('keeps Send disabled until a recipient, subject and body are all set', () => {
    renderModal()
    const send = screen.getByRole('button', { name: 'Send' })
    expect(send).toBeDisabled()

    fireEvent.change(screen.getByLabelText('To'), {
      target: { value: 'instructor-kate' },
    })
    fireEvent.change(screen.getByLabelText('Subject'), {
      target: { value: 'Hi' },
    })
    expect(send).toBeDisabled()

    fireEvent.change(screen.getByLabelText('Message'), {
      target: { value: 'Body text' },
    })
    expect(send).toBeEnabled()
  })

  it('hides the "send as" picker unless desk sending is allowed', () => {
    const { rerender } = render(
      <NextIntlClientProvider locale='en' messages={enMessages}>
        <ComposeEmailModal
          isOpen
          onClose={vi.fn()}
          people={PEOPLE}
          onSend={vi.fn()}
        />
      </NextIntlClientProvider>,
    )
    expect(screen.queryByLabelText('Send as')).not.toBeInTheDocument()

    rerender(
      <NextIntlClientProvider locale='en' messages={enMessages}>
        <ComposeEmailModal
          isOpen
          onClose={vi.fn()}
          people={PEOPLE}
          canSendAsDesk
          onSend={vi.fn()}
        />
      </NextIntlClientProvider>,
    )
    expect(screen.getByLabelText('Send as')).toBeInTheDocument()
  })

  it('submits the trimmed values and the chosen sender', async () => {
    const onSend = vi.fn().mockResolvedValue(undefined)
    renderModal({ canSendAsDesk: true, onSend })

    fireEvent.change(screen.getByLabelText('To'), {
      target: { value: 'student-priya' },
    })
    fireEvent.change(screen.getByLabelText('Send as'), {
      target: { value: 'exams' },
    })
    fireEvent.change(screen.getByLabelText('Subject'), {
      target: { value: '  Exam slot  ' },
    })
    fireEvent.change(screen.getByLabelText('Message'), {
      target: { value: 'Your sitting is confirmed.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))

    expect(onSend).toHaveBeenCalledWith({
      recipientId: 'student-priya',
      subject: 'Exam slot',
      body: 'Your sitting is confirmed.',
      sendAs: 'exams',
    })
  })

  it('resets the fields after a successful send', async () => {
    const onSend = vi.fn().mockResolvedValue(undefined)
    renderModal({ onSend })

    fireEvent.change(screen.getByLabelText('To'), {
      target: { value: 'instructor-kate' },
    })
    fireEvent.change(screen.getByLabelText('Subject'), {
      target: { value: 'Subject' },
    })
    fireEvent.change(screen.getByLabelText('Message'), {
      target: { value: 'Body' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))

    await waitFor(() =>
      expect(screen.getByLabelText('Subject')).toHaveValue(''),
    )
    expect(screen.getByLabelText('Message')).toHaveValue('')
  })

  it('keeps the entered text when the send fails', async () => {
    const onSend = vi.fn().mockRejectedValue(new Error('nope'))
    renderModal({ onSend })

    fireEvent.change(screen.getByLabelText('To'), {
      target: { value: 'instructor-kate' },
    })
    fireEvent.change(screen.getByLabelText('Subject'), {
      target: { value: 'Keep me' },
    })
    fireEvent.change(screen.getByLabelText('Message'), {
      target: { value: 'And me' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Send' })).toBeEnabled(),
    )
    expect(screen.getByLabelText('Subject')).toHaveValue('Keep me')
    expect(onSend).toHaveBeenCalledOnce()
  })

  it('resets and closes from the footer Close button', () => {
    const onClose = vi.fn()
    renderModal({ onClose })

    fireEvent.change(screen.getByLabelText('Subject'), {
      target: { value: 'Draft' },
    })
    const closeButtons = screen.getAllByRole('button', { name: 'Close' })
    fireEvent.click(closeButtons[closeButtons.length - 1])

    expect(onClose).toHaveBeenCalled()
  })
})

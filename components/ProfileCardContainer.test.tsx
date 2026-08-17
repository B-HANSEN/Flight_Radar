import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import ProfileCardContainer from './ProfileCardContainer'
import { fetchApi } from '@/lib/api'
import enMessages from '@/messages/en.json'

vi.mock('@/lib/api', () => ({ fetchApi: vi.fn() }))

const baseProps = {
  name: 'Doe, John',
  email: 'john.doe@example.com',
  phone: '+34 600 123 456',
  birthday: '14 March 1994',
  info: 'PPL online · Q1 2025',
  role: 'Student',
  emergencyContact: {
    name: 'Jane Doe',
    relation: 'Sister',
    phone: '+34 600 987 654',
  },
}

function renderContainer() {
  return render(
    <NextIntlClientProvider locale='en' messages={enMessages}>
      <ProfileCardContainer {...baseProps} />
    </NextIntlClientProvider>,
  )
}

beforeEach(() => {
  vi.mocked(fetchApi).mockReset()
})

describe('ProfileCardContainer', () => {
  it('opens the emergency contact modal when the pencil icon is clicked', () => {
    renderContainer()

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Edit profile' }))
    expect(
      screen.getByRole('heading', { name: 'Edit emergency contact' }),
    ).toBeInTheDocument()
  })

  it('saves the edited contact via PUT and updates the displayed card', async () => {
    const updated = {
      name: 'John Smith',
      relation: 'Brother',
      phone: '+34 600 111 222',
    }
    vi.mocked(fetchApi).mockResolvedValue(updated)

    renderContainer()
    fireEvent.click(screen.getByRole('button', { name: 'Edit profile' }))
    fireEvent.change(screen.getByLabelText('Contact name'), {
      target: { value: 'John Smith' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
    expect(fetchApi).toHaveBeenCalledWith(
      '/emergency-contact',
      expect.objectContaining({ method: 'PUT' }),
    )

    fireEvent.click(screen.getByRole('tab', { name: 'Emergency' }))
    expect(screen.getByText('John Smith')).toBeInTheDocument()
  })

  it('closes the modal without saving when cancel is clicked', () => {
    renderContainer()

    fireEvent.click(screen.getByRole('button', { name: 'Edit profile' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(fetchApi).not.toHaveBeenCalled()
  })

  it('discards an unsaved edit left over from a cancelled previous open', () => {
    renderContainer()

    fireEvent.click(screen.getByRole('button', { name: 'Edit profile' }))
    fireEvent.change(screen.getByLabelText('Contact name'), {
      target: { value: 'Abandoned Edit' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    fireEvent.click(screen.getByRole('button', { name: 'Edit profile' }))
    expect(screen.getByLabelText('Contact name')).toHaveValue('Jane Doe')
  })

  it('opens the change password modal when the lock icon is clicked', () => {
    renderContainer()

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Lock profile' }))
    expect(
      screen.getByRole('heading', { name: 'Change password' }),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('clears the contact via DELETE and updates the displayed card', async () => {
    const cleared = { name: '', relation: '', phone: '' }
    vi.mocked(fetchApi).mockResolvedValue(cleared)

    renderContainer()
    fireEvent.click(screen.getByRole('button', { name: 'Edit profile' }))
    fireEvent.click(
      screen.getByRole('button', { name: 'Delete emergency contact' }),
    )

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
    expect(fetchApi).toHaveBeenCalledWith(
      '/emergency-contact',
      expect.objectContaining({ method: 'DELETE' }),
    )

    fireEvent.click(screen.getByRole('tab', { name: 'Emergency' }))
    expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument()
  })
})

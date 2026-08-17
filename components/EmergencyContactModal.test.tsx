import { fireEvent, render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import EmergencyContactModal from './EmergencyContactModal'
import type { EmergencyContact } from './ProfileCard'
import enMessages from '@/messages/en.json'

const contact: EmergencyContact = {
  name: 'Jane Doe',
  relation: 'Sister',
  phone: '+34 600 987 654',
}

function renderModal(
  props: Partial<React.ComponentProps<typeof EmergencyContactModal>> = {},
) {
  const onClose = props.onClose ?? vi.fn()
  const onSave = props.onSave ?? vi.fn()
  const onDelete = props.onDelete ?? vi.fn()
  render(
    <NextIntlClientProvider locale='en' messages={enMessages}>
      <EmergencyContactModal
        isOpen
        emergencyContact={contact}
        onClose={onClose}
        onSave={onSave}
        onDelete={onDelete}
        {...props}
      />
    </NextIntlClientProvider>,
  )
  return { onClose, onSave, onDelete }
}

describe('EmergencyContactModal', () => {
  it('renders nothing when closed', () => {
    renderModal({ isOpen: false })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('prefills the form fields from the emergency contact', () => {
    renderModal()

    expect(screen.getByLabelText('Contact name')).toHaveValue('Jane Doe')
    expect(screen.getByLabelText('Relation')).toHaveValue('Sister')
    expect(screen.getByLabelText('Contact phone')).toHaveValue(
      '+34 600 987 654',
    )
  })

  it('disables save when a required field is cleared, and re-enables once refilled', () => {
    renderModal()

    const nameInput = screen.getByLabelText('Contact name')
    const saveButton = screen.getByRole('button', { name: 'Save' })

    fireEvent.change(nameInput, { target: { value: '' } })
    expect(saveButton).toBeDisabled()

    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } })
    expect(saveButton).toBeEnabled()
  })

  it('saves trimmed field values', () => {
    const { onSave } = renderModal()

    fireEvent.change(screen.getByLabelText('Contact name'), {
      target: { value: '  Jane Doe  ' },
    })
    fireEvent.change(screen.getByLabelText('Relation'), {
      target: { value: '  Mother  ' },
    })
    fireEvent.change(screen.getByLabelText('Contact phone'), {
      target: { value: '  +34 600 111 999  ' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSave).toHaveBeenCalledWith<[EmergencyContact]>({
      name: 'Jane Doe',
      relation: 'Mother',
      phone: '+34 600 111 999',
    })
  })

  it('calls onClose when cancel is clicked', () => {
    const { onClose } = renderModal()
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onDelete when the delete button is clicked', () => {
    const { onDelete } = renderModal()
    fireEvent.click(
      screen.getByRole('button', { name: 'Delete emergency contact' }),
    )
    expect(onDelete).toHaveBeenCalledOnce()
  })
})

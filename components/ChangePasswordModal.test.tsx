import { fireEvent, render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import ChangePasswordModal from './ChangePasswordModal'
import enMessages from '@/messages/en.json'

function renderModal(
  props: Partial<React.ComponentProps<typeof ChangePasswordModal>> = {},
) {
  const onClose = props.onClose ?? vi.fn()
  render(
    <NextIntlClientProvider locale='en' messages={enMessages}>
      <ChangePasswordModal isOpen onClose={onClose} {...props} />
    </NextIntlClientProvider>,
  )
  return onClose
}

describe('ChangePasswordModal', () => {
  it('renders nothing when closed', () => {
    renderModal({ isOpen: false })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders the password fields disabled, with a save button that is also disabled', () => {
    renderModal()

    expect(screen.getByLabelText('Current password')).toBeDisabled()
    expect(screen.getByLabelText('New password')).toBeDisabled()
    expect(screen.getByLabelText('Confirm new password')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(
      screen.getByText('Password change is still under development.'),
    ).toBeInTheDocument()
  })

  it('calls onClose when close is clicked', () => {
    const onClose = renderModal()
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalledOnce()
  })
})

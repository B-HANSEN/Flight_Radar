import { fireEvent, render, screen } from '@testing-library/react'
import Modal from './Modal'

function renderModal(props: Partial<React.ComponentProps<typeof Modal>> = {}) {
  const onClose = props.onClose ?? vi.fn()
  render(
    <Modal
      isOpen
      onClose={onClose}
      title='Details'
      closeLabel='Close'
      {...props}
    >
      <p>Body</p>
    </Modal>,
  )
  return { onClose }
}

describe('Modal', () => {
  it('renders nothing when closed', () => {
    renderModal({ isOpen: false })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('labels the dialog with its title', () => {
    renderModal()
    expect(screen.getByRole('dialog', { name: 'Details' })).toBeInTheDocument()
  })

  it('closes on a backdrop click but not on a click inside the dialog', () => {
    const { onClose } = renderModal()
    const dialog = screen.getByRole('dialog')

    fireEvent.click(screen.getByText('Body'))
    fireEvent.click(dialog)
    expect(onClose).not.toHaveBeenCalled()

    fireEvent.click(dialog.parentElement as HTMLElement)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('closes via the close button', () => {
    const { onClose } = renderModal()
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalledOnce()
  })
})

import { fireEvent, render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import Toast from './Toast'
import enMessages from '@/messages/en.json'

function renderToast(props: Partial<React.ComponentProps<typeof Toast>> = {}) {
  const onClose = props.onClose ?? vi.fn()
  return {
    onClose,
    ...render(
      <NextIntlClientProvider locale='en' messages={enMessages}>
        <Toast message='Fetching…' open onClose={onClose} {...props} />
      </NextIntlClientProvider>,
    ),
  }
}

describe('Toast', () => {
  it('renders nothing when closed', () => {
    const { container } = renderToast({ open: false })

    expect(container.firstChild).toBeNull()
  })

  it('shows the message in a polite status region when open', () => {
    renderToast()

    expect(screen.getByRole('status')).toHaveTextContent('Fetching…')
  })

  it('calls onClose after the auto-dismiss duration elapses', () => {
    vi.useFakeTimers()
    const { onClose } = renderToast({ durationMs: 3000 })

    expect(onClose).not.toHaveBeenCalled()
    vi.advanceTimersByTime(3000)
    expect(onClose).toHaveBeenCalledOnce()

    vi.useRealTimers()
  })

  it('calls onClose when the dismiss button is clicked', () => {
    vi.useFakeTimers()
    const { onClose } = renderToast()

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(onClose).toHaveBeenCalledOnce()

    vi.useRealTimers()
  })

  it('shows a spinning loader by default', () => {
    const { container } = renderToast()

    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('shows a checkmark instead of a spinner for the success variant', () => {
    const { container } = renderToast({ variant: 'success' })

    expect(container.querySelector('.animate-spin')).not.toBeInTheDocument()
  })

  it('shows an alert icon instead of a spinner for the error variant', () => {
    const { container } = renderToast({ variant: 'error' })

    expect(container.querySelector('.animate-spin')).not.toBeInTheDocument()
    expect(container.querySelector('.text-red-300')).toBeInTheDocument()
  })
})

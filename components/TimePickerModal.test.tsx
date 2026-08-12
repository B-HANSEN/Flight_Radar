import { fireEvent, render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import TimePickerModal from './TimePickerModal'
import enMessages from '@/messages/en.json'

function renderPicker(
  props: Partial<React.ComponentProps<typeof TimePickerModal>> = {},
) {
  const onCancel = props.onCancel ?? vi.fn()
  const onConfirm = props.onConfirm ?? vi.fn()
  render(
    <NextIntlClientProvider locale='en' messages={enMessages}>
      <TimePickerModal
        isOpen
        initialTime='08:00'
        onCancel={onCancel}
        onConfirm={onConfirm}
        {...props}
      />
    </NextIntlClientProvider>,
  )
  return { onCancel, onConfirm }
}

describe('TimePickerModal', () => {
  it('renders nothing when closed', () => {
    renderPicker({ isOpen: false })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('initializes the header from the initial time', () => {
    renderPicker({ initialTime: '08:00' })
    expect(screen.getByRole('button', { name: '08' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '00' })).toBeInTheDocument()
  })

  it('picks an outer-ring hour, advances to minutes, and confirms', () => {
    const { onConfirm } = renderPicker()

    fireEvent.click(screen.getByRole('button', { name: "9 o'clock" }))
    expect(screen.getByRole('button', { name: '09' })).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: "9 o'clock" }),
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '45 minutes' }))
    fireEvent.click(screen.getByRole('button', { name: 'OK' }))

    expect(onConfirm).toHaveBeenCalledWith('09:45')
  })

  it('picks an inner-ring hour (13-23, 00) and confirms', () => {
    const { onConfirm } = renderPicker({ initialTime: '00:00' })

    fireEvent.click(screen.getByRole('button', { name: "13 o'clock" }))
    fireEvent.click(screen.getByRole('button', { name: '30 minutes' }))
    fireEvent.click(screen.getByRole('button', { name: 'OK' }))

    expect(onConfirm).toHaveBeenCalledWith('13:30')
  })

  it('jumps back to the hour dial by clicking the header hour segment', () => {
    renderPicker()

    fireEvent.click(screen.getByRole('button', { name: "9 o'clock" }))
    expect(
      screen.queryByRole('button', { name: "9 o'clock" }),
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '09' }))

    expect(
      screen.getByRole('button', { name: "9 o'clock" }),
    ).toBeInTheDocument()
  })

  it('jumps to the minute dial by clicking the header minute segment', () => {
    renderPicker()

    expect(
      screen.queryByRole('button', { name: '0 minutes' }),
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '00' }))

    expect(
      screen.getByRole('button', { name: '0 minutes' }),
    ).toBeInTheDocument()
  })

  it('wraps Tab focus from the last to the first focusable element', () => {
    renderPicker()

    const okButton = screen.getByRole('button', { name: 'OK' })
    const hourHeaderButton = screen.getByRole('button', { name: '08' })
    okButton.focus()

    fireEvent.keyDown(document, { key: 'Tab' })

    expect(document.activeElement).toBe(hourHeaderButton)
  })

  it('wraps Shift+Tab focus from the first to the last focusable element', () => {
    renderPicker()

    const okButton = screen.getByRole('button', { name: 'OK' })
    const hourHeaderButton = screen.getByRole('button', { name: '08' })
    hourHeaderButton.focus()

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })

    expect(document.activeElement).toBe(okButton)
  })

  it('discards the pick when cancelled', () => {
    const { onCancel, onConfirm } = renderPicker()

    fireEvent.click(screen.getByRole('button', { name: "9 o'clock" }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onCancel).toHaveBeenCalledOnce()
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('cancels on Escape', () => {
    const { onCancel } = renderPicker()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('initializes fresh from a new initial time when remounted with a new key', () => {
    // The parent forces a remount (via a changing `key`) whenever a different
    // time field opens the picker, so state only needs to initialize on mount.
    const { rerender } = render(
      <NextIntlClientProvider locale='en' messages={enMessages}>
        <TimePickerModal
          key='start'
          isOpen
          initialTime='08:00'
          onCancel={vi.fn()}
          onConfirm={vi.fn()}
        />
      </NextIntlClientProvider>,
    )

    rerender(
      <NextIntlClientProvider locale='en' messages={enMessages}>
        <TimePickerModal
          key='end'
          isOpen
          initialTime='14:20'
          onCancel={vi.fn()}
          onConfirm={vi.fn()}
        />
      </NextIntlClientProvider>,
    )

    expect(screen.getByRole('button', { name: '14' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '20' })).toBeInTheDocument()
  })
})

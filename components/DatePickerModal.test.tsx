import { fireEvent, render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import DatePickerModal from './DatePickerModal'
import enMessages from '@/messages/en.json'

const dayLabelFormatter = new Intl.DateTimeFormat('en', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})
const monthLabelFormatter = new Intl.DateTimeFormat('en', {
  month: 'long',
  year: 'numeric',
})

function dayLabel(date: Date) {
  return dayLabelFormatter.format(date)
}

function monthLabel(date: Date) {
  return monthLabelFormatter.format(date)
}

function formatDMY(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}/${date.getFullYear()}`
}

const today = new Date()
// Pinned to the 15th so month arithmetic never overflows into a different month.
const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 15)
const monthAfterNext = new Date(today.getFullYear(), today.getMonth() + 2, 15)

function renderPicker(
  props: Partial<React.ComponentProps<typeof DatePickerModal>> = {},
) {
  const onCancel = props.onCancel ?? vi.fn()
  const onConfirm = props.onConfirm ?? vi.fn()
  render(
    <NextIntlClientProvider locale='en' messages={enMessages}>
      <DatePickerModal
        isOpen
        initialDate=''
        onCancel={onCancel}
        onConfirm={onConfirm}
        {...props}
      />
    </NextIntlClientProvider>,
  )
  return { onCancel, onConfirm }
}

describe('DatePickerModal', () => {
  it('renders nothing when closed', () => {
    renderPicker({ isOpen: false })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('initializes the selected day and month from the initial date', () => {
    renderPicker({ initialDate: formatDMY(nextMonth) })

    expect(screen.getByText(monthLabel(nextMonth))).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: dayLabel(nextMonth) }),
    ).toHaveAttribute('aria-pressed', 'true')
  })

  it('falls back to today when the initial date is empty or unparsable', () => {
    renderPicker({ initialDate: '' })
    expect(screen.getByText(monthLabel(today))).toBeInTheDocument()
  })

  it('selects a different day and confirms it as dd/mm/yyyy', () => {
    const target = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 20)
    const { onConfirm } = renderPicker({ initialDate: formatDMY(nextMonth) })

    fireEvent.click(screen.getByRole('button', { name: dayLabel(target) }))
    fireEvent.click(screen.getByRole('button', { name: 'OK' }))

    expect(onConfirm).toHaveBeenCalledWith(formatDMY(target))
  })

  it('navigates to the next and previous month, staying within range', () => {
    renderPicker({ initialDate: formatDMY(nextMonth) })

    fireEvent.click(screen.getByRole('button', { name: 'Next month' }))
    expect(screen.getByText(monthLabel(monthAfterNext))).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Previous month' }))
    fireEvent.click(screen.getByRole('button', { name: 'Previous month' }))
    expect(screen.getByText(monthLabel(today))).toBeInTheDocument()
  })

  it('disables navigating before the current month or past 6 months ahead', () => {
    renderPicker({ initialDate: '' })

    expect(
      screen.getByRole('button', { name: 'Previous month' }),
    ).toBeDisabled()

    for (let i = 0; i < 6; i++) {
      fireEvent.click(screen.getByRole('button', { name: 'Next month' }))
    }

    expect(screen.getByRole('button', { name: 'Next month' })).toBeDisabled()
  })

  it('wraps Tab focus from the last to the first focusable element', () => {
    renderPicker({ initialDate: formatDMY(nextMonth) })

    const okButton = screen.getByRole('button', { name: 'OK' })
    const prevMonthButton = screen.getByRole('button', {
      name: 'Previous month',
    })
    okButton.focus()

    fireEvent.keyDown(document, { key: 'Tab' })

    expect(document.activeElement).toBe(prevMonthButton)
  })

  it('wraps Shift+Tab focus from the first to the last focusable element', () => {
    renderPicker({ initialDate: formatDMY(nextMonth) })

    const okButton = screen.getByRole('button', { name: 'OK' })
    const prevMonthButton = screen.getByRole('button', {
      name: 'Previous month',
    })
    prevMonthButton.focus()

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })

    expect(document.activeElement).toBe(okButton)
  })

  it('discards the pick when cancelled', () => {
    const { onCancel, onConfirm } = renderPicker()

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onCancel).toHaveBeenCalledOnce()
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('cancels on Escape', () => {
    const { onCancel } = renderPicker()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('initializes fresh from a new initial date when remounted with a new key', () => {
    const { rerender } = render(
      <NextIntlClientProvider locale='en' messages={enMessages}>
        <DatePickerModal
          key='on'
          isOpen
          initialDate={formatDMY(nextMonth)}
          onCancel={vi.fn()}
          onConfirm={vi.fn()}
        />
      </NextIntlClientProvider>,
    )

    rerender(
      <NextIntlClientProvider locale='en' messages={enMessages}>
        <DatePickerModal
          key='from'
          isOpen
          initialDate={formatDMY(monthAfterNext)}
          onCancel={vi.fn()}
          onConfirm={vi.fn()}
        />
      </NextIntlClientProvider>,
    )

    expect(screen.getByText(monthLabel(monthAfterNext))).toBeInTheDocument()
  })
})

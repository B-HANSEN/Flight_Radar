import { fireEvent, render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import AvailabilityFormModal from './AvailabilityFormModal'
import type { AvailabilityFormValues } from './Availability.types'
import enMessages from '@/messages/en.json'

function formatDMY(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}/${date.getFullYear()}`
}

const today = new Date()
const inTwoWeeks = new Date(today)
inTwoWeeks.setDate(inTwoWeeks.getDate() + 14)
const inThreeWeeks = new Date(today)
inThreeWeeks.setDate(inThreeWeeks.getDate() + 21)
const sevenMonthsAhead = new Date(
  today.getFullYear(),
  today.getMonth() + 7,
  today.getDate(),
)

function renderModal(
  props: Partial<React.ComponentProps<typeof AvailabilityFormModal>> = {},
) {
  const onClose = props.onClose ?? vi.fn()
  const onSave = props.onSave ?? vi.fn()
  render(
    <NextIntlClientProvider locale='en' messages={enMessages}>
      <AvailabilityFormModal
        isOpen
        onClose={onClose}
        onSave={onSave}
        {...props}
      />
    </NextIntlClientProvider>,
  )
  return { onClose, onSave }
}

function pickTime(hourLabel: string, minuteLabel: string) {
  fireEvent.click(screen.getByRole('button', { name: hourLabel }))
  fireEvent.click(screen.getByRole('button', { name: minuteLabel }))
  fireEvent.click(screen.getByRole('button', { name: 'OK' }))
}

describe('AvailabilityFormModal', () => {
  it('renders nothing when closed', () => {
    renderModal({ isOpen: false })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('saves an "all the time" / "all day" availability entry by default', () => {
    const { onSave } = renderModal()

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSave).toHaveBeenCalledWith<[AvailabilityFormValues]>({
      date: { mode: 'all' },
      time: { mode: 'allDay' },
    })
  })

  it('disables save until a specific date is filled in', () => {
    renderModal()

    fireEvent.click(screen.getByRole('radio', { name: /^On/ }))

    const saveButton = screen.getByRole('button', { name: 'Save' })
    expect(saveButton).toBeDisabled()

    fireEvent.change(screen.getByLabelText('Date'), {
      target: { value: formatDMY(inTwoWeeks) },
    })

    expect(saveButton).toBeEnabled()
  })

  it('rejects a badly formatted date (no separators) and shows an error', () => {
    renderModal()

    fireEvent.click(screen.getByRole('radio', { name: /^On/ }))
    fireEvent.change(screen.getByLabelText('Date'), {
      target: { value: '22042026' },
    })

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(screen.getByLabelText('Date')).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    expect(
      screen.getByText(
        'Enter a valid date (dd/mm/yyyy) within the next 6 months.',
      ),
    ).toBeInTheDocument()
  })

  it('rejects a calendar-impossible date', () => {
    renderModal()

    fireEvent.click(screen.getByRole('radio', { name: /^On/ }))
    fireEvent.change(screen.getByLabelText('Date'), {
      target: { value: '31/04/2026' },
    })

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })

  it('rejects a date more than 6 months ahead', () => {
    renderModal()

    fireEvent.click(screen.getByRole('radio', { name: /^On/ }))
    fireEvent.change(screen.getByLabelText('Date'), {
      target: { value: formatDMY(sevenMonthsAhead) },
    })

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })

  it('selects the "On" radio when its date field receives focus, without clicking the radio first', () => {
    renderModal()

    const onRadio = screen.getByRole('radio', { name: /^On/ })
    expect(onRadio).not.toBeChecked()

    fireEvent.focus(screen.getByLabelText('Date'))

    expect(onRadio).toBeChecked()
  })

  it('selects the "From" radio when opening its calendar picker, without clicking the radio first', () => {
    renderModal()

    const rangeRadio = screen.getByRole('radio', { name: /^From/ })
    expect(rangeRadio).not.toBeChecked()

    fireEvent.click(
      screen.getByRole('button', { name: 'Open calendar for From date' }),
    )

    expect(rangeRadio).toBeChecked()
    expect(
      screen.getByRole('dialog', { name: 'Select date' }),
    ).toBeInTheDocument()
  })

  it('selects the "Between" radio when a time trigger receives focus', () => {
    renderModal()

    const betweenRadio = screen.getByRole('radio', { name: /^Between/ })
    expect(betweenRadio).not.toBeChecked()

    fireEvent.focus(screen.getByRole('button', { name: /Start time: 08:00/ }))

    expect(betweenRadio).toBeChecked()
  })

  it('saves a date range selection', () => {
    const { onSave } = renderModal()

    fireEvent.click(screen.getByRole('radio', { name: /^From/ }))
    fireEvent.change(screen.getByLabelText('From date'), {
      target: { value: formatDMY(inTwoWeeks) },
    })
    fireEvent.change(screen.getByLabelText('To date'), {
      target: { value: formatDMY(inThreeWeeks) },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSave).toHaveBeenCalledWith<[AvailabilityFormValues]>({
      date: {
        mode: 'range',
        from: formatDMY(inTwoWeeks),
        to: formatDMY(inThreeWeeks),
      },
      time: { mode: 'allDay' },
    })
  })

  it('picks a specific date through the calendar picker', () => {
    const { onSave } = renderModal()

    fireEvent.click(screen.getByRole('radio', { name: /^On/ }))
    fireEvent.click(
      screen.getByRole('button', { name: 'Open calendar for Date' }),
    )
    expect(
      screen.getByRole('dialog', { name: 'Select date' }),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Next month' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(
      screen.queryByRole('dialog', { name: 'Select date' }),
    ).not.toBeInTheDocument()
    expect(screen.getByLabelText('Date')).toHaveValue('')

    fireEvent.click(
      screen.getByRole('button', { name: 'Open calendar for Date' }),
    )
    fireEvent.click(screen.getByRole('button', { name: 'OK' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSave).toHaveBeenCalledWith<[AvailabilityFormValues]>({
      date: expect.objectContaining({ mode: 'on' }),
      time: { mode: 'allDay' },
    })
  })

  it('picks a between-time range through the time-picker dial', () => {
    const { onSave } = renderModal()

    fireEvent.click(screen.getByRole('radio', { name: /^Between/ }))

    fireEvent.click(screen.getByRole('button', { name: /Start time: 08:00/ }))
    expect(
      screen.getByRole('dialog', { name: 'Select time' }),
    ).toBeInTheDocument()
    pickTime("9 o'clock", '0 minutes')
    expect(
      screen.queryByRole('dialog', { name: 'Select time' }),
    ).not.toBeInTheDocument()
    expect(screen.getByText('09:00')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /End time: 10:00/ }))
    pickTime("17 o'clock", '0 minutes')
    expect(screen.getByText('17:00')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSave).toHaveBeenCalledWith<[AvailabilityFormValues]>({
      date: { mode: 'all' },
      time: { mode: 'between', start: '09:00', end: '17:00' },
    })
  })

  it('rejects an end time that is before the start time', () => {
    const { onSave } = renderModal()

    fireEvent.click(screen.getByRole('radio', { name: /^Between/ }))

    fireEvent.click(screen.getByRole('button', { name: /Start time: 08:00/ }))
    pickTime("17 o'clock", '0 minutes')

    fireEvent.click(screen.getByRole('button', { name: /End time: 10:00/ }))
    pickTime("9 o'clock", '0 minutes')

    const saveButton = screen.getByRole('button', { name: 'Save' })
    expect(saveButton).toBeDisabled()
    expect(
      screen.getByText('End time must be after the start time.'),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /End time: 09:00/ }))
    pickTime("18 o'clock", '0 minutes')

    expect(saveButton).toBeEnabled()
    fireEvent.click(saveButton)

    expect(onSave).toHaveBeenCalledWith<[AvailabilityFormValues]>({
      date: { mode: 'all' },
      time: { mode: 'between', start: '17:00', end: '18:00' },
    })
  })

  it('discards the pick and keeps the previous time when the picker is cancelled', () => {
    renderModal()

    fireEvent.click(screen.getByRole('radio', { name: /^Between/ }))
    fireEvent.click(screen.getByRole('button', { name: /Start time: 08:00/ }))
    fireEvent.click(screen.getByRole('button', { name: "9 o'clock" }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(
      screen.queryByRole('dialog', { name: 'Select time' }),
    ).not.toBeInTheDocument()
    expect(screen.getByText('08:00')).toBeInTheDocument()
  })

  it('does not close the availability modal when Escape is pressed while the time picker is open', () => {
    const { onClose } = renderModal()

    fireEvent.click(screen.getByRole('radio', { name: /^Between/ }))
    fireEvent.click(screen.getByRole('button', { name: /Start time: 08:00/ }))
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onClose).not.toHaveBeenCalled()
    expect(
      screen.queryByRole('dialog', { name: 'Select time' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('dialog', { name: 'Student Availability' }),
    ).toBeInTheDocument()
  })

  it('does not close the availability modal when Escape is pressed while the date picker is open', () => {
    const { onClose } = renderModal()

    fireEvent.click(screen.getByRole('radio', { name: /^On/ }))
    fireEvent.click(
      screen.getByRole('button', { name: 'Open calendar for Date' }),
    )
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onClose).not.toHaveBeenCalled()
    expect(
      screen.queryByRole('dialog', { name: 'Select date' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('dialog', { name: 'Student Availability' }),
    ).toBeInTheDocument()
  })

  it('switches selections back to their defaults and saves the default values', () => {
    const { onSave } = renderModal()

    fireEvent.click(screen.getByRole('radio', { name: /^On/ }))
    fireEvent.click(screen.getByRole('radio', { name: /^Between/ }))

    fireEvent.click(screen.getByRole('radio', { name: 'All the time' }))
    fireEvent.click(screen.getByRole('radio', { name: 'All day' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSave).toHaveBeenCalledWith<[AvailabilityFormValues]>({
      date: { mode: 'all' },
      time: { mode: 'allDay' },
    })
  })

  it('resets the form and calls onClose when closed', () => {
    const { onClose } = renderModal()

    fireEvent.click(screen.getByRole('radio', { name: /^On/ }))
    const closeButtons = screen.getAllByRole('button', { name: 'Close' })
    fireEvent.click(closeButtons[closeButtons.length - 1])

    expect(onClose).toHaveBeenCalledOnce()
  })
})

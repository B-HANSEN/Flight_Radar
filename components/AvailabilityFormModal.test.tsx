import { fireEvent, render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import AvailabilityFormModal from './AvailabilityFormModal'
import type { AvailabilityFormValues, Weekday } from './Availability.types'
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

const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]
const WEEKDAY_CODES: Weekday[] = [
  'sun',
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
]

function weekdayNameOf(date: Date): string {
  return WEEKDAY_NAMES[date.getDay()]
}
function weekdayCodeOf(name: string): Weekday {
  return WEEKDAY_CODES[WEEKDAY_NAMES.indexOf(name)]
}

// A 4-day span, far enough out to stay inside the 6-month picker window.
const narrowRangeStart = new Date(today)
narrowRangeStart.setDate(narrowRangeStart.getDate() + 7)
const narrowRangeEnd = new Date(narrowRangeStart)
narrowRangeEnd.setDate(narrowRangeEnd.getDate() + 3)

const namesInNarrowRange: string[] = []
for (
  let d = new Date(narrowRangeStart);
  d <= narrowRangeEnd;
  d.setDate(d.getDate() + 1)
) {
  namesInNarrowRange.push(weekdayNameOf(d))
}
const namesOutsideNarrowRange = WEEKDAY_NAMES.filter(
  (name) => !namesInNarrowRange.includes(name),
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

  it('defaults to the date range mode with all-day time, disabled until dates are filled in', () => {
    const { onSave } = renderModal()

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()

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
      recurrence: { mode: 'everyday' },
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

    fireEvent.click(screen.getByRole('radio', { name: /^On/ }))
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
      recurrence: { mode: 'everyday' },
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
      recurrence: { mode: 'everyday' },
    })
  })

  it('picks a between-time range through the time-picker dial', () => {
    const { onSave } = renderModal()

    fireEvent.change(screen.getByLabelText('From date'), {
      target: { value: formatDMY(inTwoWeeks) },
    })
    fireEvent.change(screen.getByLabelText('To date'), {
      target: { value: formatDMY(inThreeWeeks) },
    })

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
      date: {
        mode: 'range',
        from: formatDMY(inTwoWeeks),
        to: formatDMY(inThreeWeeks),
      },
      time: { mode: 'between', start: '09:00', end: '17:00' },
      recurrence: { mode: 'everyday' },
    })
  })

  it('rejects an end time that is before the start time', () => {
    const { onSave } = renderModal()

    fireEvent.change(screen.getByLabelText('From date'), {
      target: { value: formatDMY(inTwoWeeks) },
    })
    fireEvent.change(screen.getByLabelText('To date'), {
      target: { value: formatDMY(inThreeWeeks) },
    })

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
      date: {
        mode: 'range',
        from: formatDMY(inTwoWeeks),
        to: formatDMY(inThreeWeeks),
      },
      time: { mode: 'between', start: '17:00', end: '18:00' },
      recurrence: { mode: 'everyday' },
    })
  })

  it('saves a "these days" recurrence selection', () => {
    const { onSave } = renderModal()

    fireEvent.change(screen.getByLabelText('From date'), {
      target: { value: formatDMY(inTwoWeeks) },
    })
    fireEvent.change(screen.getByLabelText('To date'), {
      target: { value: formatDMY(inThreeWeeks) },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Monday' }))
    fireEvent.click(screen.getByRole('button', { name: 'Wednesday' }))

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSave).toHaveBeenCalledWith<[AvailabilityFormValues]>({
      date: {
        mode: 'range',
        from: formatDMY(inTwoWeeks),
        to: formatDMY(inThreeWeeks),
      },
      time: { mode: 'allDay' },
      recurrence: { mode: 'days', days: ['mon', 'wed'] },
    })
  })

  it('saves selected weekdays in natural order regardless of click order', () => {
    const { onSave } = renderModal()

    fireEvent.change(screen.getByLabelText('From date'), {
      target: { value: formatDMY(inTwoWeeks) },
    })
    fireEvent.change(screen.getByLabelText('To date'), {
      target: { value: formatDMY(inThreeWeeks) },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Friday' }))
    fireEvent.click(screen.getByRole('button', { name: 'Monday' }))
    fireEvent.click(screen.getByRole('button', { name: 'Wednesday' }))

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSave).toHaveBeenCalledWith<[AvailabilityFormValues]>({
      date: {
        mode: 'range',
        from: formatDMY(inTwoWeeks),
        to: formatDMY(inThreeWeeks),
      },
      time: { mode: 'allDay' },
      recurrence: { mode: 'days', days: ['mon', 'wed', 'fri'] },
    })
  })

  it('collapses to "everyday" when all seven weekdays are selected', () => {
    const { onSave } = renderModal()

    fireEvent.change(screen.getByLabelText('From date'), {
      target: { value: formatDMY(inTwoWeeks) },
    })
    fireEvent.change(screen.getByLabelText('To date'), {
      target: { value: formatDMY(inThreeWeeks) },
    })

    for (const day of [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ]) {
      fireEvent.click(screen.getByRole('button', { name: day }))
    }

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSave).toHaveBeenCalledWith<[AvailabilityFormValues]>({
      date: {
        mode: 'range',
        from: formatDMY(inTwoWeeks),
        to: formatDMY(inThreeWeeks),
      },
      time: { mode: 'allDay' },
      recurrence: { mode: 'everyday' },
    })
  })

  it('disables weekday buttons that fall outside the selected date range', () => {
    renderModal()

    fireEvent.change(screen.getByLabelText('From date'), {
      target: { value: formatDMY(narrowRangeStart) },
    })
    fireEvent.change(screen.getByLabelText('To date'), {
      target: { value: formatDMY(narrowRangeEnd) },
    })

    for (const name of namesInNarrowRange) {
      expect(screen.getByRole('button', { name })).toBeEnabled()
    }
    for (const name of namesOutsideNarrowRange) {
      expect(screen.getByRole('button', { name })).toBeDisabled()
    }
  })

  it('drops a selected weekday from the save payload once the date range narrows past it', () => {
    const { onSave } = renderModal()

    // Wide range first, so every weekday is selectable.
    fireEvent.change(screen.getByLabelText('From date'), {
      target: { value: formatDMY(inTwoWeeks) },
    })
    fireEvent.change(screen.getByLabelText('To date'), {
      target: { value: formatDMY(inThreeWeeks) },
    })

    const keptDay = namesInNarrowRange[0]
    const droppedDay = namesOutsideNarrowRange[0]
    fireEvent.click(screen.getByRole('button', { name: keptDay }))
    fireEvent.click(screen.getByRole('button', { name: droppedDay }))

    // Narrowing the range now excludes droppedDay.
    fireEvent.change(screen.getByLabelText('From date'), {
      target: { value: formatDMY(narrowRangeStart) },
    })
    fireEvent.change(screen.getByLabelText('To date'), {
      target: { value: formatDMY(narrowRangeEnd) },
    })

    expect(screen.getByRole('button', { name: droppedDay })).toBeDisabled()
    expect(screen.getByRole('button', { name: droppedDay })).toHaveAttribute(
      'aria-pressed',
      'false',
    )

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSave).toHaveBeenCalledWith<[AvailabilityFormValues]>({
      date: {
        mode: 'range',
        from: formatDMY(narrowRangeStart),
        to: formatDMY(narrowRangeEnd),
      },
      time: { mode: 'allDay' },
      recurrence: {
        mode: 'days',
        days: [weekdayCodeOf(keptDay)],
      },
    })
  })

  it('toggles a weekday off when clicked again', () => {
    renderModal()

    const mondayButton = screen.getByRole('button', { name: 'Monday' })
    fireEvent.click(mondayButton)
    expect(mondayButton).toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(mondayButton)
    expect(mondayButton).toHaveAttribute('aria-pressed', 'false')
  })

  it('selects the "These days" radio when a weekday is clicked, without clicking the radio first', () => {
    renderModal()

    const theseDaysRadio = screen.getByRole('radio', { name: /^These days/ })
    expect(theseDaysRadio).not.toBeChecked()

    fireEvent.click(screen.getByRole('button', { name: 'Tuesday' }))

    expect(theseDaysRadio).toBeChecked()
  })

  it('disables save until at least one weekday is selected for "these days"', () => {
    renderModal()

    fireEvent.change(screen.getByLabelText('From date'), {
      target: { value: formatDMY(inTwoWeeks) },
    })
    fireEvent.change(screen.getByLabelText('To date'), {
      target: { value: formatDMY(inThreeWeeks) },
    })

    fireEvent.click(screen.getByRole('radio', { name: /^These days/ }))

    const saveButton = screen.getByRole('button', { name: 'Save' })
    expect(saveButton).toBeDisabled()
    expect(screen.getByText('Select at least one day.')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Friday' }))
    expect(saveButton).toBeEnabled()
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
    fireEvent.click(screen.getByRole('button', { name: 'Monday' }))

    fireEvent.click(screen.getByRole('radio', { name: /^From/ }))
    fireEvent.click(screen.getByRole('radio', { name: 'All day' }))
    fireEvent.click(screen.getByRole('radio', { name: 'Everyday' }))

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
      recurrence: { mode: 'everyday' },
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

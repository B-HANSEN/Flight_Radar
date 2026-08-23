import { fireEvent, render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import ScheduleFlightModal from './ScheduleFlightModal'
import {
  DUMMY_SCHEDULE_FLIGHT_AIRCRAFT,
  DUMMY_SCHEDULE_FLIGHT_TARGET,
} from './ScheduleFlightModal.data'
import enMessages from '@/messages/en.json'

function renderModal(
  props: Partial<React.ComponentProps<typeof ScheduleFlightModal>> = {},
) {
  return render(
    <NextIntlClientProvider locale='en' messages={enMessages}>
      <ScheduleFlightModal
        target={DUMMY_SCHEDULE_FLIGHT_TARGET}
        instructorName='James Whitfield'
        aircraft={DUMMY_SCHEDULE_FLIGHT_AIRCRAFT}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        {...props}
      />
    </NextIntlClientProvider>,
  )
}

function pickTime(hourLabel: string, minuteLabel: string) {
  fireEvent.click(screen.getByRole('button', { name: hourLabel }))
  fireEvent.click(screen.getByRole('button', { name: minuteLabel }))
  fireEvent.click(screen.getByRole('button', { name: 'OK' }))
}

describe('ScheduleFlightModal', () => {
  it('renders nothing when there is no scheduling target', () => {
    renderModal({ target: null })

    expect(
      screen.queryByRole('dialog', { name: 'Schedule a flight' }),
    ).not.toBeInTheDocument()
  })

  it('shows the instructor label, student and day for the target, with the full window pre-filled', () => {
    renderModal()

    expect(screen.getByText('Instructor · James Whitfield')).toBeInTheDocument()
    expect(screen.getByText('Alex Moreau')).toBeInTheDocument()
    expect(screen.getByText('Mon 24 Aug')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Start time: 09:00' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'End time: 11:00' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Student is available 09:00 – 11:00'),
    ).toBeInTheDocument()
  })

  it('only shows tail numbers for the selected aircraft type', () => {
    renderModal()

    expect(
      screen.queryByText('Tail number', { exact: false }),
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Cessna 152' }))
    expect(screen.getByRole('button', { name: 'EC-DKN' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'EC-ERV' })).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'EC-JTJ' }),
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Cessna 172' }))
    expect(screen.getByRole('button', { name: 'EC-JTJ' })).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'EC-DKN' }),
    ).not.toBeInTheDocument()
  })

  it('lets the instructor narrow the booked time within the available window', () => {
    renderModal()

    fireEvent.click(screen.getByRole('button', { name: 'Start time: 09:00' }))
    expect(
      screen.getByRole('dialog', { name: 'Select time' }),
    ).toBeInTheDocument()
    pickTime("9 o'clock", '30 minutes')
    expect(
      screen.getByRole('button', { name: 'Start time: 09:30' }),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'End time: 11:00' }))
    pickTime("11 o'clock", '0 minutes')
    expect(
      screen.getByRole('button', { name: 'End time: 11:00' }),
    ).toBeInTheDocument()
  })

  it('rejects an end time outside the available window and disables confirm', () => {
    renderModal()

    fireEvent.click(screen.getByRole('button', { name: 'Cessna 152' }))
    fireEvent.click(screen.getByRole('button', { name: 'EC-DKN' }))
    fireEvent.click(screen.getByRole('button', { name: 'Dual instruction' }))

    fireEvent.click(screen.getByRole('button', { name: 'End time: 11:00' }))
    pickTime("12 o'clock", '0 minutes')

    expect(
      screen.getByText(
        "End time must be after start time and within the student's available window",
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Confirm lesson' }),
    ).toBeDisabled()
  })

  it('keeps confirm disabled until aircraft and lesson type are picked', () => {
    renderModal()
    const confirmButton = screen.getByRole('button', {
      name: 'Confirm lesson',
    })
    expect(confirmButton).toBeDisabled()
    expect(
      screen.getByText('Pick a time, an aircraft and a lesson type'),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Cessna 172' }))
    fireEvent.click(screen.getByRole('button', { name: 'EC-JOB' }))
    expect(confirmButton).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: 'Solo supervised' }))
    expect(confirmButton).toBeEnabled()
    expect(
      screen.getByText(
        'Alex Moreau · EC-JOB · Solo supervised · 09:00 – 11:00',
      ),
    ).toBeInTheDocument()
  })

  it('calls onConfirm with the student, narrowed time, aircraft and lesson type', () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined)
    renderModal({ onConfirm })

    fireEvent.click(screen.getByRole('button', { name: 'Start time: 09:00' }))
    pickTime("9 o'clock", '30 minutes')
    fireEvent.click(screen.getByRole('button', { name: 'End time: 11:00' }))
    pickTime("11 o'clock", '0 minutes')

    fireEvent.click(screen.getByRole('button', { name: 'Cessna 152' }))
    fireEvent.click(screen.getByRole('button', { name: 'EC-DKN' }))
    fireEvent.click(screen.getByRole('button', { name: 'Dual instruction' }))
    fireEvent.change(screen.getByLabelText('Comments'), {
      target: { value: 'Cover steep turns' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Confirm lesson' }))

    expect(onConfirm).toHaveBeenCalledWith({
      studentId: 'student-1',
      aircraftId: 'ec-dkn',
      date: '2026-08-24',
      startTime: '09:30',
      endTime: '11:00',
      lessonType: 'Dual instruction',
      comments: 'Cover steep turns',
    })
  })

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn()
    renderModal({ onClose })

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalled()
  })
})

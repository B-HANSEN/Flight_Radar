import { fireEvent, render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import ScheduleBoard from './ScheduleBoard'
import type {
  ScheduleAircraft,
  ScheduleBlockRecord,
} from './ScheduleBoard.types'
import enMessages from '@/messages/en.json'

const AIRCRAFT: ScheduleAircraft[] = [
  {
    id: 'ec-erv',
    arcid: 'EC-ERV',
    type: 'Cessna 152',
    photoSrc: '/aircraft/cessna-152.webp',
  },
  { id: 'ec-exl', arcid: 'EC-EXL', type: 'Cessna 152' },
]

const DAY_BLOCKS: ScheduleBlockRecord[] = [
  {
    id: 'b1',
    aircraftId: 'ec-erv',
    label: 'Reserved 09:00–12:00',
    kind: 'reserved',
    start: 9,
    end: 12,
  },
]

const WEEK_BLOCKS: ScheduleBlockRecord[] = [
  {
    id: 'w1',
    aircraftId: 'ec-erv',
    label: 'Scheduled maintenance',
    kind: 'maintenance',
    start: 9 / 24,
    end: 10.5 / 24,
  },
]

function renderBoard(
  props: Partial<React.ComponentProps<typeof ScheduleBoard>> = {},
) {
  return render(
    <NextIntlClientProvider locale='en' messages={enMessages}>
      <ScheduleBoard
        aircraft={AIRCRAFT}
        dayBlocks={DAY_BLOCKS}
        weekBlocks={WEEK_BLOCKS}
        initialDate={new Date(2026, 7, 9)}
        {...props}
      />
    </NextIntlClientProvider>,
  )
}

describe('ScheduleBoard', () => {
  it('shows an empty-state message when there is no aircraft', () => {
    renderBoard({ aircraft: [] })

    expect(screen.getByText('No aircraft to show.')).toBeInTheDocument()
  })

  it('renders the day view by default with aircraft rows and reservation blocks', () => {
    renderBoard()

    expect(screen.getByText('Sunday, Aug 9, 2026')).toBeInTheDocument()
    expect(screen.getByText('EC-ERV')).toBeInTheDocument()
    expect(screen.getByText('EC-EXL')).toBeInTheDocument()
    expect(screen.getByText('Reserved 09:00–12:00')).toBeInTheDocument()
  })

  it('switches to the week view, showing week blocks and the week range label', () => {
    renderBoard()

    fireEvent.click(screen.getByRole('button', { name: 'Week' }))

    expect(screen.getByText('03 – 09 Aug 2026')).toBeInTheDocument()
    expect(screen.getByText('Scheduled maintenance')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Week' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('steps the date range backward and forward in day view', () => {
    renderBoard()

    fireEvent.click(screen.getByRole('button', { name: 'Previous' }))
    expect(screen.getByText('Saturday, Aug 8, 2026')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByText('Monday, Aug 10, 2026')).toBeInTheDocument()
  })

  it('jumps back to the current date when the Today button is clicked', () => {
    renderBoard()

    const todayButton = screen.getByRole('button', { name: 'Today' })
    expect(todayButton).toBeEnabled()

    fireEvent.click(todayButton)

    // Once the board is showing the current date there is nowhere to jump to.
    expect(todayButton).toBeDisabled()
  })

  it('calls onRefresh when the refresh button is clicked', () => {
    const onRefresh = vi.fn()
    renderBoard({ onRefresh })

    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }))

    expect(onRefresh).toHaveBeenCalledOnce()
  })

  it('falls back to a placeholder photo for aircraft without a photoSrc', () => {
    const { container } = renderBoard()

    const images = Array.from(container.querySelectorAll('img'))
    expect(images.some((img) => img.src.includes('aircraft-placeholder'))).toBe(
      true,
    )
  })

  it('opens a detail modal with the time, aircraft and label when a day-view block is clicked', () => {
    renderBoard()

    fireEvent.click(screen.getByText('Reserved 09:00–12:00'))

    expect(screen.getByText('Schedule details')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Sunday, Aug 9, 2026 · 09:00 – 12:00 · EC-ERV · Cessna 152',
      ),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByText('Schedule details')).not.toBeInTheDocument()
  })

  it('opens a detail modal with the weekday and time when a week-view block is clicked', () => {
    renderBoard()

    fireEvent.click(screen.getByRole('button', { name: 'Week' }))
    fireEvent.click(screen.getByText('Scheduled maintenance'))

    expect(
      screen.getByText('Monday, Aug 3 · 09:00 – 10:30 · EC-ERV · Cessna 152'),
    ).toBeInTheDocument()
  })

  it('only shows a dated block on the day it was booked for', () => {
    renderBoard({
      dayBlocks: [
        ...DAY_BLOCKS,
        {
          id: 'booking-1',
          aircraftId: 'ec-erv',
          label: 'Dual instruction · Alex Moreau',
          kind: 'reserved',
          start: 13,
          end: 14.5,
          date: '2026-08-10',
        },
      ],
    })

    expect(
      screen.queryByText('Dual instruction · Alex Moreau'),
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Next' }))

    expect(
      screen.getByText('Dual instruction · Alex Moreau'),
    ).toBeInTheDocument()
  })

  it('shows the student and instructor names in the detail modal for a booking block', () => {
    renderBoard({
      dayBlocks: [
        {
          id: 'booking-1',
          aircraftId: 'ec-erv',
          label: 'Dual instruction · Alex Moreau',
          kind: 'reserved',
          start: 13,
          end: 14.5,
          date: '2026-08-09',
          studentName: 'Alex Moreau',
          instructorName: 'James Whitfield',
        },
      ],
    })

    fireEvent.click(screen.getByText('Dual instruction · Alex Moreau'))

    expect(screen.getByText('Student')).toBeInTheDocument()
    expect(screen.getByText('Alex Moreau')).toBeInTheDocument()
    expect(screen.getByText('Instructor')).toBeInTheDocument()
    expect(screen.getByText('James Whitfield')).toBeInTheDocument()
  })

  it('filters the aircraft rows by type', () => {
    renderBoard({
      aircraft: [
        ...AIRCRAFT,
        { id: 'ec-kop', arcid: 'EC-KOP', type: 'Cessna 172' },
      ],
    })

    expect(screen.getByText('EC-KOP')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Cessna 152' }))

    expect(screen.queryByText('EC-KOP')).not.toBeInTheDocument()
    expect(screen.getByText('EC-ERV')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'All types' }))
    expect(screen.getByText('EC-KOP')).toBeInTheDocument()
  })

  it('has no type filter when every aircraft shares one type', () => {
    renderBoard()

    expect(
      screen.queryByRole('button', { name: 'All types' }),
    ).not.toBeInTheDocument()
  })

  it('only shows a dated week block within the currently viewed week', () => {
    renderBoard({
      weekBlocks: [
        ...WEEK_BLOCKS,
        {
          id: 'booking-1',
          aircraftId: 'ec-erv',
          label: 'Dual instruction · Alex Moreau',
          kind: 'reserved',
          start: 2 + 13 / 24,
          end: 2 + 14.5 / 24,
          date: '2026-08-12',
        },
      ],
    })

    fireEvent.click(screen.getByRole('button', { name: 'Week' }))
    expect(
      screen.queryByText('Dual instruction · Alex Moreau'),
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(
      screen.getByText('Dual instruction · Alex Moreau'),
    ).toBeInTheDocument()
  })
})

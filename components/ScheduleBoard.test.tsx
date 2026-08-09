import { fireEvent, render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import ScheduleBoard from './ScheduleBoard'
import type { ScheduleAircraft, ScheduleRow } from './ScheduleBoard.types'
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

const DAY_ROWS: ScheduleRow[] = [
  {
    aircraftId: 'ec-erv',
    blocks: [
      {
        id: 'b1',
        label: 'Reserved 09:00–12:00',
        kind: 'reserved',
        start: 9,
        end: 12,
      },
    ],
  },
]

const WEEK_ROWS: ScheduleRow[] = [
  {
    aircraftId: 'ec-erv',
    blocks: [
      {
        id: 'w1',
        label: 'Scheduled maintenance',
        kind: 'maintenance',
        start: 0,
        end: 1.5,
      },
    ],
  },
]

function renderBoard(
  props: Partial<React.ComponentProps<typeof ScheduleBoard>> = {},
) {
  return render(
    <NextIntlClientProvider locale='en' messages={enMessages}>
      <ScheduleBoard
        aircraft={AIRCRAFT}
        dayRows={DAY_ROWS}
        weekRows={WEEK_ROWS}
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
})

import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import BookingDetailModal from './BookingDetailModal'
import type { BookingEvent } from './AgendaCalendar.types'
import enMessages from '@/messages/en.json'

function renderModal(
  props: Partial<React.ComponentProps<typeof BookingDetailModal>>,
) {
  return render(
    <NextIntlClientProvider locale='en' messages={enMessages}>
      <BookingDetailModal event={null} onClose={() => {}} {...props} />
    </NextIntlClientProvider>,
  )
}

const FLIGHT: BookingEvent = {
  id: 'b1',
  type: 'booking',
  date: '2026-08-07',
  time: '13:10 - 15:20',
  tailNumber: 'EC-ERV',
  instructorName: 'Kate Ashford',
  studentName: 'Jamie Torres',
  lessonType: 'Checkride prep',
  trainingCode: 'VBD15',
}

const THEORY: BookingEvent = {
  id: 'b2',
  type: 'booking',
  date: '2026-08-16',
  time: '18:00 - 19:30',
  instructorName: 'James Whitfield',
  studentName: 'Jamie Torres',
  lessonType: 'Theory',
  comments: 'Navigation theory — map reading and drift',
}

it('renders nothing when there is no event', () => {
  renderModal({ event: null })
  expect(screen.queryByText('Booking details')).not.toBeInTheDocument()
})

it('shows the flight briefing checklist and the instructor for a student', () => {
  renderModal({ event: FLIGHT })
  expect(
    screen.getByText(/VBD15 · Final check before first solo/),
  ).toBeInTheDocument()
  expect(screen.getByText(/airfield arrival procedures/i)).toBeInTheDocument()
  expect(screen.getByText(/Kate Ashford/)).toBeInTheDocument()
})

it('shows the student instead of the instructor in the instructor perspective', () => {
  renderModal({ event: FLIGHT, perspective: 'instructor' })
  expect(screen.getByText(/Jamie Torres/)).toBeInTheDocument()
})

it('shows the blurb and the time for a Theory lesson', () => {
  renderModal({ event: THEORY })
  expect(screen.getByText('Booking details')).toBeInTheDocument()
  expect(screen.getByText(/navigation theory/i)).toBeInTheDocument()
  expect(screen.getByText(/18:00 - 19:30/)).toBeInTheDocument()
})

it('falls back to the comment when a flight code is unknown', () => {
  renderModal({
    event: {
      ...FLIGHT,
      trainingCode: undefined,
      comments: 'weather rebooking',
    },
  })
  expect(screen.getAllByText(/weather rebooking/).length).toBeGreaterThan(0)
})

it('marks a cancelled booking', () => {
  renderModal({ event: { ...FLIGHT, cancelled: true } })
  expect(screen.getByText('Cancelled')).toBeInTheDocument()
})

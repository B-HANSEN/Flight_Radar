import { fireEvent, render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import AgendaCalendar from './AgendaCalendar'
import { DUMMY_AGENDA_EVENTS } from './AgendaCalendar.data'
import type { CalendarEvent } from './AgendaCalendar.types'
import enMessages from '@/messages/en.json'

const mockRouterRefresh = vi.fn()
vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ refresh: mockRouterRefresh }),
}))

const EVENTS: CalendarEvent[] = [
  {
    id: 'flight-1',
    type: 'booking',
    date: '2026-08-07',
    time: '13:10 - 15:20',
    tailNumber: 'EC-ERV',
    instructorName: 'Kate Ashford',
    studentName: 'Jamie Torres',
    lessonType: 'Checkride prep',
    trainingCode: 'VBD15',
  },
  {
    id: 'theory-1',
    type: 'booking',
    date: '2026-08-12',
    time: '18:00 - 19:30',
    instructorName: 'James Whitfield',
    studentName: 'Jamie Torres',
    lessonType: 'Theory',
    comments: 'Navigation theory — map reading and drift',
  },
  {
    id: 'gap-1',
    type: 'unavailability',
    date: '2026-08-14',
    allDay: true,
  },
]

function renderCalendar(
  props: Partial<React.ComponentProps<typeof AgendaCalendar>> = {},
) {
  return render(
    <NextIntlClientProvider locale='en' messages={enMessages}>
      <AgendaCalendar
        events={EVENTS}
        initialMonth={{ year: 2026, month: 7 }}
        {...props}
      />
    </NextIntlClientProvider>,
  )
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  vi.setSystemTime(new Date(2026, 7, 15))
})

afterEach(() => {
  vi.useRealTimers()
})

it('shows the time, topic and Theory label for a Theory lesson', () => {
  renderCalendar()
  expect(screen.getByText('Theory')).toBeInTheDocument()
  expect(screen.getByText('18:00 - 19:30')).toBeInTheDocument()
  expect(
    screen.getByText('Navigation theory — map reading and drift'),
  ).toBeInTheDocument()
})

it('gives Theory lessons a distinct (green) background tone', () => {
  renderCalendar()
  const theoryCard = screen
    .getByText('Navigation theory — map reading and drift')
    .closest('button')
  expect(theoryCard).toHaveClass('bg-green-100')
})

it('shows the flight short label and, for a student, the instructor name', () => {
  renderCalendar()
  expect(
    screen.getByText(/VBD15 · Final check before first solo/),
  ).toBeInTheDocument()
  expect(screen.getByText('Kate Ashford')).toBeInTheDocument()
})

it('shows the student name instead in the instructor perspective', () => {
  renderCalendar({ perspective: 'instructor' })
  expect(screen.getAllByText('Jamie Torres').length).toBeGreaterThan(0)
  expect(screen.queryByText('Kate Ashford')).not.toBeInTheDocument()
})

it('renders derived unavailability blocks', () => {
  renderCalendar()
  expect(screen.getAllByText('Not available').length).toBeGreaterThan(0)
})

it('opens the detail modal when a booking is clicked', () => {
  renderCalendar()
  fireEvent.click(screen.getByText(/VBD15 · Final check before first solo/))
  expect(screen.getByRole('dialog')).toBeInTheDocument()
  expect(screen.getByText(/airfield arrival procedures/i)).toBeInTheDocument()
})

it('shows cancelled bookings (labelled) by default and hides them via the toggle', () => {
  renderCalendar({
    events: [
      {
        id: 'cx',
        type: 'booking',
        date: '2026-08-20',
        time: '09:00 - 10:00',
        tailNumber: 'EC-FED',
        instructorName: 'Kate Ashford',
        studentName: 'Jamie Torres',
        lessonType: 'Dual instruction',
        trainingCode: 'VBD03',
        cancelled: true,
      },
    ],
  })
  expect(screen.getByText(/VBD03 · Circuit consolidation/)).toBeInTheDocument()
  expect(screen.getByText('Cancelled')).toBeInTheDocument()

  fireEvent.click(screen.getByLabelText('Hide cancelations'))
  expect(screen.queryByText(/VBD03/)).not.toBeInTheDocument()
})

it('navigates between months and back with the This month button', () => {
  renderCalendar()
  expect(screen.getByText('August 2026')).toBeInTheDocument()

  fireEvent.click(screen.getByLabelText('Next month'))
  expect(screen.getByText('September 2026')).toBeInTheDocument()

  fireEvent.click(screen.getByLabelText('Previous month'))
  expect(screen.getByText('August 2026')).toBeInTheDocument()

  fireEvent.click(screen.getByLabelText('Next month'))
  fireEvent.click(screen.getByRole('button', { name: 'This month' }))
  expect(screen.getByText('August 2026')).toBeInTheDocument()
})

it('disables the This month button when already on the current month', () => {
  renderCalendar()
  expect(screen.getByRole('button', { name: 'This month' })).toBeDisabled()
  fireEvent.click(screen.getByLabelText('Next month'))
  expect(screen.getByRole('button', { name: 'This month' })).toBeEnabled()
})

it('re-fetches the agenda (router.refresh) and calls onRefresh on Refresh', () => {
  mockRouterRefresh.mockClear()
  const onRefresh = vi.fn()
  renderCalendar({ onRefresh })
  fireEvent.click(screen.getByLabelText('Refresh'))
  expect(mockRouterRefresh).toHaveBeenCalledOnce()
  expect(onRefresh).toHaveBeenCalled()
  expect(screen.getByText('Fetching…')).toBeInTheDocument()
})

it('shows a last-updated time when given one', () => {
  renderCalendar({ updatedAt: '2026-08-15T09:30:00.000Z' })
  expect(screen.getByText(/^Updated /)).toBeInTheDocument()
})

it('renders the shared dummy fixture without crashing', () => {
  renderCalendar({ events: DUMMY_AGENDA_EVENTS })
  expect(screen.getByText('August 2026')).toBeInTheDocument()
})

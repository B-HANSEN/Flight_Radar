import { fireEvent, render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import InstructorAvailability from './InstructorAvailability'
import {
  DUMMY_INSTRUCTOR_NAMES,
  DUMMY_INSTRUCTOR_TIME_OFF,
  DUMMY_REVIEW_QUEUE,
} from './InstructorAvailability.data'
import { fetchApi } from '@/lib/api'
import enMessages from '@/messages/en.json'

vi.mock('@/lib/api', () => ({ fetchApi: vi.fn() }))

function renderView(
  props: Partial<React.ComponentProps<typeof InstructorAvailability>> = {},
) {
  return render(
    <NextIntlClientProvider locale='en' messages={enMessages}>
      <InstructorAvailability
        entries={DUMMY_INSTRUCTOR_TIME_OFF}
        instructorId='instructor-1'
        instructorNames={DUMMY_INSTRUCTOR_NAMES}
        {...props}
      />
    </NextIntlClientProvider>,
  )
}

beforeEach(() => {
  vi.mocked(fetchApi).mockReset()
  vi.useFakeTimers({ shouldAdvanceTime: true })
  vi.setSystemTime(new Date(2026, 7, 15)) // 15 Aug 2026
})

afterEach(() => {
  vi.useRealTimers()
})

describe('InstructorAvailability', () => {
  it('lists each day off with its type and status', () => {
    renderView()

    expect(screen.getByText('Medical renewal in Madrid')).toBeInTheDocument()
    expect(screen.getAllByText('Approved')).toHaveLength(2)
    expect(screen.getByText('Pending CFI approval')).toBeInTheDocument()
    expect(screen.getAllByText('Personal leave').length).toBeGreaterThan(0)
    expect(screen.getByText('Regular day off')).toBeInTheDocument()
  })

  it('explains the 2-day weekly auto-approval up top', () => {
    renderView()

    expect(
      screen.getByText(/Up to 2 days off per calendar week are approved/),
    ).toBeInTheDocument()
  })

  it('shows a placeholder when there are no days off', () => {
    renderView({ entries: [] })

    expect(screen.getByText('No days off requested yet.')).toBeInTheDocument()
  })

  it('groups the days off by ISO calendar week with a per-week count', () => {
    renderView()

    // 15 + 17 Sep 2026 share ISO week 38; 1 Oct 2026 is week 40.
    expect(screen.getByText('Week 38')).toBeInTheDocument()
    expect(screen.getByText('2 days off')).toBeInTheDocument()
    expect(screen.getByText('Week 40')).toBeInTheDocument()
    expect(screen.getByText('1 day off')).toBeInTheDocument()
  })

  it('requests a regular day off and adds it to the list', async () => {
    vi.mocked(fetchApi).mockResolvedValueOnce({
      id: 'ito-new',
      instructorId: 'instructor-1',
      date: '2026-08-27',
      type: 'regular',
      status: 'approved',
    })

    renderView({ entries: [] })

    fireEvent.click(screen.getByRole('button', { name: 'Request a day off' }))
    fireEvent.change(screen.getByLabelText('Date'), {
      target: { value: '27/08/2026' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Submit request' }))

    expect(await screen.findByText('Day off added')).toBeInTheDocument()
    expect(fetchApi).toHaveBeenCalledWith('/instructor-time-off', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instructorId: 'instructor-1',
        date: '2026-08-27',
        type: 'regular',
      }),
      cache: 'no-store',
    })
    expect(
      screen.queryByText('No days off requested yet.'),
    ).not.toBeInTheDocument()
  })

  it('tells the instructor when a personal-leave request goes to the CFI', async () => {
    vi.mocked(fetchApi).mockResolvedValueOnce({
      id: 'ito-new',
      instructorId: 'instructor-1',
      date: '2026-08-27',
      type: 'personal',
      status: 'pending',
      reason: 'Trip',
    })

    renderView({ entries: [] })

    fireEvent.click(screen.getByRole('button', { name: 'Request a day off' }))
    fireEvent.change(screen.getByLabelText('Date'), {
      target: { value: '27/08/2026' },
    })
    fireEvent.click(screen.getByRole('radio', { name: 'Personal leave' }))
    fireEvent.change(screen.getByLabelText('Reason for personal leave'), {
      target: { value: 'Trip' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Submit request' }))

    expect(
      await screen.findByText('Request sent to the CFI for approval'),
    ).toBeInTheDocument()
  })

  it('cancels a day off', async () => {
    vi.mocked(fetchApi).mockResolvedValueOnce(undefined)

    renderView()

    const cancelButtons = screen.getAllByRole('button', {
      name: /^Cancel day off on/,
    })
    fireEvent.click(cancelButtons[0])

    expect(await screen.findByText('Day off cancelled')).toBeInTheDocument()
    expect(fetchApi).toHaveBeenCalledWith('/instructor-time-off/ito-1', {
      method: 'DELETE',
      cache: 'no-store',
    })
  })

  it('hides the review section for a non-chief instructor', () => {
    renderView({ reviewQueue: DUMMY_REVIEW_QUEUE, isChief: false })

    expect(
      screen.queryByText('Leave requests to review'),
    ).not.toBeInTheDocument()
  })

  it('lets the CFI approve another instructor’s pending request', async () => {
    vi.mocked(fetchApi).mockResolvedValueOnce(undefined)

    renderView({ reviewQueue: DUMMY_REVIEW_QUEUE, isChief: true })

    expect(screen.getByText('Leave requests to review')).toBeInTheDocument()
    // Two of Kate's requests fall in week 38.
    expect(screen.getByText('2 requests')).toBeInTheDocument()
    expect(screen.getByText("Daughter's graduation")).toBeInTheDocument()

    fireEvent.click(
      screen.getAllByRole('button', { name: /^Approve Kate Ashford/ })[0],
    )

    expect(await screen.findByText('Leave approved')).toBeInTheDocument()
    expect(fetchApi).toHaveBeenCalledWith('/instructor-time-off/ito-9', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'approved' }),
      cache: 'no-store',
    })
    expect(screen.queryByText("Daughter's graduation")).not.toBeInTheDocument()
  })

  it('lets the CFI deny a pending request', async () => {
    vi.mocked(fetchApi).mockResolvedValueOnce(undefined)

    renderView({ reviewQueue: DUMMY_REVIEW_QUEUE, isChief: true })

    fireEvent.click(
      screen.getAllByRole('button', { name: /^Deny Kate Ashford/ })[0],
    )

    expect(await screen.findByText('Leave denied')).toBeInTheDocument()
    expect(fetchApi).toHaveBeenCalledWith('/instructor-time-off/ito-9', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'denied' }),
      cache: 'no-store',
    })
  })

  it('shows an error toast when a cancel request fails', async () => {
    vi.mocked(fetchApi).mockRejectedValueOnce(new Error('network'))

    renderView()

    const cancelButtons = screen.getAllByRole('button', {
      name: /^Cancel day off on/,
    })
    fireEvent.click(cancelButtons[0])

    expect(
      await screen.findByText('Something went wrong. Please try again.'),
    ).toBeInTheDocument()
    // The row is kept when the delete fails.
    expect(screen.getByText('Medical renewal in Madrid')).toBeInTheDocument()
  })

  it('keeps the CFI’s own request out of the review queue', () => {
    renderView({
      reviewQueue: [
        ...DUMMY_REVIEW_QUEUE,
        {
          id: 'ito-self',
          instructorId: 'instructor-1',
          date: '2026-09-30',
          type: 'personal',
          status: 'pending',
          reason: 'Mine',
        },
      ],
      isChief: true,
    })

    expect(screen.queryByText('Mine')).not.toBeInTheDocument()
  })
})

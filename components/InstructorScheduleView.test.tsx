import { fireEvent, render, screen, within } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import InstructorScheduleView from './InstructorScheduleView'
import {
  DUMMY_SCHEDULE_REFERENCE_DATE,
  DUMMY_STUDENT_SCHEDULES,
} from './InstructorScheduleView.data'
import {
  DUMMY_SCHEDULE_FLIGHT_AIRCRAFT,
  DUMMY_SCHEDULE_FLIGHT_INSTRUCTORS,
} from './ScheduleFlightModal.data'
import { fetchApi } from '@/lib/api'
import enMessages from '@/messages/en.json'

vi.mock('@/lib/api', () => ({ fetchApi: vi.fn() }))

function renderView(
  props: Partial<React.ComponentProps<typeof InstructorScheduleView>> = {},
) {
  return render(
    <NextIntlClientProvider locale='en' messages={enMessages}>
      <InstructorScheduleView
        instructorName='James Whitfield'
        currentInstructorId='instructor-1'
        instructors={DUMMY_SCHEDULE_FLIGHT_INSTRUCTORS}
        students={DUMMY_STUDENT_SCHEDULES}
        aircraft={DUMMY_SCHEDULE_FLIGHT_AIRCRAFT}
        referenceDate={DUMMY_SCHEDULE_REFERENCE_DATE}
        {...props}
      />
    </NextIntlClientProvider>,
  )
}

beforeEach(() => {
  vi.mocked(fetchApi).mockReset().mockResolvedValue([])
})

describe('InstructorScheduleView', () => {
  it('shows the week label and range for the reference date', () => {
    renderView()

    expect(screen.getByText('Week of Aug 24')).toBeInTheDocument()
    expect(screen.getByText('24 – 30 August 2026')).toBeInTheDocument()
  })

  it("formats each student's slots that fall within the visible week", () => {
    renderView()

    const toggle = screen.getByRole('button', { name: /Alex Moreau/ })
    fireEvent.click(toggle)
    const panel = toggle.closest('li') as HTMLElement

    expect(within(panel).getByText('Mon 24')).toBeInTheDocument()
    expect(within(panel).getByText('09:00 - 11:00')).toBeInTheDocument()
  })

  it('excludes slots that fall outside the visible week', () => {
    renderView({
      students: [
        {
          id: 'student-9',
          name: 'Sam Delgado',
          course: 'PPL',
          slots: [
            {
              id: 'a',
              date: '2026-08-25',
              startTime: '09:00',
              endTime: '10:00',
            },
            {
              id: 'b',
              date: '2026-09-05',
              startTime: '09:00',
              endTime: '10:00',
            },
          ],
        },
      ],
    })

    fireEvent.click(screen.getByRole('button', { name: /Sam Delgado/ }))
    expect(screen.getByText('1 open slot')).toBeInTheDocument()
  })

  it('moves to the next and previous week when the nav buttons are clicked', () => {
    renderView()

    fireEvent.click(screen.getByRole('button', { name: 'Next week' }))
    expect(screen.getByText('Week of Aug 31')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Previous week' }))
    fireEvent.click(screen.getByRole('button', { name: 'Previous week' }))
    expect(screen.getByText('Week of Aug 17')).toBeInTheDocument()
  })

  it('renders the empty state when there are no students', () => {
    renderView({ students: [] })
    expect(screen.getByText('No students yet')).toBeInTheDocument()
  })

  it('opens the schedule-flight modal for the clicked student and slot', () => {
    renderView()

    fireEvent.click(screen.getByRole('button', { name: /Alex Moreau/ }))
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Schedule a flight with Alex Moreau on Mon 24 at 09:00 - 11:00',
      }),
    )

    expect(
      screen.getByRole('dialog', { name: 'Schedule a flight' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Mon 24 Aug')).toBeInTheDocument()
  })

  it('books the flight, refetches the schedule, and shows a success toast', async () => {
    const refreshedSchedules = DUMMY_STUDENT_SCHEDULES.map((student) =>
      student.id === 'student-1'
        ? { ...student, slots: student.slots.slice(1) }
        : student,
    )
    vi.mocked(fetchApi).mockImplementation(async (path) => {
      if (path === '/bookings') return { id: 'booking-1' }
      if (path === '/students/schedule') return refreshedSchedules
      return []
    })
    renderView()

    fireEvent.click(screen.getByRole('button', { name: /Alex Moreau/ }))
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Schedule a flight with Alex Moreau on Mon 24 at 09:00 - 11:00',
      }),
    )

    fireEvent.click(screen.getByRole('button', { name: 'Cessna 152' }))
    fireEvent.click(screen.getByRole('button', { name: 'EC-DKN' }))
    fireEvent.click(screen.getByRole('button', { name: 'Dual instruction' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirm lesson' }))

    expect(await screen.findByText('Flight scheduled')).toBeInTheDocument()
    expect(fetchApi).toHaveBeenCalledWith('/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: 'student-1',
        aircraftId: 'ec-dkn',
        instructorId: 'instructor-1',
        date: '2026-08-24',
        startTime: '09:00',
        endTime: '11:00',
        lessonType: 'Dual instruction',
        comments: '',
      }),
      cache: 'no-store',
    })
    expect(fetchApi).toHaveBeenCalledWith('/students/schedule', {
      cache: 'no-store',
    })
    expect(
      screen.queryByRole('dialog', { name: 'Schedule a flight' }),
    ).not.toBeInTheDocument()

    const panel = screen.getByText('Alex Moreau').closest('li') as HTMLElement
    expect(within(panel).queryByText('Mon 24')).not.toBeInTheDocument()
    expect(within(panel).getByText('Wed 26')).toBeInTheDocument()
  })

  it('still treats the booking as successful when only the post-booking refetch fails', async () => {
    vi.mocked(fetchApi).mockImplementation(async (path) => {
      if (path === '/bookings') return { id: 'booking-1' }
      if (path === '/students/schedule') throw new Error('network error')
      return []
    })
    renderView()

    fireEvent.click(screen.getByRole('button', { name: /Alex Moreau/ }))
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Schedule a flight with Alex Moreau on Mon 24 at 09:00 - 11:00',
      }),
    )

    fireEvent.click(screen.getByRole('button', { name: 'Cessna 152' }))
    fireEvent.click(screen.getByRole('button', { name: 'EC-DKN' }))
    fireEvent.click(screen.getByRole('button', { name: 'Dual instruction' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirm lesson' }))

    expect(await screen.findByText('Flight scheduled')).toBeInTheDocument()
    expect(
      screen.queryByText("Couldn't schedule the flight. Try again."),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('dialog', { name: 'Schedule a flight' }),
    ).not.toBeInTheDocument()
  })
})

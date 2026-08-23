import { fireEvent, render, screen, within } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import InstructorScheduleView from './InstructorScheduleView'
import {
  DUMMY_SCHEDULE_REFERENCE_DATE,
  DUMMY_STUDENT_SCHEDULES,
} from './InstructorScheduleView.data'
import enMessages from '@/messages/en.json'

function renderView(
  props: Partial<React.ComponentProps<typeof InstructorScheduleView>> = {},
) {
  return render(
    <NextIntlClientProvider locale='en' messages={enMessages}>
      <InstructorScheduleView
        instructorName='James Whitfield'
        students={DUMMY_STUDENT_SCHEDULES}
        referenceDate={DUMMY_SCHEDULE_REFERENCE_DATE}
        {...props}
      />
    </NextIntlClientProvider>,
  )
}

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

  it('shows a coming-soon toast when a schedule button is clicked', () => {
    renderView()

    fireEvent.click(screen.getByRole('button', { name: /Alex Moreau/ }))
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Schedule a flight with Alex Moreau on Mon 24 at 09:00 - 11:00',
      }),
    )

    expect(
      screen.getByText('Scheduling flights is still under development'),
    ).toBeInTheDocument()
  })
})

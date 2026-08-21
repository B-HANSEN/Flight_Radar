import { fireEvent, render, screen, within } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import InstructorScheduleList from './InstructorScheduleList'
import { DUMMY_INSTRUCTOR_STUDENTS } from './InstructorScheduleList.data'
import enMessages from '@/messages/en.json'

function renderList(
  props: Partial<React.ComponentProps<typeof InstructorScheduleList>> = {},
) {
  return render(
    <NextIntlClientProvider locale='en' messages={enMessages}>
      <InstructorScheduleList
        weekLabel='Week of Aug 24'
        weekRangeLabel='24 – 30 August'
        students={DUMMY_INSTRUCTOR_STUDENTS}
        {...props}
      />
    </NextIntlClientProvider>,
  )
}

describe('InstructorScheduleList', () => {
  it('renders the section heading and, when given, the instructor label', () => {
    renderList({ instructorName: 'D. Fabri' })

    expect(
      screen.getByRole('region', { name: 'Schedule a flight' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Instructor · D. Fabri')).toBeInTheDocument()
  })

  it('omits the instructor label when no instructor name is given', () => {
    renderList()

    expect(screen.queryByText(/^Instructor/)).not.toBeInTheDocument()
  })

  it('renders the empty state when there are no students', () => {
    renderList({ students: [] })

    expect(screen.getByText('No students yet')).toBeInTheDocument()
  })

  it('shows the open-slots count, pluralized, per student', () => {
    renderList()

    const jamieRow = screen
      .getByRole('button', { name: /Jamie Torres/ })
      .closest('li') as HTMLElement
    expect(within(jamieRow).getByText('3 open slots')).toBeInTheDocument()

    const priyaRow = screen
      .getByRole('button', { name: /Priya Shah/ })
      .closest('li') as HTMLElement
    expect(within(priyaRow).getByText('1 open slot')).toBeInTheDocument()
  })

  it('toggles a student panel open and closed, updating aria-expanded and slot visibility', () => {
    renderList()

    const toggle = screen.getByRole('button', { name: /Alex Moreau/ })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByText('Mon 24')).not.toBeVisible()

    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Mon 24')).toBeVisible()

    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByText('Mon 24')).not.toBeVisible()
  })

  it('shows a no-availability message when an expanded student has no slots', () => {
    renderList({
      students: [
        { id: 'student-9', name: 'Sam Delgado', course: 'PPL', slots: [] },
      ],
    })

    fireEvent.click(screen.getByRole('button', { name: /Sam Delgado/ }))
    expect(
      screen.getByText('No open availability this week'),
    ).toBeInTheDocument()
  })

  it('calls onSchedule with the student id and slot when a schedule button is clicked', () => {
    const onSchedule = vi.fn()
    renderList({ onSchedule })

    fireEvent.click(screen.getByRole('button', { name: /Alex Moreau/ }))
    const panel = screen.getByText('Mon 24').closest('div') as HTMLElement
    const scheduleButton = within(panel.parentElement as HTMLElement).getByRole(
      'button',
      { name: 'Schedule a flight with Alex Moreau on Mon 24 at 09:00 - 11:00' },
    )

    fireEvent.click(scheduleButton)

    expect(onSchedule).toHaveBeenCalledWith('student-1', {
      id: 'slot-1',
      day: 'Mon 24',
      time: '09:00 - 11:00',
    })
  })

  it('calls onPreviousWeek and onNextWeek when the nav buttons are clicked', () => {
    const onPreviousWeek = vi.fn()
    const onNextWeek = vi.fn()
    renderList({ onPreviousWeek, onNextWeek })

    fireEvent.click(screen.getByRole('button', { name: 'Previous week' }))
    fireEvent.click(screen.getByRole('button', { name: 'Next week' }))

    expect(onPreviousWeek).toHaveBeenCalledTimes(1)
    expect(onNextWeek).toHaveBeenCalledTimes(1)
  })
})

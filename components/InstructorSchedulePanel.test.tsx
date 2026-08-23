import { fireEvent, render, screen, within } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import InstructorSchedulePanel from './InstructorSchedulePanel'
import { DUMMY_INSTRUCTOR_STUDENTS } from './InstructorSchedulePanel.data'
import enMessages from '@/messages/en.json'

function renderPanel(
  props: Partial<React.ComponentProps<typeof InstructorSchedulePanel>> = {},
) {
  return render(
    <NextIntlClientProvider locale='en' messages={enMessages}>
      <InstructorSchedulePanel
        weekLabel='Week of Aug 24'
        weekRangeLabel='24 – 30 August'
        students={DUMMY_INSTRUCTOR_STUDENTS}
        {...props}
      />
    </NextIntlClientProvider>,
  )
}

describe('InstructorSchedulePanel', () => {
  it('renders the section heading and, when given, the instructor label', () => {
    renderPanel({ instructorName: 'James Whitfield' })

    expect(
      screen.getByRole('region', { name: 'Schedule a flight' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Instructor · James Whitfield')).toBeInTheDocument()
  })

  it('omits the instructor label when no instructor name is given', () => {
    renderPanel()

    expect(screen.queryByText(/^Instructor/)).not.toBeInTheDocument()
  })

  it('renders the empty state when there are no students', () => {
    renderPanel({ students: [] })

    expect(screen.getByText('No students yet')).toBeInTheDocument()
  })

  it('shows the open-slots count, pluralized, per student', () => {
    renderPanel()

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
    renderPanel()

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

  it('closes the previously open student panel when another one is opened', () => {
    renderPanel()

    const alexToggle = screen.getByRole('button', { name: /Alex Moreau/ })
    const jamieToggle = screen.getByRole('button', { name: /Jamie Torres/ })

    fireEvent.click(alexToggle)
    expect(alexToggle).toHaveAttribute('aria-expanded', 'true')

    fireEvent.click(jamieToggle)
    expect(jamieToggle).toHaveAttribute('aria-expanded', 'true')
    expect(alexToggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('shows a no-availability message when an expanded student has no slots', () => {
    renderPanel({
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
    renderPanel({ onSchedule })

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
    renderPanel({ onPreviousWeek, onNextWeek })

    fireEvent.click(screen.getByRole('button', { name: 'Previous week' }))
    fireEvent.click(screen.getByRole('button', { name: 'Next week' }))

    expect(onPreviousWeek).toHaveBeenCalledTimes(1)
    expect(onNextWeek).toHaveBeenCalledTimes(1)
  })
})

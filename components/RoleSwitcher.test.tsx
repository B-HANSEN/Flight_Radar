import type { ComponentProps } from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import RoleSwitcher from './RoleSwitcher'
import { DUMMY_INSTRUCTORS, DUMMY_STUDENTS } from './RoleSwitcher.data'
import enMessages from '@/messages/en.json'

const defaultProps: ComponentProps<typeof RoleSwitcher> = {
  instructors: DUMMY_INSTRUCTORS,
  students: DUMMY_STUDENTS,
}

function renderRoleSwitcher(props: Partial<typeof defaultProps> = {}) {
  const merged = { ...defaultProps, ...props }
  return render(
    <NextIntlClientProvider locale='en' messages={enMessages}>
      <RoleSwitcher {...merged} />
    </NextIntlClientProvider>,
  )
}

function getPanel() {
  return screen.getByText('Switch view').parentElement as HTMLElement
}

function studentRowName(student: (typeof DUMMY_STUDENTS)[number]) {
  return `${student.name} (${student.track} student)`
}

function instructorRowName(instructor: (typeof DUMMY_INSTRUCTORS)[number]) {
  return `${instructor.name} (Instructor)`
}

describe('RoleSwitcher', () => {
  it('shows the first instructor as the trigger label and keeps the menu closed by default', () => {
    renderRoleSwitcher()
    expect(
      screen.getByRole('button', { name: 'James Whitfield · Instructor' }),
    ).toBeInTheDocument()
    expect(screen.queryByText('Switch view')).not.toBeInTheDocument()
  })

  it('shows the selected student as the trigger label instead of an instructor', () => {
    renderRoleSwitcher({ selectedStudentId: DUMMY_STUDENTS[0].id })
    expect(
      screen.getByRole('button', { name: DUMMY_STUDENTS[0].name }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'James Whitfield · Instructor' }),
    ).not.toBeInTheDocument()
  })

  it('shows the selected instructor (not just the first) as the trigger label', () => {
    renderRoleSwitcher({ selectedInstructorId: DUMMY_INSTRUCTORS[1].id })
    expect(
      screen.getByRole('button', { name: 'Kate Ashford · Instructor' }),
    ).toBeInTheDocument()
  })

  it('opens the menu on click and lists every instructor plus every student', () => {
    renderRoleSwitcher()
    fireEvent.click(
      screen.getByRole('button', { name: 'James Whitfield · Instructor' }),
    )

    const panel = getPanel()
    DUMMY_INSTRUCTORS.forEach((instructor) => {
      expect(
        within(panel).getByText(instructorRowName(instructor)),
      ).toBeInTheDocument()
    })
    DUMMY_STUDENTS.forEach((student) => {
      expect(
        within(panel).getByText(studentRowName(student)),
      ).toBeInTheDocument()
    })
  })

  it('marks the active instructor row as current when no student is selected', () => {
    renderRoleSwitcher({ selectedStudentId: null })
    fireEvent.click(
      screen.getByRole('button', { name: 'James Whitfield · Instructor' }),
    )

    const panel = getPanel()
    expect(
      within(panel).getByRole('button', {
        name: instructorRowName(DUMMY_INSTRUCTORS[0]),
      }),
    ).toHaveAttribute('aria-current', 'true')
    expect(
      within(panel).getByRole('button', {
        name: instructorRowName(DUMMY_INSTRUCTORS[1]),
      }),
    ).not.toHaveAttribute('aria-current')
    expect(
      within(panel).getByRole('button', {
        name: studentRowName(DUMMY_STUDENTS[0]),
      }),
    ).not.toHaveAttribute('aria-current')
  })

  it('marks the selected student row as current', () => {
    renderRoleSwitcher({ selectedStudentId: DUMMY_STUDENTS[0].id })
    fireEvent.click(
      screen.getByRole('button', { name: DUMMY_STUDENTS[0].name }),
    )

    const panel = getPanel()
    expect(
      within(panel).getByRole('button', {
        name: studentRowName(DUMMY_STUDENTS[0]),
      }),
    ).toHaveAttribute('aria-current', 'true')
    expect(
      within(panel).getByRole('button', {
        name: instructorRowName(DUMMY_INSTRUCTORS[0]),
      }),
    ).not.toHaveAttribute('aria-current')
  })

  it('calls onSelectStudent and closes the menu when a student is picked', () => {
    const onSelectStudent = vi.fn()
    renderRoleSwitcher({ onSelectStudent })
    fireEvent.click(
      screen.getByRole('button', { name: 'James Whitfield · Instructor' }),
    )
    fireEvent.click(
      within(getPanel()).getByRole('button', {
        name: studentRowName(DUMMY_STUDENTS[1]),
      }),
    )

    expect(onSelectStudent).toHaveBeenCalledWith(DUMMY_STUDENTS[1])
    expect(screen.queryByText('Switch view')).not.toBeInTheDocument()
  })

  it('calls onSelectInstructor and closes the menu when an instructor row is picked', () => {
    const onSelectInstructor = vi.fn()
    renderRoleSwitcher({
      onSelectInstructor,
      selectedStudentId: DUMMY_STUDENTS[0].id,
    })
    fireEvent.click(
      screen.getByRole('button', { name: DUMMY_STUDENTS[0].name }),
    )
    fireEvent.click(
      within(getPanel()).getByRole('button', {
        name: instructorRowName(DUMMY_INSTRUCTORS[1]),
      }),
    )

    expect(onSelectInstructor).toHaveBeenCalledWith(DUMMY_INSTRUCTORS[1])
    expect(screen.queryByText('Switch view')).not.toBeInTheDocument()
  })

  it('toggles the menu closed on a second trigger click', () => {
    renderRoleSwitcher()
    const trigger = screen.getByRole('button', {
      name: 'James Whitfield · Instructor',
    })

    fireEvent.click(trigger)
    expect(screen.getByText('Switch view')).toBeInTheDocument()

    fireEvent.click(trigger)
    expect(screen.queryByText('Switch view')).not.toBeInTheDocument()
  })

  it('closes the menu when Escape is pressed and returns focus to the trigger', () => {
    renderRoleSwitcher()
    const trigger = screen.getByRole('button', {
      name: 'James Whitfield · Instructor',
    })
    fireEvent.click(trigger)

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByText('Switch view')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('closes the menu on an outside click', () => {
    renderRoleSwitcher()
    fireEvent.click(
      screen.getByRole('button', { name: 'James Whitfield · Instructor' }),
    )
    expect(screen.getByText('Switch view')).toBeInTheDocument()

    fireEvent.mouseDown(document.body)
    expect(screen.queryByText('Switch view')).not.toBeInTheDocument()
  })

  it('renders an abbreviated trigger label alongside the full label, keeping the full text as the accessible name', () => {
    renderRoleSwitcher()
    const trigger = screen.getByRole('button', {
      name: 'James Whitfield · Instructor',
    })
    expect(
      within(trigger).getByText('J.Whitfield', { selector: 'span' }),
    ).toBeInTheDocument()
    expect(
      within(trigger).getByText('James Whitfield · Instructor', {
        selector: 'span',
      }),
    ).toBeInTheDocument()
  })

  it('renders an abbreviated name alongside the full name/role text for each row, for narrow viewports', () => {
    renderRoleSwitcher()
    fireEvent.click(
      screen.getByRole('button', { name: 'James Whitfield · Instructor' }),
    )

    const panel = getPanel()
    expect(
      within(panel).getByText('J.Whitfield', { selector: 'span' }),
    ).toBeInTheDocument()
    expect(
      within(panel).getByText(studentRowName(DUMMY_STUDENTS[0]), {
        selector: 'span',
      }),
    ).toBeInTheDocument()
  })

  it("renders an instructor's photo instead of initials when one is given", () => {
    renderRoleSwitcher()
    const trigger = screen.getByRole('button', {
      name: 'James Whitfield · Instructor',
    })
    expect(trigger.querySelector('img')).toHaveAttribute(
      'src',
      expect.stringContaining('james-whitfield.webp'),
    )
  })

  it('falls back to initials for a selected student with no photo, ignoring the instructor photo', () => {
    renderRoleSwitcher({ selectedStudentId: DUMMY_STUDENTS[0].id })

    const trigger = screen.getByRole('button', { name: DUMMY_STUDENTS[0].name })
    expect(trigger.querySelector('img')).not.toBeInTheDocument()
    expect(trigger).toHaveTextContent(DUMMY_STUDENTS[0].initials)
  })
})

import type { ComponentProps } from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import RoleSwitcher from './RoleSwitcher'
import { DUMMY_STUDENTS } from './RoleSwitcher.data'
import enMessages from '@/messages/en.json'

const currentUser = { name: 'D. Fabri', initials: 'DF' }

const defaultProps: ComponentProps<typeof RoleSwitcher> = {
  currentUser,
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

describe('RoleSwitcher', () => {
  it('shows the current user as the trigger label and keeps the menu closed by default', () => {
    renderRoleSwitcher()
    expect(
      screen.getByRole('button', { name: 'D. Fabri · Instructor' }),
    ).toBeInTheDocument()
    expect(screen.queryByText('Switch view')).not.toBeInTheDocument()
  })

  it('shows the selected student as the trigger label instead of the instructor', () => {
    renderRoleSwitcher({ selectedStudentId: DUMMY_STUDENTS[0].id })
    expect(
      screen.getByRole('button', { name: DUMMY_STUDENTS[0].name }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'D. Fabri · Instructor' }),
    ).not.toBeInTheDocument()
  })

  it('opens the menu on click and lists the instructor plus every student', () => {
    renderRoleSwitcher()
    fireEvent.click(
      screen.getByRole('button', { name: 'D. Fabri · Instructor' }),
    )

    const panel = getPanel()
    expect(within(panel).getByText('D. Fabri (Instructor)')).toBeInTheDocument()
    DUMMY_STUDENTS.forEach((student) => {
      expect(within(panel).getByText(student.name)).toBeInTheDocument()
    })
  })

  it('marks the instructor row as current when no student is selected', () => {
    renderRoleSwitcher({ selectedStudentId: null })
    fireEvent.click(
      screen.getByRole('button', { name: 'D. Fabri · Instructor' }),
    )

    const panel = getPanel()
    expect(
      within(panel).getByRole('button', { name: 'D. Fabri (Instructor)' }),
    ).toHaveAttribute('aria-current', 'true')
    expect(
      within(panel).getByRole('button', { name: DUMMY_STUDENTS[0].name }),
    ).not.toHaveAttribute('aria-current')
  })

  it('marks the selected student row as current', () => {
    renderRoleSwitcher({ selectedStudentId: DUMMY_STUDENTS[0].id })
    fireEvent.click(
      screen.getByRole('button', { name: DUMMY_STUDENTS[0].name }),
    )

    const panel = getPanel()
    expect(
      within(panel).getByRole('button', { name: DUMMY_STUDENTS[0].name }),
    ).toHaveAttribute('aria-current', 'true')
    expect(
      within(panel).getByRole('button', { name: 'D. Fabri (Instructor)' }),
    ).not.toHaveAttribute('aria-current')
  })

  it('calls onSelect with the student and closes the menu when a student is picked', () => {
    const onSelect = vi.fn()
    renderRoleSwitcher({ onSelect })
    fireEvent.click(
      screen.getByRole('button', { name: 'D. Fabri · Instructor' }),
    )
    fireEvent.click(
      within(getPanel()).getByRole('button', { name: DUMMY_STUDENTS[1].name }),
    )

    expect(onSelect).toHaveBeenCalledWith(DUMMY_STUDENTS[1])
    expect(screen.queryByText('Switch view')).not.toBeInTheDocument()
  })

  it('calls onSelect with null and closes the menu when the instructor row is picked', () => {
    const onSelect = vi.fn()
    renderRoleSwitcher({ onSelect, selectedStudentId: DUMMY_STUDENTS[0].id })
    fireEvent.click(
      screen.getByRole('button', { name: DUMMY_STUDENTS[0].name }),
    )
    fireEvent.click(
      within(getPanel()).getByRole('button', { name: 'D. Fabri (Instructor)' }),
    )

    expect(onSelect).toHaveBeenCalledWith(null)
    expect(screen.queryByText('Switch view')).not.toBeInTheDocument()
  })

  it('toggles the menu closed on a second trigger click', () => {
    renderRoleSwitcher()
    const trigger = screen.getByRole('button', {
      name: 'D. Fabri · Instructor',
    })

    fireEvent.click(trigger)
    expect(screen.getByText('Switch view')).toBeInTheDocument()

    fireEvent.click(trigger)
    expect(screen.queryByText('Switch view')).not.toBeInTheDocument()
  })

  it('closes the menu when Escape is pressed and returns focus to the trigger', () => {
    renderRoleSwitcher()
    const trigger = screen.getByRole('button', {
      name: 'D. Fabri · Instructor',
    })
    fireEvent.click(trigger)

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByText('Switch view')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('closes the menu on an outside click', () => {
    renderRoleSwitcher()
    fireEvent.click(
      screen.getByRole('button', { name: 'D. Fabri · Instructor' }),
    )
    expect(screen.getByText('Switch view')).toBeInTheDocument()

    fireEvent.mouseDown(document.body)
    expect(screen.queryByText('Switch view')).not.toBeInTheDocument()
  })
})

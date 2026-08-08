import { fireEvent, render, screen, within } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import Courses from './Courses'
import { DUMMY_COURSE_PROGRESS } from './Courses.data'
import enMessages from '@/messages/en.json'

function renderCourses(
  props: Partial<React.ComponentProps<typeof Courses>> = {},
) {
  return render(
    <NextIntlClientProvider locale='en' messages={enMessages}>
      <Courses progress={DUMMY_COURSE_PROGRESS} {...props} />
    </NextIntlClientProvider>,
  )
}

describe('Courses', () => {
  it('renders nothing when there is no progress data', () => {
    const { container } = render(
      <NextIntlClientProvider locale='en' messages={enMessages}>
        <Courses />
      </NextIntlClientProvider>,
    )

    expect(container.firstChild).toBeNull()
  })

  it('renders the overall progress bar with hours and percentage', () => {
    renderCourses()

    expect(
      screen.getByRole('region', { name: 'Course progress' }),
    ).toBeInTheDocument()
    expect(screen.getByText('26:02 / 45:00')).toBeInTheDocument()
    expect(screen.getByText('58%')).toBeInTheDocument()

    const [overallBar] = screen.getAllByRole('progressbar')
    expect(overallBar).toHaveAttribute('aria-valuenow', '58')
  })

  it('renders the hours table with category totals, group names, and row labels', () => {
    renderCourses()

    expect(screen.getByText('VFR (26:02)')).toBeInTheDocument()
    expect(screen.getByText('IFR (0:00)')).toBeInTheDocument()
    expect(screen.getByText('MCC (0:00)')).toBeInTheDocument()
    expect(screen.getByText('Aircraft type')).toBeInTheDocument()

    const groupCell = screen.getByText('Current lesson').closest('th')
    expect(groupCell).toHaveAttribute('rowspan', '3')

    expect(screen.getAllByText('Syllabus')).toHaveLength(2)
    expect(screen.getAllByText('Actual')).toHaveLength(2)
    expect(screen.getAllByText('Remaining')).toHaveLength(2)
  })

  it('colors the actual row positive for the current lesson and negative for the full course', () => {
    renderCourses()

    const currentLessonRow = screen
      .getAllByText('Actual')[0]
      .closest('tr') as HTMLElement
    expect(within(currentLessonRow).getAllByText('26:02')[0]).toHaveClass(
      'text-green-300',
    )

    const fullCourseRow = screen
      .getAllByText('Actual')[1]
      .closest('tr') as HTMLElement
    expect(within(fullCourseRow).getAllByText('26:02')[0]).toHaveClass(
      'text-red-300',
    )
  })

  it('toggles a phase panel open and closed, updating aria-expanded and the detail text', () => {
    renderCourses()

    const toggle = screen.getByRole('button', { name: 'Phase 1' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByText(/Basic handling/)).not.toBeVisible()

    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText(/Basic handling/)).toBeVisible()

    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByText(/Basic handling/)).not.toBeVisible()
  })

  it('colors phase progress bars and percentages by completion state', () => {
    renderCourses()

    const phase1 = screen
      .getByRole('button', { name: 'Phase 1' })
      .closest('li') as HTMLElement
    expect(within(phase1).getByText('100%')).toHaveClass('text-green-300')
    expect(
      within(phase1).getByRole('progressbar').firstElementChild,
    ).toHaveClass('bg-green-200')

    const phase3 = screen
      .getByRole('button', { name: 'Phase 3' })
      .closest('li') as HTMLElement
    expect(within(phase3).getByText('53%')).toHaveClass('text-blue-300')
    expect(
      within(phase3).getByRole('progressbar').firstElementChild,
    ).toHaveClass('bg-blue-200')

    const phase4 = screen
      .getByRole('button', { name: 'Phase 4' })
      .closest('li') as HTMLElement
    expect(within(phase4).getByText('0%')).toHaveClass('text-black-200')
    expect(
      within(phase4).getByRole('progressbar').firstElementChild,
    ).toHaveClass('bg-black-100')
  })
})

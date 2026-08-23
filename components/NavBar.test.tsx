import { fireEvent, render, screen, within } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import type { ComponentProps, ReactNode } from 'react'
import NavBar from './NavBar'
import { DUMMY_INSTRUCTORS, DUMMY_STUDENTS } from './RoleSwitcher.data'
import enMessages from '@/messages/en.json'

type MockLinkProps = {
  href: string
  locale?: string
  onClick?: () => void
  'aria-current'?: 'page'
  className?: string
  children: ReactNode
}

const mockUsePathname = vi.fn()
const mockRouterRefresh = vi.fn()

vi.mock('@/i18n/navigation', () => ({
  Link: ({
    href,
    locale,
    onClick,
    'aria-current': ariaCurrent,
    className,
    children,
  }: MockLinkProps) => (
    <a
      href={href}
      data-locale={locale}
      onClick={(e) => {
        e.preventDefault()
        onClick?.()
      }}
      aria-current={ariaCurrent}
      className={className}
    >
      {children}
    </a>
  ),
  usePathname: () => mockUsePathname(),
  useRouter: () => ({ refresh: mockRouterRefresh }),
}))

function renderNavBar(props: ComponentProps<typeof NavBar> = {}) {
  return render(
    <NextIntlClientProvider locale='en' messages={enMessages}>
      <NavBar {...props} />
    </NextIntlClientProvider>,
  )
}

describe('NavBar', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/')
    mockRouterRefresh.mockClear()
  })

  it('renders the hamburger button, wordmark, and every nav item with translated labels and hrefs', () => {
    renderNavBar()
    expect(
      screen.getByRole('navigation', { name: 'Primary navigation' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Menu' })).toBeInTheDocument()
    expect(screen.getByText('Flight Radar')).toBeInTheDocument()

    const expected: [string, string][] = [
      ['Home', '/'],
      ['Me', '/me'],
      ['News', '/news'],
      ['Schedule', '/schedule'],
      ['Aircraft', '/aircraft'],
      ['Documents', '/documents'],
      ['Scheduling', '/instructor'],
    ]
    expected.forEach(([name, href]) => {
      expect(screen.getByRole('link', { name })).toHaveAttribute('href', href)
    })
  })

  it('marks only the nav item matching the current path as active', () => {
    mockUsePathname.mockReturnValue('/aircraft')
    renderNavBar()
    expect(screen.getByRole('link', { name: 'Aircraft' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('marks Me as active for nested /me sub-paths', () => {
    mockUsePathname.mockReturnValue('/me/logbook')
    renderNavBar()
    expect(screen.getByRole('link', { name: 'Me' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('lets activePath override the current pathname for the active state', () => {
    renderNavBar({ activePath: '/news' })
    expect(screen.getByRole('link', { name: 'News' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('forces the collapsed mobile layout when the collapsed prop is set', () => {
    renderNavBar({ collapsed: true })
    const homeLink = screen.getByRole('link', { name: 'Home' })
    const list = homeLink.closest('ul')
    expect(list).toHaveClass('hidden')
    expect(list).not.toHaveClass('md:flex')
  })

  it('hides the hamburger button at md and up when not collapsed', () => {
    renderNavBar()
    expect(screen.getByRole('button', { name: 'Menu' })).toHaveClass(
      'md:hidden',
    )
  })

  it('keeps the hamburger button visible at every breakpoint when collapsed', () => {
    renderNavBar({ collapsed: true })
    expect(screen.getByRole('button', { name: 'Menu' })).not.toHaveClass(
      'md:hidden',
    )
  })

  it('calls onMenuClick when the hamburger button is clicked', () => {
    const onMenuClick = vi.fn()
    renderNavBar({ onMenuClick })
    fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
    expect(onMenuClick).toHaveBeenCalledOnce()
  })

  it('calls onItemClick with the href of the clicked nav item', () => {
    const onItemClick = vi.fn()
    renderNavBar({ onItemClick })
    fireEvent.click(screen.getByRole('link', { name: 'Aircraft' }))
    expect(onItemClick).toHaveBeenCalledWith('/aircraft')
  })

  it('renders the language switcher', () => {
    renderNavBar()
    expect(
      screen.getByRole('button', { name: 'Change language: English' }),
    ).toBeInTheDocument()
  })

  it('calls onItemClick when the wordmark link is clicked', () => {
    const onItemClick = vi.fn()
    renderNavBar({ onItemClick })
    fireEvent.click(screen.getByRole('link', { name: 'Flight Radar' }))
    expect(onItemClick).toHaveBeenCalledWith('/')
  })

  it('defaults the role switcher to Jamie Torres and lets picking a student update the selection', () => {
    renderNavBar({ students: DUMMY_STUDENTS })
    const trigger = screen.getByRole('button', { name: 'Jamie Torres' })
    fireEvent.click(trigger)

    const panel = screen.getByText('Switch view').parentElement as HTMLElement
    expect(
      within(panel).getByRole('button', { name: 'Jamie Torres (PPL student)' }),
    ).toHaveAttribute('aria-current', 'true')

    fireEvent.click(
      within(panel).getByRole('button', { name: 'Alex Moreau (IR student)' }),
    )

    expect(
      screen.getByRole('button', { name: 'Alex Moreau' }),
    ).toBeInTheDocument()
    expect(mockRouterRefresh).toHaveBeenCalledOnce()
  })

  it('hides the Scheduling nav item while a student is the current view', () => {
    renderNavBar({ students: DUMMY_STUDENTS })
    expect(
      screen.queryByRole('link', { name: 'Scheduling' }),
    ).not.toBeInTheDocument()
  })

  it('shows the Scheduling nav item once switched to the instructor view, and sets the role cookie', () => {
    document.cookie = 'fr-current-role=; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    renderNavBar({ students: DUMMY_STUDENTS, instructors: DUMMY_INSTRUCTORS })
    fireEvent.click(screen.getByRole('button', { name: 'Jamie Torres' }))
    fireEvent.click(
      screen.getByRole('button', { name: 'James Whitfield (Instructor)' }),
    )

    expect(screen.getByRole('link', { name: 'Scheduling' })).toHaveAttribute(
      'href',
      '/instructor',
    )
    expect(document.cookie).toContain(
      `fr-current-role=instructor:${DUMMY_INSTRUCTORS[0].id}`,
    )
    expect(mockRouterRefresh).toHaveBeenCalledOnce()
  })

  it('lets picking the second instructor update the trigger and set an instructor-specific cookie', () => {
    document.cookie = 'fr-current-role=; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    renderNavBar({ students: DUMMY_STUDENTS, instructors: DUMMY_INSTRUCTORS })
    fireEvent.click(screen.getByRole('button', { name: 'Jamie Torres' }))
    fireEvent.click(
      screen.getByRole('button', { name: 'Kate Ashford (Instructor)' }),
    )

    expect(
      screen.getByRole('button', { name: 'Kate Ashford · Instructor' }),
    ).toBeInTheDocument()
    expect(document.cookie).toContain(
      `fr-current-role=instructor:${DUMMY_INSTRUCTORS[1].id}`,
    )
  })

  it('honors an explicit initialSelectedStudentId of null (instructor) even when students are available', () => {
    renderNavBar({ students: DUMMY_STUDENTS, initialSelectedStudentId: null })
    expect(
      screen.getByRole('button', { name: 'James Whitfield · Instructor' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Scheduling' })).toBeInTheDocument()
  })

  it('honors an explicit initialSelectedStudentId of a student, hiding Scheduling', () => {
    renderNavBar({
      students: DUMMY_STUDENTS,
      initialSelectedStudentId: 'student-3',
    })
    expect(
      screen.getByRole('button', { name: 'Priya Shah' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Scheduling' }),
    ).not.toBeInTheDocument()
  })

  it('falls back to / for the active state when there is no current pathname', () => {
    mockUsePathname.mockReturnValue(null)
    renderNavBar()
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })
})

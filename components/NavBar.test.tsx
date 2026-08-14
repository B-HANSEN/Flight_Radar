import { fireEvent, render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import type { ComponentProps, ReactNode } from 'react'
import NavBar from './NavBar'
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

  it('falls back to / for the active state when there is no current pathname', () => {
    mockUsePathname.mockReturnValue(null)
    renderNavBar()
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })
})

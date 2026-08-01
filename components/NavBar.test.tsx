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
      ['Flights', '/flights'],
      ['Aircraft', '/aircraft'],
      ['Mailing', '/mailing'],
      ['Documents', '/documents'],
    ]
    expected.forEach(([name, href]) => {
      expect(screen.getByRole('link', { name })).toHaveAttribute('href', href)
    })
  })

  it('marks only the nav item matching the current path as active', () => {
    mockUsePathname.mockReturnValue('/flights')
    renderNavBar()
    expect(screen.getByRole('link', { name: 'Flights' })).toHaveAttribute(
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
    expect(homeLink.parentElement).toHaveClass('hidden')
    expect(homeLink.parentElement).not.toHaveClass('md:flex')
  })

  it('calls onMenuClick when the hamburger button is clicked', () => {
    const onMenuClick = vi.fn()
    renderNavBar({ onMenuClick })
    fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
    expect(onMenuClick).toHaveBeenCalledOnce()
  })

  it('renders a locale switcher link for every configured locale, pointing at the current path', () => {
    mockUsePathname.mockReturnValue('/flights')
    renderNavBar()
    ;['en', 'de', 'es'].forEach((locale) => {
      const link = screen.getByRole('link', { name: locale })
      expect(link).toHaveAttribute('href', '/flights')
      expect(link).toHaveAttribute('data-locale', locale)
    })
  })

  it('calls onItemClick with the href of the clicked nav item', () => {
    const onItemClick = vi.fn()
    renderNavBar({ onItemClick })
    fireEvent.click(screen.getByRole('link', { name: 'Flights' }))
    expect(onItemClick).toHaveBeenCalledWith('/flights')
  })

  it('falls back to / for the locale switcher when there is no current pathname', () => {
    mockUsePathname.mockReturnValue(null)
    renderNavBar()
    expect(screen.getByRole('link', { name: 'en' })).toHaveAttribute(
      'href',
      '/',
    )
  })
})

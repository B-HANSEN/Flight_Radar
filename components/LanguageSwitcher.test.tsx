import { fireEvent, render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import type { ReactNode } from 'react'
import LanguageSwitcher from './LanguageSwitcher'
import enMessages from '@/messages/en.json'

type MockLinkProps = {
  href: string
  locale?: string
  onClick?: () => void
  'aria-current'?: 'true'
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

function renderLanguageSwitcher() {
  return render(
    <NextIntlClientProvider locale='en' messages={enMessages}>
      <LanguageSwitcher />
    </NextIntlClientProvider>,
  )
}

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/flights')
  })

  it('shows the active locale as the button label and keeps the menu closed by default', () => {
    renderLanguageSwitcher()
    expect(
      screen.getByRole('button', { name: 'Change language: English' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: /Deutsch/ }),
    ).not.toBeInTheDocument()
  })

  it('opens the menu on click and lists every locale linking to the current path', () => {
    renderLanguageSwitcher()
    fireEvent.click(screen.getByRole('button'))

    ;[
      ['English', 'en'],
      ['Deutsch', 'de'],
      ['Español', 'es'],
    ].forEach(([name, locale]) => {
      const link = screen.getByRole('link', { name: new RegExp(name) })
      expect(link).toHaveAttribute('href', '/flights')
      expect(link).toHaveAttribute('data-locale', locale)
    })
  })

  it('marks the active locale with aria-current', () => {
    renderLanguageSwitcher()
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('link', { name: /English/ })).toHaveAttribute(
      'aria-current',
      'true',
    )
    expect(screen.getByRole('link', { name: /Deutsch/ })).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('toggles the menu on click and closes it again on a second click', () => {
    renderLanguageSwitcher()
    const button = screen.getByRole('button')

    fireEvent.click(button)
    expect(screen.getByRole('link', { name: /Deutsch/ })).toBeInTheDocument()

    fireEvent.click(button)
    expect(
      screen.queryByRole('link', { name: /Deutsch/ }),
    ).not.toBeInTheDocument()
  })

  it('closes the menu when Escape is pressed', () => {
    renderLanguageSwitcher()
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('link', { name: /Deutsch/ })).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(
      screen.queryByRole('link', { name: /Deutsch/ }),
    ).not.toBeInTheDocument()
  })

  it('closes the menu on an outside click', () => {
    renderLanguageSwitcher()
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('link', { name: /Deutsch/ })).toBeInTheDocument()

    fireEvent.mouseDown(document.body)
    expect(
      screen.queryByRole('link', { name: /Deutsch/ }),
    ).not.toBeInTheDocument()
  })

  it('closes the menu when a locale is selected', () => {
    renderLanguageSwitcher()
    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByRole('link', { name: /Deutsch/ }))
    expect(
      screen.queryByRole('link', { name: /Deutsch/ }),
    ).not.toBeInTheDocument()
  })

  it('falls back to / when there is no current pathname', () => {
    mockUsePathname.mockReturnValue(null)
    renderLanguageSwitcher()
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('link', { name: /English/ })).toHaveAttribute(
      'href',
      '/',
    )
  })
})

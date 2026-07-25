import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import type { ReactNode } from 'react'
import Nav from './Nav'
import enMessages from '@/messages/en.json'

type MockLinkProps = {
  href: string
  locale?: string
  className?: string
  children: ReactNode
}

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, locale, className, children }: MockLinkProps) => (
    <a href={href} data-locale={locale} className={className}>
      {children}
    </a>
  ),
  usePathname: () => '/about',
}))

function renderNav() {
  return render(
    <NextIntlClientProvider locale="en" messages={enMessages}>
      <Nav />
    </NextIntlClientProvider>,
  )
}

describe('Nav', () => {
  it('renders the primary links with translated labels and hrefs', () => {
    renderNav()
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'href',
      '/',
    )
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute(
      'href',
      '/about',
    )
    expect(screen.getByRole('link', { name: 'Flights' })).toHaveAttribute(
      'href',
      '/flights',
    )
  })

  it('renders a locale switcher link for every configured locale', () => {
    renderNav()
    expect(screen.getByRole('link', { name: 'en' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'de' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'es' })).toBeInTheDocument()
  })

  it('points every locale switcher link at the current pathname', () => {
    renderNav()
    expect(screen.getByRole('link', { name: 'de' })).toHaveAttribute(
      'href',
      '/about',
    )
    expect(screen.getByRole('link', { name: 'es' })).toHaveAttribute(
      'href',
      '/about',
    )
  })
})

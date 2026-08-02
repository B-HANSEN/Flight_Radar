import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import NotFoundCard from './NotFoundCard'

type MockLinkProps = {
  href: string
  className?: string
  children: ReactNode
}

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, className, children }: MockLinkProps) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}))

describe('NotFoundCard', () => {
  it('renders the 404 numeral, translated title/body, and a CTA link home', () => {
    render(
      <NotFoundCard
        title='Looks like this page went off the radar.'
        body="We scanned the whole airspace and couldn't find it."
        cta='Back to Home'
      />,
    )

    expect(screen.getByText('404')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        name: 'Looks like this page went off the radar.',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByText("We scanned the whole airspace and couldn't find it."),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to Home' })).toHaveAttribute(
      'href',
      '/',
    )
  })
})

import { fireEvent, render, screen, within } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import type { ComponentProps, ReactNode } from 'react'
import Homepage from './Homepage'
import enMessages from '@/messages/en.json'

vi.mock('@/i18n/navigation', () => ({
  Link: ({
    href,
    className,
    children,
    'aria-label': ariaLabel,
  }: {
    href: string
    className?: string
    children: ReactNode
    'aria-label'?: string
  }) => (
    <a href={href} className={className} aria-label={ariaLabel}>
      {children}
    </a>
  ),
}))

const weather = [
  { code: 'LEDA', metar: '081630Z 24017KT CAVOK', taf: '081400Z TEMPO' },
]

const bookings = [
  {
    id: 'booking-1',
    type: 'Instruction',
    date: '15/08/2026',
    tail: 'EC-ERV',
    person: 'J. Whitfield',
    time: '10:00 - 11:30',
  },
]

const signatures = [
  { id: 'signature-1', date: '07/08/2026', label: 'Instruction #4041369' },
]

const news = [
  {
    id: 'news-1',
    tag: 'operations' as const,
    date: '02/08/2026',
    title: 'Sabadell tower frequency change effective now',
    summary: 'The 8.33 kHz channel spacing update is live at LELL.',
  },
]

function renderHomepage(props: Partial<ComponentProps<typeof Homepage>> = {}) {
  return render(
    <NextIntlClientProvider locale='en' messages={enMessages}>
      <Homepage name='John Doe' {...props} />
    </NextIntlClientProvider>,
  )
}

describe('Homepage', () => {
  it('greets the given name and renders weather, bookings, signatures, and news', () => {
    renderHomepage({ weather, bookings, signatures, news })

    expect(
      screen.getByRole('heading', { name: 'Welcome, John Doe' }),
    ).toBeInTheDocument()

    expect(screen.getByText('LEDA')).toBeInTheDocument()
    expect(screen.getByText(/081630Z 24017KT CAVOK/)).toBeInTheDocument()

    const bookingsSection = screen
      .getByRole('heading', { name: 'My bookings' })
      .closest('section') as HTMLElement
    expect(within(bookingsSection).getByText('Instruction')).toBeInTheDocument()
    expect(within(bookingsSection).getByText('EC-ERV')).toBeInTheDocument()
    expect(
      within(bookingsSection).getByText('J. Whitfield'),
    ).toBeInTheDocument()

    const signaturesSection = screen
      .getByRole('heading', { name: 'Missing signatures' })
      .closest('section') as HTMLElement
    expect(
      within(signaturesSection).getByText('Instruction #4041369'),
    ).toBeInTheDocument()

    expect(screen.getByRole('link', { name: 'View all news' })).toHaveAttribute(
      'href',
      '/news',
    )
    expect(screen.getByText('Operations')).toBeInTheDocument()
    expect(
      screen.getByText('Sabadell tower frequency change effective now'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', {
        name: 'Read more about Sabadell tower frequency change effective now',
      }),
    ).toHaveAttribute('href', '/news')
  })

  it('shows empty-state messages when there is no data for a section', () => {
    renderHomepage()

    expect(
      screen.getByText('No weather reports available.'),
    ).toBeInTheDocument()
    expect(screen.getByText('No upcoming bookings.')).toBeInTheDocument()
    expect(screen.getByText('No missing signatures.')).toBeInTheDocument()
  })

  it('calls onEditSignature with the clicked signature', () => {
    const onEditSignature = vi.fn()
    renderHomepage({ signatures, onEditSignature })

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Edit signature for Instruction #4041369',
      }),
    )

    expect(onEditSignature).toHaveBeenCalledWith(signatures[0])
  })
})

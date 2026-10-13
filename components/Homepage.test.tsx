import { render, screen, within } from '@testing-library/react'
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
  {
    code: 'LEDA',
    metar: '081630Z 24017KT CAVOK',
    taf: '081400Z TEMPO',
    observedAt: '2026-08-18T16:00:00.000Z',
  },
  {
    code: 'ZZZZ',
    metar: '081630Z 18010KT CAVOK',
    taf: '081400Z TEMPO',
    observedAt: '2026-08-18T14:00:00.000Z',
  },
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
  {
    id: 'booking-2',
    type: 'Theory',
    date: '19/08/2026',
    person: 'K. Ashford',
    time: '09:00 - 10:30',
    comments: 'Radio procedures',
  },
]

const signatures = [
  {
    id: 'flight-15',
    sessionId: '4041369',
    date: '07/08/2026',
    type: 'Instruction',
    signed: false,
    student: 'Jamie Torres',
    instructor: 'Jane Smith',
    course: 'PPL Flight Phase (A_1_PPL(A)_v2_FLT)',
    sessionTitle: 'Final check before solo flight',
    aircraft: 'EC-ERV',
    role: 'DUAL',
    route: 'LELL - LELL',
    flightTimeDual: '00:54',
    flightTimeSolo: '00:00',
    landingsDual: 4,
    landingsSolo: 0,
    maneuvers: [{ title: 'VBD15 - Final check before solo flight' }],
    observations: 'Very good session.',
    scorePreparation: 4,
    scoreTechnique: 3,
    scoreInitiative: 4,
    scoreInterest: 4,
    scoreAssimilation: 3,
    finalScore: 3,
    finalNote: 'APTO, pasa a la siguiente fase',
  },
]

const news = [
  {
    id: 'news-1',
    tag: 'operations' as const,
    date: '02/08/2026',
    title: 'Sabadell tower frequency change effective now',
    summary: 'The 8.33 kHz channel spacing update is live at LELL.',
    body: ['TWR now runs on 120.805 MHz and GND on 121.605 MHz.'],
  },
]

function renderHomepage(props: Partial<ComponentProps<typeof Homepage>> = {}) {
  return render(
    <NextIntlClientProvider locale='en' messages={enMessages}>
      <Homepage name='Jamie Torres' {...props} />
    </NextIntlClientProvider>,
  )
}

describe('Homepage', () => {
  it('greets the given name and renders weather, bookings, signatures, and news', () => {
    renderHomepage({ weather, bookings, signatures, news })

    expect(
      screen.getByRole('heading', { name: 'Welcome, Jamie Torres' }),
    ).toBeInTheDocument()

    expect(screen.getByText('LEDA')).toBeInTheDocument()
    expect(screen.getByText('Lleida')).toBeInTheDocument()
    expect(screen.getByText(/081630Z 24017KT CAVOK/)).toBeInTheDocument()
    expect(
      screen.getByText(/Last updated:.*16:00.*Madrid time/),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Source:.*aviationweather\.gov/ }),
    ).toHaveAttribute('href', 'https://aviationweather.gov')
    expect(screen.getByText('ZZZZ')).toBeInTheDocument()

    const bookingsSection = screen
      .getByRole('heading', { name: 'My bookings' })
      .closest('section') as HTMLElement
    expect(within(bookingsSection).getByText('Instruction')).toBeInTheDocument()
    expect(within(bookingsSection).getByText('EC-ERV')).toBeInTheDocument()
    expect(
      within(bookingsSection).getByText('J. Whitfield'),
    ).toBeInTheDocument()
    // A Theory lesson shows its topic in place of a tail number.
    expect(within(bookingsSection).getByText('Theory')).toBeInTheDocument()
    expect(
      within(bookingsSection).getByText('Radio procedures'),
    ).toBeInTheDocument()

    const signaturesSection = screen
      .getByRole('heading', { name: 'Missing signatures' })
      .closest('section') as HTMLElement
    expect(
      within(signaturesSection).getByText('Flight #4041369'),
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
    ).toHaveAttribute('href', '/news#news-1')
  })

  it('shows empty-state messages when there is no data for a section', () => {
    renderHomepage()

    expect(
      screen.getByText('No weather reports available.'),
    ).toBeInTheDocument()
    expect(screen.getByText('No upcoming bookings.')).toBeInTheDocument()
    expect(screen.getByText('No missing signatures.')).toBeInTheDocument()
  })
})

import { fireEvent, render, screen, within } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import type { ComponentProps, ReactNode } from 'react'
import Homepage from './Homepage'
import { fetchApi } from '@/lib/api'
import enMessages from '@/messages/en.json'

vi.mock('@/lib/api', () => ({ fetchApi: vi.fn() }))

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
]

const signatures = [
  {
    id: 'flight-15',
    sessionId: '4041369',
    date: '07/08/2026',
    type: 'Instruction',
    signed: false,
    student: 'John Doe',
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
      <Homepage name='John Doe' {...props} />
    </NextIntlClientProvider>,
  )
}

beforeEach(() => {
  vi.mocked(fetchApi).mockReset().mockResolvedValue(undefined)
})

describe('Homepage', () => {
  it('greets the given name and renders weather, bookings, signatures, and news', () => {
    renderHomepage({ weather, bookings, signatures, news })

    expect(
      screen.getByRole('heading', { name: 'Welcome, John Doe' }),
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

  it('opens the evaluation modal and removes the signature from the list once signed', async () => {
    renderHomepage({ signatures })

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Sign Flight #4041369',
      }),
    )

    const dialog = screen.getByRole('dialog')
    expect(
      within(dialog).getByRole('heading', { name: 'Evaluation #4041369' }),
    ).toBeInTheDocument()

    fireEvent.click(within(dialog).getByRole('button', { name: 'Sign' }))

    expect(
      await screen.findByText('No missing signatures.'),
    ).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(fetchApi).toHaveBeenCalledWith(
      '/flight-evaluations/flight-15/sign',
      { method: 'PATCH', cache: 'no-store' },
    )
  })
})

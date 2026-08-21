import { fireEvent, render, screen, within } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import Signatures from './Signatures'
import type { FlightEvaluation } from './Signatures.types'
import { fetchApi } from '@/lib/api'
import enMessages from '@/messages/en.json'

vi.mock('@/lib/api', () => ({ fetchApi: vi.fn() }))

const BASE = {
  type: 'Instruction',
  student: 'Jamie Torres',
  instructor: 'R. Sinclair',
  course: 'PPL Flight Phase (A_1_PPL(A)_v2_FLT)',
  aircraft: 'EC-ERV',
  role: 'DUAL',
  route: 'LELL - LELL',
  flightTimeDual: '01:00',
  flightTimeSolo: '00:00',
  landingsDual: 3,
  landingsSolo: 0,
  observations: 'A good session overall.',
  scorePreparation: 3,
  scoreTechnique: 3,
  scoreInitiative: 3,
  scoreInterest: 3,
  scoreAssimilation: 3,
}

const FLIGHTS: FlightEvaluation[] = [
  {
    ...BASE,
    id: 'f1',
    sessionId: '1001',
    date: '01/06/2026',
    signed: true,
    sessionTitle: 'Circuit consolidation',
    maneuvers: [{ title: 'VBD03 - Circuit consolidation', score: '4' }],
    finalScore: 4,
    finalNote: 'APTO, pasa a la siguiente fase',
  },
  {
    ...BASE,
    id: 'f2',
    sessionId: '1002',
    date: '02/06/2026',
    signed: false,
    sessionTitle: 'Crosswind landings',
    maneuvers: [{ title: 'VBD07 - Crosswind landings', score: '3' }],
    finalScore: 3,
    finalNote: 'APTO, pasa a la siguiente fase',
  },
  {
    ...BASE,
    id: 'f3',
    sessionId: '1003',
    date: '03/06/2026',
    signed: false,
    sessionTitle: 'Traffic circuits and landing (II)',
    maneuvers: [{ title: 'VBD09 - Traffic circuits and landing (II)' }],
    finalScore: 2,
    finalNote: 'NO APTO, no pasa a la siguiente fase',
  },
]

function renderSignatures(
  props: Partial<React.ComponentProps<typeof Signatures>> = {},
) {
  return render(
    <NextIntlClientProvider locale='en' messages={enMessages}>
      <Signatures flights={FLIGHTS} {...props} />
    </NextIntlClientProvider>,
  )
}

beforeEach(() => {
  vi.mocked(fetchApi).mockReset()
  vi.mocked(fetchApi).mockImplementation(async (path) => {
    const id = path.split('/')[2]
    const flight = FLIGHTS.find((item) => item.id === id)
    return { ...flight, signed: true }
  })
})

describe('Signatures', () => {
  it('shows an empty-state message when there are no flights', () => {
    renderSignatures({ flights: [] })

    expect(screen.getByText('No flights to show.')).toBeInTheDocument()
  })

  it('shows the pending-signatures banner with the missing count only, no per-flight IDs', () => {
    renderSignatures()

    expect(screen.getByText('2 missing signatures')).toBeInTheDocument()
    expect(screen.queryByText('Flight #1002')).not.toBeInTheDocument()
    expect(screen.queryByText('Flight #1003')).not.toBeInTheDocument()
  })

  it('opens the evaluation modal for a row and signs it via the API', async () => {
    renderSignatures()

    fireEvent.click(
      screen.getByRole('button', { name: 'Open evaluation for flight 1002' }),
    )

    const dialog = screen.getByRole('dialog')
    expect(
      within(dialog).getByRole('heading', { name: 'Evaluation #1002' }),
    ).toBeInTheDocument()

    fireEvent.click(within(dialog).getByRole('button', { name: 'Sign' }))

    expect(await screen.findByText('1 missing signature')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(fetchApi).toHaveBeenCalledWith('/flight-evaluations/f2/sign', {
      method: 'PATCH',
      cache: 'no-store',
    })
  })

  it('disables Sign all when nothing is pending', () => {
    render(
      <NextIntlClientProvider locale='en' messages={enMessages}>
        <Signatures
          flights={FLIGHTS.map((flight) => ({ ...flight, signed: true }))}
        />
      </NextIntlClientProvider>,
    )

    expect(screen.getByRole('button', { name: 'Sign all' })).toBeDisabled()
  })

  it('signs every flight and disables the button when Sign all is clicked', async () => {
    renderSignatures()

    fireEvent.click(screen.getByRole('button', { name: 'Sign all' }))

    expect(
      await screen.findByRole('button', { name: 'Sign all' }),
    ).toBeDisabled()
    expect(screen.queryByText('2 missing signatures')).not.toBeInTheDocument()
  })

  it('closes the modal without signing when the close button is clicked', () => {
    renderSignatures()

    fireEvent.click(
      screen.getByRole('button', { name: 'Open evaluation for flight 1002' }),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByText('2 missing signatures')).toBeInTheDocument()
    expect(fetchApi).not.toHaveBeenCalled()
  })
})

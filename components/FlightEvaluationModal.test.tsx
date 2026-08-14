import { fireEvent, render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import FlightEvaluationModal from './FlightEvaluationModal'
import { DUMMY_FLIGHT_EVALUATIONS } from './Signatures.data'
import enMessages from '@/messages/en.json'

const SIGNED_PASS = DUMMY_FLIGHT_EVALUATIONS.find(
  (f) => f.sessionId === '3878920',
)!
const SIGNED_FAIL = DUMMY_FLIGHT_EVALUATIONS.find(
  (f) => f.sessionId === '3779076',
)!
const UNSIGNED_PASS = DUMMY_FLIGHT_EVALUATIONS.find(
  (f) => f.sessionId === '4041369',
)!

function renderModal(
  props: Partial<React.ComponentProps<typeof FlightEvaluationModal>> = {},
) {
  return render(
    <NextIntlClientProvider locale='en' messages={enMessages}>
      <FlightEvaluationModal
        flight={SIGNED_PASS}
        onClose={vi.fn()}
        {...props}
      />
    </NextIntlClientProvider>,
  )
}

describe('FlightEvaluationModal', () => {
  it('renders nothing when there is no flight', () => {
    renderModal({ flight: null })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows the flight details, a scored maneuver, and the pass band for a signed passing evaluation', () => {
    renderModal({ flight: SIGNED_PASS })

    expect(
      screen.getByRole('heading', { name: 'Evaluation #3878920' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Circuit consolidation')).toBeInTheDocument()
    expect(screen.getByText('R. Sinclair')).toBeInTheDocument()
    expect(
      screen.getByText('VBD03 - Circuit consolidation'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Satisfactory, advances to the next phase'),
    ).toBeInTheDocument()
    expect(screen.getByText('Signed')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Sign' }),
    ).not.toBeInTheDocument()
  })

  it('shows the fail band and unscored maneuvers for a signed failing evaluation', () => {
    renderModal({ flight: SIGNED_FAIL })

    expect(
      screen.getByText('Unsatisfactory, does not advance to the next phase'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('VBD09 - Traffic circuits and landing (II)'),
    ).toBeInTheDocument()
    expect(screen.getByText('Assessment of Competencies')).toBeInTheDocument()
    expect(screen.getByText('Signed')).toBeInTheDocument()
  })

  it('shows a Sign button for an unsigned evaluation and calls onSign with the flight', () => {
    const onSign = vi.fn()
    renderModal({ flight: UNSIGNED_PASS, onSign })

    expect(screen.queryByText('Signed')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Sign' }))

    expect(onSign).toHaveBeenCalledWith(UNSIGNED_PASS)
  })

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn()
    renderModal({ onClose })

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(onClose).toHaveBeenCalledOnce()
  })
})

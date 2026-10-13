import { fireEvent, render, screen, within } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import type { ComponentProps } from 'react'
import HomepageSignatures from './HomepageSignatures'
import { DUMMY_SIGNATURES } from './Homepage.data'
import { fetchApi } from '@/lib/api'
import enMessages from '@/messages/en.json'

vi.mock('@/lib/api', () => ({ fetchApi: vi.fn() }))

const signature = DUMMY_SIGNATURES[0]
const flightLabel = `Flight #${signature.sessionId}`

function renderSignatures(
  props: ComponentProps<typeof HomepageSignatures> = {},
) {
  return render(
    <NextIntlClientProvider locale='en' messages={enMessages}>
      <HomepageSignatures {...props} />
    </NextIntlClientProvider>,
  )
}

beforeEach(() => {
  vi.mocked(fetchApi).mockReset().mockResolvedValue(undefined)
})

describe('HomepageSignatures', () => {
  it('opens the evaluation modal and removes the signature from the list once signed', async () => {
    renderSignatures({ signatures: [signature] })

    fireEvent.click(screen.getByRole('button', { name: `Sign ${flightLabel}` }))

    const dialog = screen.getByRole('dialog')
    expect(
      within(dialog).getByRole('heading', {
        name: `Evaluation #${signature.sessionId}`,
      }),
    ).toBeInTheDocument()

    fireEvent.click(within(dialog).getByRole('button', { name: 'Sign' }))

    expect(
      await screen.findByText('No missing signatures.'),
    ).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Missing signatures' }),
    ).toHaveFocus()
    expect(fetchApi).toHaveBeenCalledWith(
      `/flight-evaluations/${signature.id}/sign`,
      { method: 'PATCH', cache: 'no-store' },
    )
  })

  it('shows an under-development note instead of the list in instructor view', () => {
    renderSignatures({ signatures: [signature], underDevelopment: true })

    expect(
      screen.getByText('Report creation is still under development.'),
    ).toBeInTheDocument()
    expect(screen.queryByText(flightLabel)).not.toBeInTheDocument()
  })
})

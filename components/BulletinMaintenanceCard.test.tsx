import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import BulletinMaintenanceCard from './BulletinMaintenanceCard'
import enMessages from '@/messages/en.json'

function renderCard() {
  return render(
    <NextIntlClientProvider locale='en' messages={enMessages}>
      <BulletinMaintenanceCard />
    </NextIntlClientProvider>,
  )
}

describe('BulletinMaintenanceCard', () => {
  it('renders the title parts and aircraft types', () => {
    renderCard()
    const { titlePrefix, titleHighlight, titleSuffix, aircraftTypes } =
      enMessages.NewsBulletins.maintenance
    const heading = screen.getByRole('heading')
    expect(heading).toHaveTextContent(titlePrefix)
    expect(heading).toHaveTextContent(titleSuffix)
    expect(screen.getByText(titleHighlight)).toBeInTheDocument()
    expect(screen.getByText(aircraftTypes)).toBeInTheDocument()
  })

  it('renders both label/copy blocks', () => {
    renderCard()
    const { labelA, textA, labelB, textB } =
      enMessages.NewsBulletins.maintenance
    expect(screen.getByText(labelA)).toBeInTheDocument()
    expect(screen.getByText(textA)).toBeInTheDocument()
    expect(screen.getByText(labelB)).toBeInTheDocument()
    expect(screen.getByText(textB)).toBeInTheDocument()
  })

  it('renders the before/after photos with translated captions and alt text', () => {
    renderCard()
    const { before, after, photoBeforeAlt, photoAfterAlt } =
      enMessages.NewsBulletins.maintenance
    expect(screen.getByText(before)).toBeInTheDocument()
    expect(screen.getByText(after)).toBeInTheDocument()
    expect(screen.getByRole('img', { name: photoBeforeAlt })).toHaveAttribute(
      'src',
      expect.stringContaining('engine-bay-before'),
    )
    expect(screen.getByRole('img', { name: photoAfterAlt })).toHaveAttribute(
      'src',
      expect.stringContaining('engine-bay-after'),
    )
  })
})

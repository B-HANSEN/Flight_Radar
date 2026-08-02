import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import BulletinReferenceCard from './BulletinReferenceCard'
import enMessages from '@/messages/en.json'

function renderCard() {
  return render(
    <NextIntlClientProvider locale='en' messages={enMessages}>
      <BulletinReferenceCard />
    </NextIntlClientProvider>,
  )
}

describe('BulletinReferenceCard', () => {
  it('renders the title and intro', () => {
    renderCard()
    expect(
      screen.getByRole('heading', { name: 'Applicable minimum altitudes' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/legal and internal minimum altitudes/),
    ).toBeInTheDocument()
  })

  it('renders every table with its title and every row', () => {
    renderCard()
    const tables = enMessages.NewsBulletins.reference.tables
    expect(screen.getAllByText('Situation')).toHaveLength(tables.length)
    expect(screen.getAllByText('Minimum')).toHaveLength(tables.length)
    tables.forEach((table) => {
      expect(screen.getByText(table.title)).toBeInTheDocument()
      table.rows.forEach((row) => {
        expect(screen.getByText(row.situation)).toBeInTheDocument()
        expect(screen.getByText(row.minimum)).toBeInTheDocument()
      })
    })
  })
})

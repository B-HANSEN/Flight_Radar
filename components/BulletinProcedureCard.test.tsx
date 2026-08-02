import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import BulletinProcedureCard from './BulletinProcedureCard'
import enMessages from '@/messages/en.json'

function renderCard() {
  return render(
    <NextIntlClientProvider locale='en' messages={enMessages}>
      <BulletinProcedureCard />
    </NextIntlClientProvider>,
  )
}

describe('BulletinProcedureCard', () => {
  it('renders the byline and card title', () => {
    renderCard()
    expect(
      screen.getByRole('heading', {
        name: 'Safety Bulletin: In-flight alternator failure',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('Posted 6 July 2026')).toBeInTheDocument()
    expect(screen.getByText('Alternator failure')).toBeInTheDocument()
  })

  it('renders every step, numbered in order', () => {
    renderCard()
    const steps = enMessages.NewsBulletins.procedure.steps
    steps.forEach((step, index) => {
      expect(screen.getByText(step.title)).toBeInTheDocument()
      expect(screen.getByText(step.detail)).toBeInTheDocument()
      expect(screen.getByText(String(index + 1))).toBeInTheDocument()
    })
  })

  it('renders the photo with translated alt text and the consequences list', () => {
    renderCard()
    expect(
      screen.getByRole('img', {
        name: enMessages.NewsBulletins.procedure.photoAlt,
      }),
    ).toBeInTheDocument()
    enMessages.NewsBulletins.procedure.consequences.forEach((item) => {
      expect(screen.getByText(item)).toBeInTheDocument()
    })
  })
})

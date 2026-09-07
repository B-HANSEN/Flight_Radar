import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import BulletinReminderCard from './BulletinReminderCard'
import enMessages from '@/messages/en.json'

function renderCard(headingLevel?: 2 | 3) {
  return render(
    <NextIntlClientProvider locale='en' messages={enMessages}>
      <BulletinReminderCard headingLevel={headingLevel} />
    </NextIntlClientProvider>,
  )
}

describe('BulletinReminderCard', () => {
  it('renders the title, intro, and callout copy', () => {
    renderCard()
    expect(
      screen.getByRole('heading', { name: 'Reporting aircraft defects' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/importance of immediately/)).toBeInTheDocument()
    expect(screen.getByText(/Do not assume the defect/)).toBeInTheDocument()
  })

  it('renders every checklist item with an icon', () => {
    renderCard()
    const checklist = enMessages.NewsBulletins.reminder.checklist
    const list = screen.getByText(checklist[0]).closest('ul')
    checklist.forEach((item) => {
      expect(screen.getByText(item)).toBeInTheDocument()
    })
    expect(list?.querySelectorAll('svg')).toHaveLength(checklist.length)
  })

  it('renders every "how to report" step', () => {
    renderCard()
    enMessages.NewsBulletins.reminder.howToReport.forEach((item) => {
      expect(screen.getByText(item)).toBeInTheDocument()
    })
  })

  it('renders its title at the requested heading level', () => {
    renderCard(3)
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Reporting aircraft defects',
      }),
    ).toBeInTheDocument()
  })
})

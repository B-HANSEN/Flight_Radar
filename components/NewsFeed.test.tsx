import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import NewsFeed from './NewsFeed'
import type { NewsItem } from './Homepage.types'
import enMessages from '@/messages/en.json'

const news: NewsItem[] = [
  {
    id: 'news-1',
    tag: 'fuel',
    date: '28/07/2026',
    title: 'New BP supply agreement airports',
    summary: 'AVGAS 100LL is now available at more airports.',
    body: ['First detail paragraph.', 'Second detail paragraph.'],
  },
]

function renderFeed(items: NewsItem[] = news) {
  return render(
    <NextIntlClientProvider locale='en' messages={enMessages}>
      <NewsFeed news={items} />
    </NextIntlClientProvider>,
  )
}

describe('NewsFeed', () => {
  it('renders each news item as an anchorable card with its full detail', () => {
    renderFeed()

    expect(screen.getByText('Fuel')).toBeInTheDocument()
    expect(screen.getByText('28/07/2026')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'New BP supply agreement airports' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('AVGAS 100LL is now available at more airports.'),
    ).toBeInTheDocument()
    expect(screen.getByText('First detail paragraph.')).toBeInTheDocument()
    expect(screen.getByText('Second detail paragraph.')).toBeInTheDocument()

    const card = screen
      .getByText('New BP supply agreement airports')
      .closest('li')
    expect(card).toHaveAttribute('id', 'news-1')
  })

  it('renders nothing when there are no news items', () => {
    const { container } = renderFeed([])
    expect(container.querySelectorAll('li')).toHaveLength(0)
  })
})

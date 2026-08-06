import { act, render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import NavClock from './NavClock'
import enMessages from '@/messages/en.json'

function renderNavClock() {
  return render(
    <NextIntlClientProvider locale='en' messages={enMessages}>
      <NavClock />
    </NextIntlClientProvider>,
  )
}

function setVisibility(state: 'visible' | 'hidden') {
  Object.defineProperty(document, 'visibilityState', {
    value: state,
    configurable: true,
  })
}

describe('NavClock', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-06T10:30:00Z'))
    setVisibility('visible')
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the local time and Zulu time labels with the current UTC time', () => {
    renderNavClock()
    expect(screen.getByText(/Local Time:/)).toBeInTheDocument()
    expect(screen.getByText(/Zulu Time: Aug 06, 10:30Z/)).toBeInTheDocument()
  })

  it('updates the displayed time after the interval fires', () => {
    renderNavClock()
    act(() => {
      vi.setSystemTime(new Date('2026-08-06T10:45:00Z'))
      vi.advanceTimersByTime(15000)
    })
    expect(screen.getByText(/Zulu Time: Aug 06, 10:45Z/)).toBeInTheDocument()
  })

  it('only resyncs on visibilitychange while the tab is actually visible', () => {
    renderNavClock()

    setVisibility('hidden')
    act(() => {
      vi.setSystemTime(new Date('2026-08-06T11:15:00Z'))
      document.dispatchEvent(new Event('visibilitychange'))
    })
    expect(screen.getByText(/Zulu Time: Aug 06, 10:30Z/)).toBeInTheDocument()

    setVisibility('visible')
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })
    expect(screen.getByText(/Zulu Time: Aug 06, 11:15Z/)).toBeInTheDocument()
  })

  it('resyncs on window focus', () => {
    renderNavClock()
    act(() => {
      vi.setSystemTime(new Date('2026-08-06T11:30:00Z'))
      window.dispatchEvent(new Event('focus'))
    })
    expect(screen.getByText(/Zulu Time: Aug 06, 11:30Z/)).toBeInTheDocument()
  })
})

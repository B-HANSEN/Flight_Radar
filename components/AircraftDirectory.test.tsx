import { fireEvent, render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import type { ReactNode } from 'react'
import AircraftDirectory from './AircraftDirectory'
import type { Aircraft } from './AircraftDirectory.types'
import enMessages from '@/messages/en.json'

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

const FLEET: Aircraft[] = Array.from({ length: 12 }, (_, index) => ({
  id: `ac-${index + 1}`,
  arcid: `EC-${String(index + 1).padStart(3, '0')}`,
  type: index < 6 ? 'Cessna 152' : 'Piper PA-28',
  photoSrc: index === 0 ? '/aircraft/cessna-152.webp' : undefined,
}))

function renderDirectory(props: { pageSize?: number } = {}) {
  return render(
    <NextIntlClientProvider locale='en' messages={enMessages}>
      <AircraftDirectory aircraft={FLEET} {...props} />
    </NextIntlClientProvider>,
  )
}

describe('AircraftDirectory', () => {
  it('links every aircraft into the schedule board, deep-linked by registration', () => {
    renderDirectory()

    const link = screen.getByRole('link', {
      name: 'View EC-001 (Cessna 152) in the schedule',
    })
    expect(link).toHaveAttribute('href', '/schedule?aircraft=EC-001')
  })

  it('shows a placeholder photo (empty alt) for aircraft without a photoSrc', () => {
    const { container } = renderDirectory()

    const images = Array.from(container.querySelectorAll('img'))
    expect(images.some((img) => img.getAttribute('alt') === '')).toBe(true)
  })

  it('filters by registration or type and reports the match count', () => {
    renderDirectory()

    expect(screen.getByText('12 aircraft found')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Search aircraft'), {
      target: { value: 'piper' },
    })

    expect(screen.getByText('6 aircraft found')).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: /EC-001/ }),
    ).not.toBeInTheDocument()
  })

  it('shows a no-results message when nothing matches the search', () => {
    renderDirectory()

    fireEvent.change(screen.getByLabelText('Search aircraft'), {
      target: { value: 'zzz' },
    })

    expect(
      screen.getByText('No aircraft matched your search.'),
    ).toBeInTheDocument()
  })

  it('paginates the fleet with the arrows and the numbered pages, disabling each end', () => {
    renderDirectory({ pageSize: 10 })

    expect(screen.getByRole('link', { name: /EC-001 / })).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: /EC-011 / }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: 'Next page' }))

    expect(screen.getByRole('link', { name: /EC-011 / })).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: /EC-001 / }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }))
    expect(screen.getByRole('link', { name: /EC-001 / })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Page 2' }))
    expect(screen.getByRole('link', { name: /EC-011 / })).toBeInTheDocument()
  })
})

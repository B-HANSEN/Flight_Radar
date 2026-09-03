import { fireEvent, render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import type { ComponentProps, ReactNode } from 'react'
import TabBar from './TabBar'
import enMessages from '@/messages/en.json'

type MockLinkProps = {
  href: string
  onClick?: () => void
  'aria-current'?: 'page'
  className?: string
  children: ReactNode
}

const mockUsePathname = vi.fn()

vi.mock('@/i18n/navigation', () => ({
  Link: ({
    href,
    onClick,
    'aria-current': ariaCurrent,
    className,
    children,
  }: MockLinkProps) => (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault()
        onClick?.()
      }}
      aria-current={ariaCurrent}
      className={className}
    >
      {children}
    </a>
  ),
  usePathname: () => mockUsePathname(),
}))

function renderTabBar(props: ComponentProps<typeof TabBar> = {}) {
  return render(
    <NextIntlClientProvider locale='en' messages={enMessages}>
      <TabBar {...props} />
    </NextIntlClientProvider>,
  )
}

describe('TabBar', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/me/agenda')
  })

  it('renders every tab with its translated label and href', () => {
    renderTabBar()

    const expected: [string, string][] = [
      ['Agenda', '/me/agenda'],
      ['Certificates', '/me/certificates'],
      ['Courses', '/me/courses'],
      ['Signatures', '/me/signatures'],
      ['Logbook', '/me/logbook'],
      ['Availability', '/me/availability'],
      ['Emails', '/me/emails'],
    ]
    expected.forEach(([name, href]) => {
      expect(screen.getByRole('link', { name })).toHaveAttribute('href', href)
    })
  })

  it('marks only the tab matching the current path as active', () => {
    renderTabBar()
    expect(screen.getByRole('link', { name: 'Agenda' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(
      screen.getByRole('link', { name: 'Certificates' }),
    ).not.toHaveAttribute('aria-current')
  })

  it('lets activePath override the current pathname for the active state', () => {
    renderTabBar({ activePath: '/me/logbook' })
    expect(screen.getByRole('link', { name: 'Logbook' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('calls onItemClick with the href of the clicked tab', () => {
    const onItemClick = vi.fn()
    renderTabBar({ onItemClick })
    fireEvent.click(screen.getByRole('link', { name: 'Courses' }))
    expect(onItemClick).toHaveBeenCalledWith('/me/courses')
  })
})

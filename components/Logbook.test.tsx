import { fireEvent, render, screen, within } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import Logbook from './Logbook'
import type { LogbookEntry } from './Logbook.types'
import enMessages from '@/messages/en.json'

const entries: LogbookEntry[] = [
  {
    id: 'e1',
    date: '01/01/2026',
    depPlace: 'LELL',
    depTime: '10:00',
    arrPlace: 'LELL',
    arrTime: '11:00',
    model: 'Cessna 152',
    reg: 'EC-AAA',
    se: '1:00',
    total: '1:00',
    pic: 'A. Instructor',
    landingsDay: 2,
    remarks: 'Circuits',
  },
  {
    id: 'e2',
    date: '02/01/2026',
    depPlace: 'LELL',
    depTime: '10:00',
    arrPlace: 'LEVD',
    arrTime: '11:30',
    model: 'Cessna 152',
    reg: 'EC-BBB',
    se: '1:30',
    xcDual: '0:45',
    total: '1:30',
    pic: 'B. Instructor',
    landingsDay: 1,
    night: true,
    remarks: 'Navex',
  },
  {
    id: 'e3',
    date: '03/01/2026',
    depPlace: 'LELL',
    depTime: '09:00',
    arrPlace: 'LELL',
    arrTime: '09:45',
    model: 'Cessna 152',
    reg: 'EC-CCC',
    total: '0:45',
    pic: 'A. Instructor',
    landingsDay: 3,
    landingsNight: 1,
  },
]

function renderLogbook(
  props: Partial<React.ComponentProps<typeof Logbook>> = {},
) {
  return render(
    <NextIntlClientProvider locale='en' messages={enMessages}>
      <Logbook {...props} />
    </NextIntlClientProvider>,
  )
}

describe('Logbook', () => {
  it('computes the totals summary and paginates flights, with block totals only shown when non-zero', () => {
    renderLogbook({ entries, pageSize: 2 })

    const summaryTable = screen
      .getByText('Logbook totals')
      .closest('table') as HTMLElement
    expect(within(summaryTable).getAllByText('3:15')).toHaveLength(2)
    expect(within(summaryTable).getByText('2:30')).toBeInTheDocument()
    expect(within(summaryTable).getByText('0:45')).toBeInTheDocument()
    expect(within(summaryTable).getByText('1:30')).toBeInTheDocument()
    expect(within(summaryTable).getByText('6')).toBeInTheDocument()
    expect(within(summaryTable).getByText('1')).toBeInTheDocument()

    expect(
      screen.getByRole('button', { name: /Page 1.*2 flights/ }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Page 2.*1 flight$/ }),
    ).toBeInTheDocument()

    expect(screen.getByText('EC-AAA')).toBeInTheDocument()
    expect(screen.getByText('EC-BBB')).toBeInTheDocument()
    expect(screen.getByText('EC-CCC')).toBeInTheDocument()

    const page1Table = screen
      .getByText('Page 1 flight log')
      .closest('table') as HTMLElement
    const page1BlockTotal = page1Table.parentElement
      ?.nextElementSibling as HTMLElement
    expect(within(page1BlockTotal).getByText('SE')).toBeInTheDocument()
    expect(within(page1BlockTotal).getByText('Dual')).toBeInTheDocument()

    const page2Table = screen
      .getByText('Page 2 flight log')
      .closest('table') as HTMLElement
    const page2BlockTotal = page2Table.parentElement
      ?.nextElementSibling as HTMLElement
    expect(within(page2BlockTotal).queryByText('SE')).not.toBeInTheDocument()
    expect(within(page2BlockTotal).queryByText('Dual')).not.toBeInTheDocument()
  })

  it('renders em dashes for optional fields left unset on a row, and real values when set', () => {
    renderLogbook({ entries, pageSize: 3 })

    const row1 = screen.getByText('EC-AAA').closest('tr') as HTMLElement
    expect(within(row1).getAllByText('1:00')).toHaveLength(2)
    expect(within(row1).getByText('Circuits')).toBeInTheDocument()
    expect(within(row1).getAllByText('—')).toHaveLength(4)

    const row3 = screen.getByText('EC-CCC').closest('tr') as HTMLElement
    expect(within(row3).getByText('1')).toBeInTheDocument()
    expect(within(row3).getAllByText('—')).toHaveLength(5)
  })

  it('toggles a page open and closed via its header button', () => {
    renderLogbook({ entries, pageSize: 2 })

    const toggle = screen.getByRole('button', { name: /Page 2/ })
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('EC-CCC')).toBeInTheDocument()

    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByText('EC-CCC')).not.toBeVisible()

    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('EC-CCC')).toBeVisible()
  })

  it('reverses the flight order when the checkbox is checked', () => {
    renderLogbook({ entries, pageSize: 3 })

    const regCellsBefore = screen.getAllByText(/^EC-/)
    expect(regCellsBefore.map((el) => el.textContent)).toEqual([
      'EC-AAA',
      'EC-BBB',
      'EC-CCC',
    ])

    fireEvent.click(screen.getByRole('checkbox', { name: 'Reverse order' }))

    const regCellsAfter = screen.getAllByText(/^EC-/)
    expect(regCellsAfter.map((el) => el.textContent)).toEqual([
      'EC-CCC',
      'EC-BBB',
      'EC-AAA',
    ])
  })

  it('calls onDownload and onRefresh when their toolbar buttons are clicked', () => {
    const onDownload = vi.fn()
    const onRefresh = vi.fn()
    renderLogbook({ entries, onDownload, onRefresh })

    fireEvent.click(screen.getByRole('button', { name: 'Download' }))
    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }))

    expect(onDownload).toHaveBeenCalledTimes(1)
    expect(onRefresh).toHaveBeenCalledTimes(1)
  })

  it('shows an empty-state message when there are no logbook entries', () => {
    renderLogbook()

    expect(screen.getByText('No flights recorded yet.')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /Page/ }),
    ).not.toBeInTheDocument()
  })
})

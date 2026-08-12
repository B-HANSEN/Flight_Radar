import { fireEvent, render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import Availability from './Availability'
import { DUMMY_AVAILABILITY_ENTRIES } from './Availability.data'
import enMessages from '@/messages/en.json'

function renderAvailability(
  props: Partial<React.ComponentProps<typeof Availability>> = {},
) {
  return render(
    <NextIntlClientProvider locale='en' messages={enMessages}>
      <Availability entries={DUMMY_AVAILABILITY_ENTRIES} {...props} />
    </NextIntlClientProvider>,
  )
}

describe('Availability', () => {
  it('renders each entry', () => {
    renderAvailability()

    expect(
      screen.getByText('From 27/08/2026 to 30/08/2026'),
    ).toBeInTheDocument()
    expect(screen.getByText('Between 08:00 and 21:00')).toBeInTheDocument()
  })

  it('shows a placeholder message when there are no entries', () => {
    renderAvailability({ entries: [] })

    expect(screen.getByText('No availability entries yet.')).toBeInTheDocument()
  })

  it('adds a new entry to the top of the list from the modal', () => {
    renderAvailability()

    fireEvent.click(screen.getByRole('button', { name: 'Add availability' }))
    expect(
      screen.getByRole('dialog', { name: 'Student Availability' }),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(
      screen.queryByRole('dialog', { name: 'Student Availability' }),
    ).not.toBeInTheDocument()

    const rows = screen.getAllByText('All the time')
    expect(rows).toHaveLength(1)
    expect(screen.getByText('One time')).toBeInTheDocument()
  })

  it('adds a specific-date entry using the typed dd/mm/yyyy value', () => {
    renderAvailability()

    fireEvent.click(screen.getByRole('button', { name: 'Add availability' }))
    fireEvent.click(screen.getByRole('radio', { name: /^On/ }))
    fireEvent.change(screen.getByLabelText('Date'), {
      target: { value: '27/08/2026' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(screen.getByText('On 27/08/2026')).toBeInTheDocument()
  })

  it('closes the modal from its footer Close button without adding an entry', () => {
    renderAvailability()

    fireEvent.click(screen.getByRole('button', { name: 'Add availability' }))
    const closeButtons = screen.getAllByRole('button', { name: 'Close' })
    fireEvent.click(closeButtons[closeButtons.length - 1])

    expect(
      screen.queryByRole('dialog', { name: 'Student Availability' }),
    ).not.toBeInTheDocument()
    expect(screen.queryByText('One time')).not.toBeInTheDocument()
  })
})

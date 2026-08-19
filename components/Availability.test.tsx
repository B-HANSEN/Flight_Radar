import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import Availability from './Availability'
import { DUMMY_AVAILABILITY_ENTRIES } from './Availability.data'
import { fetchApi } from '@/lib/api'
import enMessages from '@/messages/en.json'

vi.mock('@/lib/api', () => ({ fetchApi: vi.fn() }))

function renderAvailability(
  props: Partial<React.ComponentProps<typeof Availability>> = {},
) {
  return render(
    <NextIntlClientProvider locale='en' messages={enMessages}>
      <Availability entries={DUMMY_AVAILABILITY_ENTRIES} {...props} />
    </NextIntlClientProvider>,
  )
}

beforeEach(() => {
  vi.mocked(fetchApi).mockReset()
})

describe('Availability', () => {
  it('renders each entry', () => {
    renderAvailability()

    expect(
      screen.getByText('From 27/08/2026 to 30/08/2026'),
    ).toBeInTheDocument()
    expect(screen.getByText('Between 08:00 and 21:00')).toBeInTheDocument()
  })

  it('sorts entries by start date, newest first, regardless of prop order', () => {
    renderAvailability()

    const dateCells = screen
      .getAllByText(/^From \d{2}\/\d{2}\/\d{4} to /)
      .map((el) => el.textContent)

    expect(dateCells).toEqual([
      'From 27/08/2026 to 30/08/2026',
      'From 17/08/2026 to 19/08/2026',
      'From 10/08/2026 to 16/08/2026',
      'From 03/08/2026 to 09/08/2026',
      'From 31/07/2026 to 02/08/2026',
    ])
  })

  it('shows a placeholder message when there are no entries', () => {
    renderAvailability({ entries: [] })

    expect(screen.getByText('No availability entries yet.')).toBeInTheDocument()
  })

  it('adds a new entry to the top of the list from the modal', async () => {
    vi.mocked(fetchApi).mockResolvedValueOnce({
      id: 'new-entry',
      dateLabel: 'From 20/08/2026 to 25/08/2026',
      dateMode: 'range',
      fromDate: '20/08/2026',
      toDate: '25/08/2026',
      timeLabel: 'All day',
      timeMode: 'allDay',
      recurrence: 'Everyday',
      recurrenceMode: 'everyday',
    })

    renderAvailability()

    fireEvent.click(screen.getByRole('button', { name: 'Add availability' }))
    expect(
      screen.getByRole('dialog', { name: 'Student Availability' }),
    ).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('From date'), {
      target: { value: '20/08/2026' },
    })
    fireEvent.change(screen.getByLabelText('To date'), {
      target: { value: '25/08/2026' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(
      await screen.findByText('From 20/08/2026 to 25/08/2026'),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('dialog', { name: 'Student Availability' }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Availability added')
    expect(fetchApi).toHaveBeenCalledWith('/availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateLabel: 'From 20/08/2026 to 25/08/2026',
        timeLabel: 'All day',
        recurrence: 'Everyday',
        dateMode: 'range',
        onDate: undefined,
        fromDate: '20/08/2026',
        toDate: '25/08/2026',
        timeMode: 'allDay',
        startTime: undefined,
        endTime: undefined,
        recurrenceMode: 'everyday',
        recurrenceDays: undefined,
      }),
      cache: 'no-store',
    })
  })

  it('disables Save until a valid date is entered for the default range mode', () => {
    renderAvailability()

    fireEvent.click(screen.getByRole('button', { name: 'Add availability' }))

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()

    fireEvent.change(screen.getByLabelText('From date'), {
      target: { value: '20/08/2026' },
    })
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()

    fireEvent.change(screen.getByLabelText('To date'), {
      target: { value: '25/08/2026' },
    })
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
  })

  it('adds a specific-date entry using the typed dd/mm/yyyy value', async () => {
    vi.mocked(fetchApi).mockResolvedValueOnce({
      id: 'new-entry',
      dateLabel: 'On 27/08/2026',
      dateMode: 'on',
      onDate: '27/08/2026',
      timeLabel: 'All day',
      timeMode: 'allDay',
      recurrence: 'Everyday',
      recurrenceMode: 'everyday',
    })

    renderAvailability()

    fireEvent.click(screen.getByRole('button', { name: 'Add availability' }))
    fireEvent.click(screen.getByRole('radio', { name: /^On/ }))
    fireEvent.change(screen.getByLabelText('Date'), {
      target: { value: '27/08/2026' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('On 27/08/2026')).toBeInTheDocument()
  })

  it('edits an entry, pre-filling the form with its current values', async () => {
    vi.mocked(fetchApi).mockResolvedValueOnce({
      id: 'avail-1',
      dateLabel: 'From 01/09/2026 to 30/08/2026',
      dateMode: 'range',
      fromDate: '01/09/2026',
      toDate: '30/08/2026',
      timeLabel: 'Between 18:00 and 21:00',
      timeMode: 'between',
      startTime: '18:00',
      endTime: '21:00',
      recurrence: 'Everyday',
      recurrenceMode: 'everyday',
    })

    renderAvailability()

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Edit availability from From 27/08/2026 to 30/08/2026',
      }),
    )

    expect(
      screen.getByRole('dialog', { name: 'Edit Availability' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('From date')).toHaveValue('27/08/2026')
    expect(screen.getByLabelText('To date')).toHaveValue('30/08/2026')

    fireEvent.change(screen.getByLabelText('From date'), {
      target: { value: '01/09/2026' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(
      await screen.findByText('From 01/09/2026 to 30/08/2026'),
    ).toBeInTheDocument()
    expect(
      screen.queryByText('From 27/08/2026 to 30/08/2026'),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Availability updated')
    expect(fetchApi).toHaveBeenCalledWith('/availability/avail-1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateLabel: 'From 01/09/2026 to 30/08/2026',
        timeLabel: 'Between 18:00 and 21:00',
        recurrence: 'Everyday',
        dateMode: 'range',
        onDate: undefined,
        fromDate: '01/09/2026',
        toDate: '30/08/2026',
        timeMode: 'between',
        startTime: '18:00',
        endTime: '21:00',
        recurrenceMode: 'everyday',
        recurrenceDays: undefined,
      }),
      cache: 'no-store',
    })
  })

  it('edits recurrence, pre-filling "these days" and saving a new selection', async () => {
    vi.mocked(fetchApi).mockResolvedValueOnce({
      id: 'avail-days',
      dateLabel: 'From 20/08/2026 to 25/08/2026',
      dateMode: 'range',
      fromDate: '20/08/2026',
      toDate: '25/08/2026',
      timeLabel: 'All day',
      timeMode: 'allDay',
      recurrence: 'On Monday, Tuesday, Thursday',
      recurrenceMode: 'days',
      recurrenceDays: ['mon', 'tue', 'thu'],
    })

    renderAvailability({
      entries: [
        {
          id: 'avail-days',
          dateLabel: 'From 20/08/2026 to 25/08/2026',
          dateMode: 'range',
          fromDate: '20/08/2026',
          toDate: '25/08/2026',
          timeLabel: 'All day',
          timeMode: 'allDay',
          recurrence: 'On Monday, Tuesday',
          recurrenceMode: 'days',
          recurrenceDays: ['mon', 'tue'],
        },
      ],
    })

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Edit availability from From 20/08/2026 to 25/08/2026',
      }),
    )

    expect(screen.getByRole('radio', { name: /^These days/ })).toBeChecked()
    expect(screen.getByRole('button', { name: 'Monday' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Thursday' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )

    fireEvent.click(screen.getByRole('button', { name: 'Thursday' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(
      await screen.findByText('On Monday, Tuesday, Thursday'),
    ).toBeInTheDocument()
    expect(fetchApi).toHaveBeenCalledWith('/availability/avail-days', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateLabel: 'From 20/08/2026 to 25/08/2026',
        timeLabel: 'All day',
        recurrence: 'On Monday, Tuesday, Thursday',
        dateMode: 'range',
        onDate: undefined,
        fromDate: '20/08/2026',
        toDate: '25/08/2026',
        timeMode: 'allDay',
        startTime: undefined,
        endTime: undefined,
        recurrenceMode: 'days',
        recurrenceDays: ['mon', 'tue', 'thu'],
      }),
      cache: 'no-store',
    })
  })

  it("disables a weekday button in the edit modal when it falls outside the entry's date range", () => {
    renderAvailability({
      entries: [
        {
          id: 'avail-days',
          dateLabel: 'From 20/08/2026 to 25/08/2026',
          dateMode: 'range',
          fromDate: '20/08/2026',
          toDate: '25/08/2026',
          timeLabel: 'All day',
          timeMode: 'allDay',
          recurrence: 'On Monday, Tuesday',
          recurrenceMode: 'days',
          recurrenceDays: ['mon', 'tue'],
        },
      ],
    })

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Edit availability from From 20/08/2026 to 25/08/2026',
      }),
    )

    // 20/08/2026-25/08/2026 spans Thu-Tue, so Wednesday is out of range.
    expect(screen.getByRole('button', { name: 'Wednesday' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Monday' })).toBeEnabled()
  })

  it('collapses to "everyday" on the page and on reopen when all seven days are selected', async () => {
    vi.mocked(fetchApi).mockResolvedValueOnce({
      id: 'avail-days',
      dateLabel: 'From 20/08/2026 to 25/08/2026',
      dateMode: 'range',
      fromDate: '20/08/2026',
      toDate: '25/08/2026',
      timeLabel: 'All day',
      timeMode: 'allDay',
      recurrence: 'Everyday',
      recurrenceMode: 'everyday',
    })

    renderAvailability({
      entries: [
        {
          id: 'avail-days',
          dateLabel: 'From 20/08/2026 to 25/08/2026',
          dateMode: 'range',
          fromDate: '20/08/2026',
          toDate: '25/08/2026',
          timeLabel: 'All day',
          timeMode: 'allDay',
          recurrence: 'On Monday, Tuesday, Wednesday, Thursday, Friday',
          recurrenceMode: 'days',
          recurrenceDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
        },
      ],
    })

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Edit availability from From 20/08/2026 to 25/08/2026',
      }),
    )

    fireEvent.click(screen.getByRole('button', { name: 'Saturday' }))
    fireEvent.click(screen.getByRole('button', { name: 'Sunday' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
    expect(screen.getByText('Everyday')).toBeInTheDocument()
    expect(
      screen.queryByText('On Monday, Tuesday, Wednesday, Thursday, Friday'),
    ).not.toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Edit availability from From 20/08/2026 to 25/08/2026',
      }),
    )

    expect(screen.getByRole('radio', { name: 'Everyday' })).toBeChecked()
  })

  it('removes an entry when its delete button is clicked', async () => {
    vi.mocked(fetchApi).mockResolvedValueOnce(undefined)

    renderAvailability()

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Delete availability from From 27/08/2026 to 30/08/2026',
      }),
    )

    expect(
      await screen.findByText('From 17/08/2026 to 19/08/2026'),
    ).toBeInTheDocument()
    expect(
      screen.queryByText('From 27/08/2026 to 30/08/2026'),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Availability deleted')
    expect(fetchApi).toHaveBeenCalledWith('/availability/avail-1', {
      method: 'DELETE',
      cache: 'no-store',
    })
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
    expect(fetchApi).not.toHaveBeenCalled()
  })
})

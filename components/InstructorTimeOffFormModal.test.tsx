import { fireEvent, render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import InstructorTimeOffFormModal from './InstructorTimeOffFormModal'
import enMessages from '@/messages/en.json'

function renderModal(
  props: Partial<React.ComponentProps<typeof InstructorTimeOffFormModal>> = {},
) {
  const onSave = props.onSave ?? vi.fn()
  const onClose = props.onClose ?? vi.fn()
  render(
    <NextIntlClientProvider locale='en' messages={enMessages}>
      <InstructorTimeOffFormModal
        isOpen
        onClose={onClose}
        onSave={onSave}
        {...props}
      />
    </NextIntlClientProvider>,
  )
  return { onSave, onClose }
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  vi.setSystemTime(new Date(2026, 7, 15)) // 15 Aug 2026
})

afterEach(() => {
  vi.useRealTimers()
})

describe('InstructorTimeOffFormModal', () => {
  it('keeps the submit button disabled until a valid date is entered', () => {
    renderModal()

    const submit = screen.getByRole('button', { name: 'Submit request' })
    expect(submit).toBeDisabled()

    fireEvent.change(screen.getByLabelText('Date'), {
      target: { value: '27/08/2026' },
    })
    expect(submit).toBeEnabled()
  })

  it('flags an out-of-range date and blocks submit', () => {
    renderModal()

    fireEvent.change(screen.getByLabelText('Date'), {
      target: { value: '01/01/2020' },
    })

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Enter a valid date (dd/mm/yyyy) within the next 6 months.',
    )
    expect(
      screen.getByRole('button', { name: 'Submit request' }),
    ).toBeDisabled()
  })

  it('submits a regular day off with the date converted to ISO', () => {
    const { onSave } = renderModal()

    fireEvent.change(screen.getByLabelText('Date'), {
      target: { value: '27/08/2026' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Submit request' }))

    expect(onSave).toHaveBeenCalledWith({
      date: '2026-08-27',
      type: 'regular',
      reason: '',
    })
  })

  it('fills the date field from the calendar picker', () => {
    renderModal()

    fireEvent.click(screen.getByRole('button', { name: 'Open calendar' }))
    fireEvent.click(screen.getByRole('button', { name: 'OK' }))

    // The picker defaults to "today" (pinned to 15 Aug 2026).
    expect(screen.getByLabelText('Date')).toHaveValue('15/08/2026')
    expect(screen.getByRole('button', { name: 'Submit request' })).toBeEnabled()
  })

  it('resets and closes from the footer Close button', () => {
    const { onClose } = renderModal()

    fireEvent.change(screen.getByLabelText('Date'), {
      target: { value: '27/08/2026' },
    })
    const closeButtons = screen.getAllByRole('button', { name: 'Close' })
    fireEvent.click(closeButtons[closeButtons.length - 1])

    expect(onClose).toHaveBeenCalled()
  })

  it('requires a reason for personal leave and passes it through', () => {
    const { onSave } = renderModal()

    fireEvent.change(screen.getByLabelText('Date'), {
      target: { value: '27/08/2026' },
    })
    fireEvent.click(screen.getByRole('radio', { name: 'Personal leave' }))

    const submit = screen.getByRole('button', { name: 'Submit request' })
    expect(submit).toBeDisabled()

    fireEvent.change(screen.getByLabelText('Reason for personal leave'), {
      target: { value: '  Family wedding  ' },
    })
    expect(submit).toBeEnabled()

    fireEvent.click(submit)
    expect(onSave).toHaveBeenCalledWith({
      date: '2026-08-27',
      type: 'personal',
      reason: 'Family wedding',
    })
  })
})

import { fireEvent, render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import ScheduleBlockDetailModal from './ScheduleBlockDetailModal'
import type { ScheduleBlockDetail } from './ScheduleBoard.types'
import enMessages from '@/messages/en.json'

const DETAIL: ScheduleBlockDetail = {
  aircraft: { id: 'ec-erv', arcid: 'EC-ERV', type: 'Cessna 152' },
  block: {
    id: 'b1',
    label: 'Reserved 09:00–12:00',
    kind: 'reserved',
    start: 9,
    end: 12,
  },
  timeLabel: 'Sunday, Aug 9, 2026 · 09:00 – 12:00',
}

function renderModal(
  props: Partial<React.ComponentProps<typeof ScheduleBlockDetailModal>> = {},
) {
  return render(
    <NextIntlClientProvider locale='en' messages={enMessages}>
      <ScheduleBlockDetailModal detail={DETAIL} onClose={vi.fn()} {...props} />
    </NextIntlClientProvider>,
  )
}

describe('ScheduleBlockDetailModal', () => {
  it('renders nothing when there is no detail', () => {
    renderModal({ detail: null })

    expect(screen.queryByText('Schedule details')).not.toBeInTheDocument()
  })

  it('shows the time, aircraft and block label when a detail is set', () => {
    renderModal()

    expect(screen.getByText('Schedule details')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Sunday, Aug 9, 2026 · 09:00 – 12:00 · EC-ERV · Cessna 152',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('Reserved 09:00–12:00')).toBeInTheDocument()
  })

  it('shows the student and instructor names when the block carries them', () => {
    renderModal({
      detail: {
        ...DETAIL,
        block: {
          ...DETAIL.block,
          studentName: 'Alex Moreau',
          instructorName: 'James Whitfield',
        },
      },
    })

    expect(screen.getByText('Student')).toBeInTheDocument()
    expect(screen.getByText('Alex Moreau')).toBeInTheDocument()
    expect(screen.getByText('Instructor')).toBeInTheDocument()
    expect(screen.getByText('James Whitfield')).toBeInTheDocument()
  })

  it('omits the instructor row when only a student name is present', () => {
    renderModal({
      detail: {
        ...DETAIL,
        block: { ...DETAIL.block, studentName: 'Alex Moreau' },
      },
    })

    expect(screen.getByText('Student')).toBeInTheDocument()
    expect(screen.queryByText('Instructor')).not.toBeInTheDocument()
  })

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn()
    renderModal({ onClose })

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(onClose).toHaveBeenCalledOnce()
  })
})

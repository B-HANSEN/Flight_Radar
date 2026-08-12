import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useArgs } from 'storybook/preview-api'
import BookingDetailModal from './BookingDetailModal'
import type { BookingEvent } from './AgendaCalendar.types'

const SAMPLE_EVENT: BookingEvent = {
  id: 'ev-8',
  type: 'booking',
  date: '2026-08-04',
  time: '18:10 - 20:20',
  tailNumber: 'EC-EXL',
  pilotInCommand: 'Mike Murdoch [PIC]',
  flightLines: [
    'VTD01 - Precautionary landing. Reading maps of local area',
    'VTD02 - DM cross country flight',
  ],
}

const meta: Meta<typeof BookingDetailModal> = {
  component: BookingDetailModal,
  title: 'Components/Modals/BookingDetailModal',
  args: {
    event: SAMPLE_EVENT,
  },
}
export default meta

export const Default: StoryObj<typeof BookingDetailModal> = {
  render: (args) => {
    const [, updateArgs] = useArgs()
    return (
      <BookingDetailModal
        {...args}
        onClose={() => updateArgs({ event: null })}
      />
    )
  },
}

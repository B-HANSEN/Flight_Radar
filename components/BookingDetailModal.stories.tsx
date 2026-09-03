import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useArgs } from 'storybook/preview-api'
import StoryOpenButton from '../.storybook/StoryOpenButton'
import BookingDetailModal from './BookingDetailModal'
import type { BookingEvent } from './AgendaCalendar.types'

const FLIGHT_EVENT: BookingEvent = {
  id: 'ev-8',
  type: 'booking',
  date: '2026-08-07',
  time: '13:10 - 15:20',
  tailNumber: 'EC-ERV',
  instructorName: 'Kate Ashford',
  studentName: 'Jamie Torres',
  lessonType: 'Checkride prep',
  trainingCode: 'VBD15',
}

const THEORY_EVENT: BookingEvent = {
  id: 'ev-9',
  type: 'booking',
  date: '2026-08-16',
  time: '18:00 - 19:30',
  instructorName: 'James Whitfield',
  studentName: 'Jamie Torres',
  lessonType: 'Theory',
  comments: 'Navigation theory — map reading, drift and diversions',
}

const meta: Meta<typeof BookingDetailModal> = {
  component: BookingDetailModal,
  title: 'Components/Modals/BookingDetailModal',
  args: {
    event: null,
  },
  argTypes: {
    event: {
      options: ['flight', 'theory'],
      mapping: { flight: FLIGHT_EVENT, theory: THEORY_EVENT },
      control: { type: 'radio' },
    },
  },
  render: (args) => {
    const [, updateArgs] = useArgs()
    if (!args.event) {
      return (
        <StoryOpenButton
          label='Open booking detail'
          onClick={() => updateArgs({ event: FLIGHT_EVENT })}
        />
      )
    }
    return (
      <BookingDetailModal
        {...args}
        onClose={() => updateArgs({ event: null })}
      />
    )
  },
}
export default meta

export const Flight: StoryObj<typeof BookingDetailModal> = {
  args: { event: FLIGHT_EVENT },
}

export const Theory: StoryObj<typeof BookingDetailModal> = {
  args: { event: THEORY_EVENT },
}

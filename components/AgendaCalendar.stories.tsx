import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'
import AgendaCalendar from './AgendaCalendar'
import { DUMMY_AGENDA_EVENTS } from './AgendaCalendar.data'

const meta: Meta<typeof AgendaCalendar> = {
  component: AgendaCalendar,
  title: 'Components/AgendaCalendar',
  args: {
    events: DUMMY_AGENDA_EVENTS,
    initialMonth: { year: 2026, month: 7 },
    onRefresh: fn(),
    onViewDocuments: fn(),
  },
}
export default meta

export const Default: StoryObj<typeof AgendaCalendar> = {}

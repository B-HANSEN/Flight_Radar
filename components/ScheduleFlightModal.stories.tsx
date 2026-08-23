import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'
import ScheduleFlightModal from './ScheduleFlightModal'
import {
  DUMMY_SCHEDULE_FLIGHT_AIRCRAFT,
  DUMMY_SCHEDULE_FLIGHT_TARGET,
} from './ScheduleFlightModal.data'

const meta: Meta<typeof ScheduleFlightModal> = {
  component: ScheduleFlightModal,
  title: 'Components/ScheduleFlightModal',
  args: {
    target: DUMMY_SCHEDULE_FLIGHT_TARGET,
    instructorName: 'James Whitfield',
    aircraft: DUMMY_SCHEDULE_FLIGHT_AIRCRAFT,
    onClose: fn(),
    onConfirm: fn(),
  },
}
export default meta

export const Default: StoryObj<typeof ScheduleFlightModal> = {}

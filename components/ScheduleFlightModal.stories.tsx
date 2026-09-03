import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useArgs } from 'storybook/preview-api'
import { fn } from 'storybook/test'
import StoryOpenButton from '../.storybook/StoryOpenButton'
import ScheduleFlightModal from './ScheduleFlightModal'
import {
  DUMMY_SCHEDULE_FLIGHT_AIRCRAFT,
  DUMMY_SCHEDULE_FLIGHT_INSTRUCTORS,
  DUMMY_SCHEDULE_FLIGHT_TARGET,
} from './ScheduleFlightModal.data'

const meta: Meta<typeof ScheduleFlightModal> = {
  component: ScheduleFlightModal,
  title: 'Components/Modals/ScheduleFlightModal',
  args: {
    target: null,
    instructorName: 'James Whitfield',
    currentInstructorId: 'instructor-1',
    instructors: DUMMY_SCHEDULE_FLIGHT_INSTRUCTORS,
    aircraft: DUMMY_SCHEDULE_FLIGHT_AIRCRAFT,
    onConfirm: fn(),
  },
  render: (args) => {
    const [, updateArgs] = useArgs()
    if (!args.target) {
      return (
        <StoryOpenButton
          label='Open schedule flight'
          onClick={() => updateArgs({ target: DUMMY_SCHEDULE_FLIGHT_TARGET })}
        />
      )
    }
    return (
      <ScheduleFlightModal
        {...args}
        onClose={() => updateArgs({ target: null })}
      />
    )
  },
}
export default meta

export const Default: StoryObj<typeof ScheduleFlightModal> = {}

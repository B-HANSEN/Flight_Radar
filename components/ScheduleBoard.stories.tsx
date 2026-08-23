import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'
import ScheduleBoard from './ScheduleBoard'
import {
  DUMMY_SCHEDULE_AIRCRAFT,
  DUMMY_SCHEDULE_DAY_BLOCKS,
  DUMMY_SCHEDULE_WEEK_BLOCKS,
} from './ScheduleBoard.data'

const meta: Meta<typeof ScheduleBoard> = {
  component: ScheduleBoard,
  title: 'Components/ScheduleBoard',
  args: {
    aircraft: DUMMY_SCHEDULE_AIRCRAFT,
    dayBlocks: DUMMY_SCHEDULE_DAY_BLOCKS,
    weekBlocks: DUMMY_SCHEDULE_WEEK_BLOCKS,
    initialDate: new Date(2026, 7, 9),
    onRefresh: fn(),
  },
}
export default meta

export const Default: StoryObj<typeof ScheduleBoard> = {}

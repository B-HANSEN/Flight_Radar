import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'
import ScheduleBoard from './ScheduleBoard'
import {
  DUMMY_SCHEDULE_AIRCRAFT,
  DUMMY_SCHEDULE_DAY_ROWS,
  DUMMY_SCHEDULE_WEEK_ROWS,
} from './ScheduleBoard.data'

const meta: Meta<typeof ScheduleBoard> = {
  component: ScheduleBoard,
  title: 'Components/ScheduleBoard',
  args: {
    aircraft: DUMMY_SCHEDULE_AIRCRAFT,
    dayRows: DUMMY_SCHEDULE_DAY_ROWS,
    weekRows: DUMMY_SCHEDULE_WEEK_ROWS,
    initialDate: new Date(2026, 7, 9),
    onRefresh: fn(),
  },
}
export default meta

export const Default: StoryObj<typeof ScheduleBoard> = {}

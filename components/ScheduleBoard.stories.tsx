import type { Meta, StoryObj } from '@storybook/nextjs-vite'
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
    updatedAt: new Date(2026, 7, 9, 8, 30).toISOString(),
  },
  argTypes: {
    // Both pin the story to a fixed date so the seeded blocks line up — they
    // are scaffolding, not knobs, so keep them out of the Controls panel.
    initialDate: { control: false },
    updatedAt: { control: false },
  },
}
export default meta

export const Default: StoryObj<typeof ScheduleBoard> = {}

export const FocusedFromDirectory: StoryObj<typeof ScheduleBoard> = {
  args: {
    focusArcid: 'EC-EXL',
  },
}

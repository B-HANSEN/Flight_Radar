import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'
import InstructorSchedulePanel from './InstructorSchedulePanel'
import { DUMMY_INSTRUCTOR_STUDENTS } from './InstructorSchedulePanel.data'

const meta: Meta<typeof InstructorSchedulePanel> = {
  component: InstructorSchedulePanel,
  title: 'Components/InstructorSchedulePanel',
  args: {
    instructorName: 'James Whitfield',
    weekLabel: 'Week of Aug 24',
    weekRangeLabel: '24 – 30 August',
    students: DUMMY_INSTRUCTOR_STUDENTS,
    onPreviousWeek: fn(),
    onNextWeek: fn(),
    onSchedule: fn(),
  },
}
export default meta

export const Default: StoryObj<typeof InstructorSchedulePanel> = {}

export const NoStudents: StoryObj<typeof InstructorSchedulePanel> = {
  args: {
    students: [],
  },
}

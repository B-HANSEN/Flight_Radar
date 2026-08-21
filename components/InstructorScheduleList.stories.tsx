import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'
import InstructorScheduleList from './InstructorScheduleList'
import { DUMMY_INSTRUCTOR_STUDENTS } from './InstructorScheduleList.data'

const meta: Meta<typeof InstructorScheduleList> = {
  component: InstructorScheduleList,
  title: 'Components/InstructorScheduleList',
  args: {
    instructorName: 'D. Fabri',
    weekLabel: 'Week of Aug 24',
    weekRangeLabel: '24 – 30 August',
    students: DUMMY_INSTRUCTOR_STUDENTS,
    onPreviousWeek: fn(),
    onNextWeek: fn(),
    onSchedule: fn(),
  },
}
export default meta

export const Default: StoryObj<typeof InstructorScheduleList> = {}

export const NoStudents: StoryObj<typeof InstructorScheduleList> = {
  args: {
    students: [],
  },
}

import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import InstructorScheduleView from './InstructorScheduleView'
import {
  DUMMY_SCHEDULE_REFERENCE_DATE,
  DUMMY_STUDENT_SCHEDULES,
} from './InstructorScheduleView.data'

const meta: Meta<typeof InstructorScheduleView> = {
  component: InstructorScheduleView,
  title: 'Components/InstructorScheduleView',
  args: {
    instructorName: 'James Whitfield',
    students: DUMMY_STUDENT_SCHEDULES,
    referenceDate: DUMMY_SCHEDULE_REFERENCE_DATE,
  },
}
export default meta

export const Default: StoryObj<typeof InstructorScheduleView> = {}

export const NoStudents: StoryObj<typeof InstructorScheduleView> = {
  args: {
    students: [],
  },
}

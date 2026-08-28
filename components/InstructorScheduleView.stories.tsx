import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import InstructorScheduleView from './InstructorScheduleView'
import {
  DUMMY_SCHEDULE_REFERENCE_DATE,
  DUMMY_STUDENT_SCHEDULES,
} from './InstructorScheduleView.data'
import {
  DUMMY_SCHEDULE_FLIGHT_AIRCRAFT,
  DUMMY_SCHEDULE_FLIGHT_INSTRUCTORS,
} from './ScheduleFlightModal.data'

const meta: Meta<typeof InstructorScheduleView> = {
  component: InstructorScheduleView,
  title: 'Components/InstructorScheduleView',
  args: {
    instructorName: 'James Whitfield',
    currentInstructorId: 'instructor-1',
    instructors: DUMMY_SCHEDULE_FLIGHT_INSTRUCTORS,
    students: DUMMY_STUDENT_SCHEDULES,
    aircraft: DUMMY_SCHEDULE_FLIGHT_AIRCRAFT,
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

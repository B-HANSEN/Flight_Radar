import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { mockInstructorTimeOff } from '@/lib/mockInstructorTimeOff'
import InstructorAvailability from './InstructorAvailability'
import {
  DUMMY_INSTRUCTOR_NAMES,
  DUMMY_INSTRUCTOR_TIME_OFF,
  DUMMY_REVIEW_QUEUE,
} from './InstructorAvailability.data'

const meta: Meta<typeof InstructorAvailability> = {
  component: InstructorAvailability,
  title: 'Components/InstructorAvailability',
  args: {
    entries: DUMMY_INSTRUCTOR_TIME_OFF,
    instructorId: 'instructor-1',
    instructorNames: DUMMY_INSTRUCTOR_NAMES,
  },
  // Resolve the request / approve / deny / cancel calls locally so the
  // actions work without the API (see lib/mockInstructorTimeOff).
  beforeEach: () => mockInstructorTimeOff(),
}
export default meta

type Story = StoryObj<typeof InstructorAvailability>

export const Instructor: Story = {}

export const Empty: Story = {
  args: {
    entries: [],
  },
}

export const ChiefWithReviewQueue: Story = {
  args: {
    isChief: true,
    reviewQueue: DUMMY_REVIEW_QUEUE,
  },
  beforeEach: () => mockInstructorTimeOff({ isChief: true }),
}

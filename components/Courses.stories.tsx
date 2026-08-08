import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import Courses from './Courses'
import { DUMMY_COURSE_PROGRESS } from './Courses.data'

const meta: Meta<typeof Courses> = {
  component: Courses,
  title: 'Components/Courses',
  args: {
    progress: DUMMY_COURSE_PROGRESS,
  },
}
export default meta

export const Default: StoryObj<typeof Courses> = {}

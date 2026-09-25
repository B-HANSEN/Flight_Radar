import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import StudentFileUpload from './StudentFileUpload'
import { DUMMY_STUDENT_FILES } from './StudentFileList.data'

const meta: Meta<typeof StudentFileUpload> = {
  component: StudentFileUpload,
  title: 'Components/StudentFileUpload',
  args: {
    students: [
      { id: 'student-1', name: 'Jamie Torres' },
      { id: 'student-2', name: 'Priya Shah' },
    ],
    instructorId: 'instructor-1',
    initialFiles: DUMMY_STUDENT_FILES,
  },
  argTypes: {
    students: { control: 'object' },
    instructorId: { control: 'text' },
    initialFiles: { control: 'object' },
  },
}
export default meta

export const Default: StoryObj<typeof StudentFileUpload> = {}

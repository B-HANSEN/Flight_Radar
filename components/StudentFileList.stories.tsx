import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import StudentFileList from './StudentFileList'
import { DUMMY_STUDENT_FILES } from './StudentFileList.data'

const meta: Meta<typeof StudentFileList> = {
  component: StudentFileList,
  title: 'Components/StudentFileList',
  args: {
    files: DUMMY_STUDENT_FILES,
    headingLevel: 'h2',
    loading: false,
  },
  argTypes: {
    files: { control: 'object' },
    title: { control: 'text' },
    headingLevel: { control: 'select', options: ['h2', 'h3'] },
    loading: { control: 'boolean' },
  },
}
export default meta

export const Default: StoryObj<typeof StudentFileList> = {}

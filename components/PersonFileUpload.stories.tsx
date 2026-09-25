import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import PersonFileUpload from './PersonFileUpload'
import { DUMMY_PERSON_FILES } from './PersonFileList.data'

const meta: Meta<typeof PersonFileUpload> = {
  component: PersonFileUpload,
  title: 'Components/PersonFileUpload',
  args: {
    students: [
      { id: 'student-1', name: 'Jamie Torres' },
      { id: 'student-2', name: 'Priya Shah' },
    ],
    instructorId: 'instructor-1',
    initialFiles: DUMMY_PERSON_FILES,
  },
  argTypes: {
    students: { control: 'object' },
    instructorId: { control: 'text' },
    initialFiles: { control: 'object' },
  },
}
export default meta

export const Default: StoryObj<typeof PersonFileUpload> = {}

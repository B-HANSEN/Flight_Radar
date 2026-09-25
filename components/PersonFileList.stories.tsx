import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import PersonFileList from './PersonFileList'
import { DUMMY_PERSON_FILES } from './PersonFileList.data'

const meta: Meta<typeof PersonFileList> = {
  component: PersonFileList,
  title: 'Components/PersonFileList',
  args: {
    files: DUMMY_PERSON_FILES,
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

export const Default: StoryObj<typeof PersonFileList> = {}

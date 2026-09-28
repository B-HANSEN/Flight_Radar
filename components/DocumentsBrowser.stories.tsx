import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import DocumentsBrowser from './DocumentsBrowser'
import { DUMMY_DOCUMENT_FOLDERS } from './DocumentsBrowser.data'

const meta: Meta<typeof DocumentsBrowser> = {
  component: DocumentsBrowser,
  title: 'Components/DocumentsBrowser',
  args: {
    folders: DUMMY_DOCUMENT_FOLDERS,
  },
  argTypes: {
    // Set it to show the instructor's upload form inside an open folder.
    instructorId: { control: 'text' },
  },
}
export default meta

export const Default: StoryObj<typeof DocumentsBrowser> = {}

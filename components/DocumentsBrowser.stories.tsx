import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import DocumentsBrowser from './DocumentsBrowser'
import { DUMMY_DOCUMENT_FOLDERS } from './DocumentsBrowser.data'

const meta: Meta<typeof DocumentsBrowser> = {
  component: DocumentsBrowser,
  title: 'Components/DocumentsBrowser',
  args: {
    folders: DUMMY_DOCUMENT_FOLDERS,
  },
}
export default meta

export const Default: StoryObj<typeof DocumentsBrowser> = {}

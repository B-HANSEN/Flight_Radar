import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import DocumentUpload from './DocumentUpload'

const meta: Meta<typeof DocumentUpload> = {
  component: DocumentUpload,
  title: 'Components/DocumentUpload',
  args: {
    folder: { id: 'ec-erv', name: 'EC-ERV' },
    instructorId: 'instructor-1',
  },
  argTypes: {
    folder: { control: 'object' },
    instructorId: { control: 'text' },
  },
}
export default meta

export const Default: StoryObj<typeof DocumentUpload> = {}

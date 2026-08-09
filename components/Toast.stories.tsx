import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'
import Toast from './Toast'

const meta: Meta<typeof Toast> = {
  component: Toast,
  title: 'Components/Toast',
  args: {
    message: 'Fetching…',
    open: true,
    onClose: fn(),
    durationMs: 3000,
  },
  argTypes: {
    message: { control: 'text' },
    open: { control: 'boolean' },
    durationMs: { control: 'number' },
  },
}
export default meta

export const Default: StoryObj<typeof Toast> = {}

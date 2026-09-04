import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import ErrorCard from './ErrorCard'

const meta: Meta<typeof ErrorCard> = {
  component: ErrorCard,
  title: 'Components/ErrorCard',
  argTypes: {
    title: { control: 'text' },
    body: { control: 'text' },
    cta: { control: 'text' },
    onRetry: { action: 'retry' },
  },
}
export default meta

export const Default: StoryObj<typeof ErrorCard> = {
  args: {
    title: 'Something knocked us off course.',
    body: 'An unexpected error interrupted this page. Give it another try — it often clears up on a second attempt.',
    cta: 'Try again',
  },
}

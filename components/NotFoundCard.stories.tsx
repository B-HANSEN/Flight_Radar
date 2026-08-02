import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import NotFoundCard from './NotFoundCard'

const meta: Meta<typeof NotFoundCard> = {
  component: NotFoundCard,
  title: 'Components/NotFoundCard',
  argTypes: {
    title: { control: 'text' },
    body: { control: 'text' },
    cta: { control: 'text' },
  },
}
export default meta

export const Default: StoryObj<typeof NotFoundCard> = {
  args: {
    title: 'Looks like this page went off the radar.',
    body: "We scanned the whole airspace and couldn't find it. It may have moved, or never took off.",
    cta: 'Back to Home',
  },
}

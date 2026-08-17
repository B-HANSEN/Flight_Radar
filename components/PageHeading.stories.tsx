import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import PageHeading from './PageHeading'

const meta: Meta<typeof PageHeading> = {
  component: PageHeading,
  title: 'Components/PageHeading',
}
export default meta

type Story = StoryObj<typeof PageHeading>

export const Default: Story = {
  args: { title: 'Welcome to Flight Radar' },
}

export const WithDescription: Story = {
  args: {
    title: 'Welcome',
    description: 'Manage courses, aircraft and student progress.',
  },
}

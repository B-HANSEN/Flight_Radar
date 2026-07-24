import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import Nav from './Nav'

const meta: Meta<typeof Nav> = {
  component: Nav,
  title: 'Components/Nav',
}
export default meta

export const Default: StoryObj<typeof Nav> = {}

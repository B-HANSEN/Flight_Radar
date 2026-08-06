import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import NavClock from './NavClock'

const meta: Meta<typeof NavClock> = {
  component: NavClock,
  title: 'Components/NavClock',
}
export default meta

export const Default: StoryObj<typeof NavClock> = {}

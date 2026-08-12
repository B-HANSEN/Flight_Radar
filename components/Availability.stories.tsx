import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import Availability from './Availability'
import { DUMMY_AVAILABILITY_ENTRIES } from './Availability.data'

const meta: Meta<typeof Availability> = {
  component: Availability,
  title: 'Components/Availability',
  args: {
    entries: DUMMY_AVAILABILITY_ENTRIES,
  },
}
export default meta

export const Default: StoryObj<typeof Availability> = {}

export const Empty: StoryObj<typeof Availability> = {
  args: {
    entries: [],
  },
}

import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import AircraftDirectory from './AircraftDirectory'
import { DUMMY_FLEET } from './AircraftDirectory.data'

const meta: Meta<typeof AircraftDirectory> = {
  component: AircraftDirectory,
  title: 'Components/AircraftDirectory',
  argTypes: {
    pageSize: { control: 'number' },
  },
  args: {
    aircraft: DUMMY_FLEET,
    pageSize: 10,
  },
}
export default meta

export const Default: StoryObj<typeof AircraftDirectory> = {}

export const NoResults: StoryObj<typeof AircraftDirectory> = {
  args: {
    aircraft: [],
  },
}

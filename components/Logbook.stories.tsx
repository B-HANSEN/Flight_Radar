import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import Logbook from './Logbook'
import { DUMMY_LOGBOOK_ENTRIES } from './Logbook.data'

const meta: Meta<typeof Logbook> = {
  component: Logbook,
  title: 'Components/Logbook',
  argTypes: {
    pageSize: { control: 'number' },
  },
  args: {
    entries: DUMMY_LOGBOOK_ENTRIES,
    pageSize: 10,
  },
}
export default meta

export const Default: StoryObj<typeof Logbook> = {}

export const Empty: StoryObj<typeof Logbook> = {
  args: {
    entries: [],
  },
}

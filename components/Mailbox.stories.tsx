import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import Mailbox from './Mailbox'
import { DUMMY_MAILBOX_EMAILS } from './Mailbox.data'

const meta: Meta<typeof Mailbox> = {
  component: Mailbox,
  title: 'Components/Mailbox',
  args: {
    emails: DUMMY_MAILBOX_EMAILS,
    recipientName: 'Jamie Torres',
  },
  argTypes: {
    recipientName: { control: 'text' },
  },
}
export default meta

export const Default: StoryObj<typeof Mailbox> = {}

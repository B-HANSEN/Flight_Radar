import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import Mailbox from './Mailbox'
import {
  DUMMY_MAILBOX_EMAILS,
  DUMMY_MAILBOX_PEOPLE,
  DUMMY_MAILBOX_SENT,
} from './Mailbox.data'

const meta: Meta<typeof Mailbox> = {
  component: Mailbox,
  title: 'Components/Mailbox',
  args: {
    emails: DUMMY_MAILBOX_EMAILS,
    sentEmails: DUMMY_MAILBOX_SENT,
    people: DUMMY_MAILBOX_PEOPLE,
    currentPersonId: 'student-jamie',
    currentPersonName: 'Jamie Torres',
    currentPersonRole: 'Student',
    canSendAsDesk: false,
  },
  argTypes: {
    currentPersonName: { control: 'text' },
    currentPersonRole: { control: 'text' },
    canSendAsDesk: { control: 'boolean' },
  },
}
export default meta

export const Default: StoryObj<typeof Mailbox> = {}

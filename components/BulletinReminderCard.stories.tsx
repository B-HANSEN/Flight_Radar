import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import BulletinReminderCard from './BulletinReminderCard'

const meta: Meta<typeof BulletinReminderCard> = {
  component: BulletinReminderCard,
  title: 'Components/BulletinReminderCard',
}
export default meta

export const Default: StoryObj<typeof BulletinReminderCard> = {}

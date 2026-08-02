import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import BulletinMaintenanceCard from './BulletinMaintenanceCard'

const meta: Meta<typeof BulletinMaintenanceCard> = {
  component: BulletinMaintenanceCard,
  title: 'Components/BulletinMaintenanceCard',
}
export default meta

export const Default: StoryObj<typeof BulletinMaintenanceCard> = {}

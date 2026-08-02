import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import BulletinProcedureCard from './BulletinProcedureCard'

const meta: Meta<typeof BulletinProcedureCard> = {
  component: BulletinProcedureCard,
  title: 'Components/BulletinProcedureCard',
}
export default meta

export const Default: StoryObj<typeof BulletinProcedureCard> = {}

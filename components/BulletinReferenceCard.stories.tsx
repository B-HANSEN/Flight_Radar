import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import BulletinReferenceCard from './BulletinReferenceCard'

const meta: Meta<typeof BulletinReferenceCard> = {
  component: BulletinReferenceCard,
  title: 'Components/BulletinReferenceCard',
}
export default meta

export const Default: StoryObj<typeof BulletinReferenceCard> = {}

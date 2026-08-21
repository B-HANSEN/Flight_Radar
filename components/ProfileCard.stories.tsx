import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'
import ProfileCard from './ProfileCard'

const meta: Meta<typeof ProfileCard> = {
  component: ProfileCard,
  title: 'Components/ProfileCard',
  argTypes: {
    name: { control: 'text' },
    avatarSrc: { control: 'text' },
    email: { control: 'text' },
    phone: { control: 'text' },
    birthday: { control: 'text' },
    info: { control: 'text' },
    role: { control: 'text' },
    emergencyContact: { control: 'object' },
  },
  args: {
    name: 'Torres, Jamie',
    email: 'jamie.torres@example.com',
    phone: '+34 600 123 456',
    birthday: '14 March 1994',
    info: 'PPL online · Q1 2025',
    role: 'Student',
    emergencyContact: {
      name: 'Jane Doe',
      relation: 'Sister',
      phone: '+34 600 987 654',
    },
    onEdit: fn(),
    onLock: fn(),
  },
}
export default meta

export const Default: StoryObj<typeof ProfileCard> = {}

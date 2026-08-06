import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useArgs } from 'storybook/preview-api'
import Modal from './Modal'

const meta: Meta<typeof Modal> = {
  component: Modal,
  title: 'Components/Modal',
  argTypes: {
    isOpen: { control: 'boolean' },
    title: { control: 'text' },
    closeLabel: { control: 'text' },
  },
  args: {
    isOpen: true,
    title: 'Booking details',
    closeLabel: 'Close',
  },
}
export default meta

export const Default: StoryObj<typeof Modal> = {
  render: (args) => {
    const [, updateArgs] = useArgs()
    return (
      <Modal {...args} onClose={() => updateArgs({ isOpen: false })}>
        <p className='font-secondary text-xs font-semibold text-black-200'>
          18:10 - 20:20 · EC-ERV · Mike Murdoch [PIC]
        </p>
        <p className='font-secondary text-sm text-black-300'>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
        <p className='font-secondary text-sm text-black-300'>
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
          dolore eu fugiat nulla pariatur.
        </p>
      </Modal>
    )
  },
}

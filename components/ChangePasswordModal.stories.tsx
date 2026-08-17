import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useArgs } from 'storybook/preview-api'
import ChangePasswordModal from './ChangePasswordModal'

const meta: Meta<typeof ChangePasswordModal> = {
  component: ChangePasswordModal,
  title: 'Components/Modals/ChangePasswordModal',
  args: {
    isOpen: true,
  },
  argTypes: {
    isOpen: { control: 'boolean' },
  },
}
export default meta

export const Default: StoryObj<typeof ChangePasswordModal> = {
  render: (args) => {
    const [, updateArgs] = useArgs()
    return (
      <ChangePasswordModal
        {...args}
        onClose={() => updateArgs({ isOpen: false })}
      />
    )
  },
}

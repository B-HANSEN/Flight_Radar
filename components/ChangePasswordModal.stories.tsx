import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useArgs } from 'storybook/preview-api'
import StoryOpenButton from '../.storybook/StoryOpenButton'
import ChangePasswordModal from './ChangePasswordModal'

const meta: Meta<typeof ChangePasswordModal> = {
  component: ChangePasswordModal,
  title: 'Components/Modals/ChangePasswordModal',
  args: {
    isOpen: false,
  },
  argTypes: {
    isOpen: { control: 'boolean' },
  },
}
export default meta

export const Default: StoryObj<typeof ChangePasswordModal> = {
  render: (args) => {
    const [, updateArgs] = useArgs()
    if (!args.isOpen) {
      return (
        <StoryOpenButton
          label='Open change password'
          onClick={() => updateArgs({ isOpen: true })}
        />
      )
    }
    return (
      <ChangePasswordModal
        {...args}
        onClose={() => updateArgs({ isOpen: false })}
      />
    )
  },
}

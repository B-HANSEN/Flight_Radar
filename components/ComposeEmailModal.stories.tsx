import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useArgs } from 'storybook/preview-api'
import StoryOpenButton from '../.storybook/StoryOpenButton'
import ComposeEmailModal from './ComposeEmailModal'
import { DUMMY_MAILBOX_PEOPLE } from './Mailbox.data'

const meta: Meta<typeof ComposeEmailModal> = {
  component: ComposeEmailModal,
  title: 'Components/Modals/ComposeEmailModal',
  args: {
    isOpen: false,
    people: DUMMY_MAILBOX_PEOPLE,
    canSendAsDesk: true,
  },
  argTypes: {
    canSendAsDesk: { control: 'boolean' },
  },
}
export default meta

export const Default: StoryObj<typeof ComposeEmailModal> = {
  render: (args) => {
    const [, updateArgs] = useArgs()
    if (!args.isOpen) {
      return (
        <StoryOpenButton
          label='Compose email'
          onClick={() => updateArgs({ isOpen: true })}
        />
      )
    }
    return (
      <ComposeEmailModal
        {...args}
        onClose={() => updateArgs({ isOpen: false })}
        onSend={(values) => {
          window.alert(JSON.stringify(values, null, 2))
          updateArgs({ isOpen: false })
        }}
      />
    )
  },
}

import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useArgs } from 'storybook/preview-api'
import StoryOpenButton from '../.storybook/StoryOpenButton'
import TimePickerModal from './TimePickerModal'

const meta: Meta<typeof TimePickerModal> = {
  component: TimePickerModal,
  title: 'Components/Modals/TimePickerModal',
  argTypes: {
    isOpen: { control: 'boolean' },
    initialTime: { control: 'text' },
  },
  args: {
    isOpen: false,
    initialTime: '08:00',
  },
}
export default meta

export const Default: StoryObj<typeof TimePickerModal> = {
  render: (args) => {
    const [, updateArgs] = useArgs()
    if (!args.isOpen) {
      return (
        <StoryOpenButton
          label='Open time picker'
          onClick={() => updateArgs({ isOpen: true })}
        />
      )
    }
    return (
      <TimePickerModal
        {...args}
        onCancel={() => updateArgs({ isOpen: false })}
        onConfirm={(time) => updateArgs({ isOpen: false, initialTime: time })}
      />
    )
  },
}

import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useArgs } from 'storybook/preview-api'
import StoryOpenButton from '../.storybook/StoryOpenButton'
import DatePickerModal from './DatePickerModal'

const meta: Meta<typeof DatePickerModal> = {
  component: DatePickerModal,
  title: 'Components/Modals/DatePickerModal',
  argTypes: {
    isOpen: { control: 'boolean' },
    initialDate: { control: 'text' },
  },
  args: {
    isOpen: false,
    initialDate: '27/08/2026',
  },
}
export default meta

export const Default: StoryObj<typeof DatePickerModal> = {
  render: (args) => {
    const [, updateArgs] = useArgs()
    if (!args.isOpen) {
      return (
        <StoryOpenButton
          label='Open date picker'
          onClick={() => updateArgs({ isOpen: true })}
        />
      )
    }
    return (
      <DatePickerModal
        {...args}
        onCancel={() => updateArgs({ isOpen: false })}
        onConfirm={(date) => updateArgs({ isOpen: false, initialDate: date })}
      />
    )
  },
}

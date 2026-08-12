import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useArgs } from 'storybook/preview-api'
import DatePickerModal from './DatePickerModal'

const meta: Meta<typeof DatePickerModal> = {
  component: DatePickerModal,
  title: 'Components/Modals/DatePickerModal',
  argTypes: {
    isOpen: { control: 'boolean' },
    initialDate: { control: 'text' },
  },
  args: {
    isOpen: true,
    initialDate: '27/08/2026',
  },
}
export default meta

export const Default: StoryObj<typeof DatePickerModal> = {
  render: (args) => {
    const [, updateArgs] = useArgs()
    return (
      <DatePickerModal
        {...args}
        onCancel={() => updateArgs({ isOpen: false })}
        onConfirm={(date) => updateArgs({ isOpen: false, initialDate: date })}
      />
    )
  },
}

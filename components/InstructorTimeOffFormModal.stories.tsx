import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useArgs } from 'storybook/preview-api'
import StoryOpenButton from '../.storybook/StoryOpenButton'
import InstructorTimeOffFormModal from './InstructorTimeOffFormModal'

const meta: Meta<typeof InstructorTimeOffFormModal> = {
  component: InstructorTimeOffFormModal,
  title: 'Components/Modals/InstructorTimeOffFormModal',
  args: {
    isOpen: false,
  },
}
export default meta

export const Default: StoryObj<typeof InstructorTimeOffFormModal> = {
  render: (args) => {
    const [, updateArgs] = useArgs()
    if (!args.isOpen) {
      return (
        <StoryOpenButton
          label='Open time off request'
          onClick={() => updateArgs({ isOpen: true })}
        />
      )
    }
    return (
      <InstructorTimeOffFormModal
        {...args}
        onClose={() => updateArgs({ isOpen: false })}
        onSave={(values) => {
          window.alert(JSON.stringify(values, null, 2))
          updateArgs({ isOpen: false })
        }}
      />
    )
  },
}

import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useArgs } from 'storybook/preview-api'
import EmergencyContactModal from './EmergencyContactModal'

const meta: Meta<typeof EmergencyContactModal> = {
  component: EmergencyContactModal,
  title: 'Components/Modals/EmergencyContactModal',
  args: {
    isOpen: true,
    emergencyContact: {
      name: 'Jane Doe',
      relation: 'Sister',
      phone: '+34 600 987 654',
    },
  },
  argTypes: {
    isOpen: { control: 'boolean' },
    emergencyContact: { control: 'object' },
  },
}
export default meta

export const Default: StoryObj<typeof EmergencyContactModal> = {
  render: (args) => {
    const [, updateArgs] = useArgs()
    return (
      <EmergencyContactModal
        {...args}
        onClose={() => updateArgs({ isOpen: false })}
        onSave={(values) =>
          updateArgs({ isOpen: false, emergencyContact: values })
        }
        onDelete={() =>
          updateArgs({
            isOpen: false,
            emergencyContact: { name: '', relation: '', phone: '' },
          })
        }
      />
    )
  },
}

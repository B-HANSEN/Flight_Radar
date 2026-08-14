import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useArgs } from 'storybook/preview-api'
import FlightEvaluationModal from './FlightEvaluationModal'
import { DUMMY_FLIGHT_EVALUATIONS } from './Signatures.data'

const meta: Meta<typeof FlightEvaluationModal> = {
  component: FlightEvaluationModal,
  title: 'Components/Modals/FlightEvaluationModal',
  args: {
    flight: DUMMY_FLIGHT_EVALUATIONS.at(-1),
  },
}
export default meta

export const Default: StoryObj<typeof FlightEvaluationModal> = {
  render: (args) => {
    const [, updateArgs] = useArgs()
    return (
      <FlightEvaluationModal
        {...args}
        onClose={() => updateArgs({ flight: null })}
        onSign={(flight) => updateArgs({ flight: { ...flight, signed: true } })}
      />
    )
  },
}

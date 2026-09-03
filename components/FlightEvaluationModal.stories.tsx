import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useArgs } from 'storybook/preview-api'
import StoryOpenButton from '../.storybook/StoryOpenButton'
import FlightEvaluationModal from './FlightEvaluationModal'
import { DUMMY_FLIGHT_EVALUATIONS } from './Signatures.data'

const SAMPLE_FLIGHT = DUMMY_FLIGHT_EVALUATIONS.at(-1)

const meta: Meta<typeof FlightEvaluationModal> = {
  component: FlightEvaluationModal,
  title: 'Components/Modals/FlightEvaluationModal',
  args: {
    flight: null,
  },
}
export default meta

export const Default: StoryObj<typeof FlightEvaluationModal> = {
  render: (args) => {
    const [, updateArgs] = useArgs()
    if (!args.flight) {
      return (
        <StoryOpenButton
          label='Open flight evaluation'
          onClick={() => updateArgs({ flight: SAMPLE_FLIGHT })}
        />
      )
    }
    return (
      <FlightEvaluationModal
        {...args}
        onClose={() => updateArgs({ flight: null })}
        onSign={(flight) => updateArgs({ flight: { ...flight, signed: true } })}
      />
    )
  },
}

import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { mockFlightEvaluationSign } from '@/lib/mockFlightEvaluationSign'
import Signatures from './Signatures'
import { DUMMY_FLIGHT_EVALUATIONS } from './Signatures.data'

const meta: Meta<typeof Signatures> = {
  component: Signatures,
  title: 'Components/Signatures',
  args: {
    flights: DUMMY_FLIGHT_EVALUATIONS,
  },
  beforeEach: () => mockFlightEvaluationSign(DUMMY_FLIGHT_EVALUATIONS),
}
export default meta

export const Default: StoryObj<typeof Signatures> = {}

export const Empty: StoryObj<typeof Signatures> = {
  args: {
    flights: [],
  },
}

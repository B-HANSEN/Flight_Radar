import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { mockFlightEvaluationSign } from '@/lib/mockFlightEvaluationSign'
import HomepageSignatures from './HomepageSignatures'
import { DUMMY_SIGNATURES } from './Homepage.data'

const meta: Meta<typeof HomepageSignatures> = {
  component: HomepageSignatures,
  title: 'Components/HomepageSignatures',
  argTypes: {
    underDevelopment: { control: 'boolean' },
  },
  args: {
    signatures: DUMMY_SIGNATURES,
    underDevelopment: false,
  },
  beforeEach: () => mockFlightEvaluationSign(DUMMY_SIGNATURES),
}
export default meta

export const Default: StoryObj<typeof HomepageSignatures> = {}

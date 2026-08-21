import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { mockFlightEvaluationSign } from '@/lib/mockFlightEvaluationSign'
import Homepage from './Homepage'
import {
  DUMMY_BOOKINGS,
  DUMMY_NEWS,
  DUMMY_SIGNATURES,
  DUMMY_WEATHER,
} from './Homepage.data'

const meta: Meta<typeof Homepage> = {
  component: Homepage,
  title: 'Components/Homepage',
  argTypes: {
    name: { control: 'text' },
  },
  args: {
    name: 'Jamie Torres',
    weather: DUMMY_WEATHER,
    bookings: DUMMY_BOOKINGS,
    signatures: DUMMY_SIGNATURES,
    news: DUMMY_NEWS.slice(0, 3),
  },
  beforeEach: () => mockFlightEvaluationSign(DUMMY_SIGNATURES),
}
export default meta

export const Default: StoryObj<typeof Homepage> = {}

export const Empty: StoryObj<typeof Homepage> = {
  args: {
    weather: [],
    bookings: [],
    signatures: [],
    news: [],
  },
}

import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import NewsFeed from './NewsFeed'
import { DUMMY_NEWS } from './Homepage.data'

const meta: Meta<typeof NewsFeed> = {
  component: NewsFeed,
  title: 'Components/NewsFeed',
  args: {
    news: DUMMY_NEWS,
  },
}
export default meta

export const Default: StoryObj<typeof NewsFeed> = {}

export const Empty: StoryObj<typeof NewsFeed> = {
  args: {
    news: [],
  },
}

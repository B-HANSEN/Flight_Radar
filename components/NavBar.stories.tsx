import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useArgs } from 'storybook/preview-api'
import { fn } from 'storybook/test'
import NavBar from './NavBar'

const meta: Meta<typeof NavBar> = {
  component: NavBar,
  title: 'Components/NavBar',
  argTypes: {
    activePath: {
      control: 'select',
      options: ['/', '/me', '/news', '/schedule', '/aircraft', '/documents'],
    },
    collapsed: {
      control: 'boolean',
    },
  },
  args: {
    onMenuClick: fn(),
  },
}
export default meta

export const Default: StoryObj<typeof NavBar> = {
  args: {
    activePath: '/',
    collapsed: false,
  },
  render: (args) => {
    const [, updateArgs] = useArgs()
    return (
      <NavBar
        {...args}
        onItemClick={(href) => updateArgs({ activePath: href })}
      />
    )
  },
}

import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import DragScrollRegion from './DragScrollRegion'

const meta: Meta<typeof DragScrollRegion> = {
  component: DragScrollRegion,
  title: 'Components/DragScrollRegion',
  argTypes: {
    axis: { control: 'select', options: ['x', 'y'] },
  },
  args: {
    axis: 'x',
    role: 'group',
    'aria-label': 'Scrollable content',
    className: 'flex max-w-sm gap-4 overflow-auto rounded-xl border p-4',
    children: Array.from({ length: 12 }, (_, i) => (
      <span key={i} className='flex-none rounded-sm bg-black-100 px-4 py-2'>
        Item {i + 1}
      </span>
    )),
  },
}
export default meta

export const Default: StoryObj<typeof DragScrollRegion> = {}

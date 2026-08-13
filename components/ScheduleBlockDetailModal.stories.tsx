import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useArgs } from 'storybook/preview-api'
import ScheduleBlockDetailModal from './ScheduleBlockDetailModal'
import type { ScheduleBlockDetail } from './ScheduleBoard.types'

const SAMPLE_DETAIL: ScheduleBlockDetail = {
  aircraft: { id: 'ec-erv', arcid: 'EC-ERV', type: 'Cessna 152' },
  block: {
    id: 'b1',
    label: 'Reserved 09:00–12:00',
    kind: 'reserved',
    start: 9,
    end: 12,
  },
  timeLabel: 'Sunday, Aug 9, 2026 · 09:00 – 12:00',
}

const meta: Meta<typeof ScheduleBlockDetailModal> = {
  component: ScheduleBlockDetailModal,
  title: 'Components/Modals/ScheduleBlockDetailModal',
  args: {
    detail: SAMPLE_DETAIL,
  },
}
export default meta

export const Default: StoryObj<typeof ScheduleBlockDetailModal> = {
  render: (args) => {
    const [, updateArgs] = useArgs()
    return (
      <ScheduleBlockDetailModal
        {...args}
        onClose={() => updateArgs({ detail: null })}
      />
    )
  },
}

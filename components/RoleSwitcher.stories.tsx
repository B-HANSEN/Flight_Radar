import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useArgs } from 'storybook/preview-api'
import { fn } from 'storybook/test'
import RoleSwitcher from './RoleSwitcher'
import { DUMMY_STUDENTS } from './RoleSwitcher.data'

const meta: Meta<typeof RoleSwitcher> = {
  component: RoleSwitcher,
  title: 'Components/RoleSwitcher',
  args: {
    currentUser: { name: 'James Whitfield', initials: 'JW' },
    students: DUMMY_STUDENTS,
    selectedStudentId:
      DUMMY_STUDENTS.find((student) => student.name === 'Jamie Torres')?.id ??
      null,
    onSelect: fn(),
  },
}
export default meta

export const Default: StoryObj<typeof RoleSwitcher> = {
  render: (args) => {
    const [, updateArgs] = useArgs()
    return (
      <RoleSwitcher
        {...args}
        onSelect={(student) => {
          args.onSelect?.(student)
          updateArgs({ selectedStudentId: student?.id ?? null })
        }}
      />
    )
  },
}

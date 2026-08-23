import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useArgs } from 'storybook/preview-api'
import { fn } from 'storybook/test'
import RoleSwitcher from './RoleSwitcher'
import { DUMMY_INSTRUCTORS, DUMMY_STUDENTS } from './RoleSwitcher.data'

const meta: Meta<typeof RoleSwitcher> = {
  component: RoleSwitcher,
  title: 'Components/RoleSwitcher',
  args: {
    instructors: DUMMY_INSTRUCTORS,
    students: DUMMY_STUDENTS,
    selectedStudentId:
      DUMMY_STUDENTS.find((student) => student.name === 'Jamie Torres')?.id ??
      null,
    onSelectStudent: fn(),
    onSelectInstructor: fn(),
  },
}
export default meta

export const Default: StoryObj<typeof RoleSwitcher> = {
  render: (args) => {
    const [, updateArgs] = useArgs()
    return (
      <RoleSwitcher
        {...args}
        onSelectStudent={(student) => {
          args.onSelectStudent?.(student)
          updateArgs({ selectedStudentId: student.id })
        }}
        onSelectInstructor={(instructor) => {
          args.onSelectInstructor?.(instructor)
          updateArgs({
            selectedStudentId: null,
            selectedInstructorId: instructor.id,
          })
        }}
      />
    )
  },
}

export type InstructorScheduleSlot = {
  id: string
  day: string
  time: string
}

export type InstructorScheduleStudent = {
  id: string
  name: string
  course: string
  slots: InstructorScheduleSlot[]
}

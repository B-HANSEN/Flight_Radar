export type RawScheduleSlot = {
  id: string
  date: string
  startTime: string
  endTime: string
}

export type RawStudentSchedule = {
  id: string
  name: string
  course: string
  slots: RawScheduleSlot[]
}

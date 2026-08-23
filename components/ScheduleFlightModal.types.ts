import type { RawScheduleSlot } from './InstructorScheduleView.types'

export type ScheduleFlightTarget = {
  studentId: string
  studentName: string
  slot: RawScheduleSlot
}

export type ScheduleFlightConfirmInput = {
  studentId: string
  aircraftId: string
  date: string
  startTime: string
  endTime: string
  lessonType: string
  comments?: string
}

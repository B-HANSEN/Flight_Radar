import type { RawScheduleSlot } from './InstructorScheduleView.types'
import type { ScheduleBlockKind } from './ScheduleBoard.types'

export type ScheduleFlightTarget = {
  studentId: string
  studentName: string
  slot: RawScheduleSlot
}

// An aircraft that isn't available for the date/time window being booked —
// either a real conflicting booking or a seeded maintenance/hold/unavailable
// demo block (see server's ScheduleService.findBusyAircraft).
export type AircraftAvailability = {
  aircraftId: string
  kind: ScheduleBlockKind
  label: string
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

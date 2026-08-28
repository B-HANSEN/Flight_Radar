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

// A flight the target student already has booked that day (see server's
// ScheduleService.findStudentFlights) — shown so the instructor can see it
// and kept clear of by the 90 min buffer enforced below.
export type ScheduledFlight = {
  id: string
  startTime: string
  endTime: string
  label: string
}

export type ScheduleFlightConfirmInput = {
  studentId: string
  aircraftId: string
  instructorId: string
  date: string
  startTime: string
  endTime: string
  lessonType: string
  comments?: string
}

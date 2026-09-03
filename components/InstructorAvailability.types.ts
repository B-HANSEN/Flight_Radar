// Mirrors the server InstructorTimeOff schema. A 'regular' day off is the
// standing weekly entitlement (granted on request); 'personal' leave needs
// the Chief Flight Instructor's approval unless the CFI asks for it.
export type InstructorTimeOffType = 'regular' | 'personal'
export type InstructorTimeOffStatus = 'approved' | 'pending' | 'denied'

export type InstructorTimeOffEntry = {
  id: string
  instructorId: string
  // ISO date, YYYY-MM-DD.
  date: string
  type: InstructorTimeOffType
  status: InstructorTimeOffStatus
  reason?: string
}

export type InstructorTimeOffFormValues = {
  // ISO date, YYYY-MM-DD.
  date: string
  type: InstructorTimeOffType
  reason: string
}

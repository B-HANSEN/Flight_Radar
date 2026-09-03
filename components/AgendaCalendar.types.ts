export type CalendarEventBase = {
  id: string
  date: string
}

export type UnavailabilityEvent = CalendarEventBase & {
  type: 'unavailability'
  // An instructor's day off the CFI hasn't approved yet — shown as a
  // request ("Leave requested") rather than a confirmed day off.
  pending?: boolean
} & ({ allDay: true } | { allDay: false; timeRange: string })

export type BookingEvent = CalendarEventBase & {
  type: 'booking'
  time: string
  // Absent for a Theory (ground-school) lesson.
  tailNumber?: string
  instructorName: string
  studentName: string
  lessonType: string
  // Hardcoded syllabus code for a flight lesson (resolved via
  // lib/trainingContent.ts); absent for Theory lessons.
  trainingCode?: string
  // Instructor's free-text note — the `/schedule` comments block. For a
  // Theory lesson this is the topic shown on the card, and what the detail
  // modal's blurb is matched from.
  comments?: string
  cancelled?: boolean
}

export type CalendarEvent = UnavailabilityEvent | BookingEvent

// Whose agenda is being viewed — a student sees the instructor's name on each
// booking, an instructor sees the student's.
export type AgendaPerspective = 'student' | 'instructor'

// A ground-school lesson: no aircraft, topic from the comment (see
// AgendaCalendar / BookingDetailModal, which render it differently to flights).
export function isTheory(event: Pick<BookingEvent, 'lessonType'>): boolean {
  return event.lessonType.toLowerCase() === 'theory'
}

import type { InstructorTimeOffEntry } from './InstructorAvailability.types'

// Storybook fixture — two days off in one ISO week (so the week header shows
// "2 days off"), plus a pending request in a later week.
export const DUMMY_INSTRUCTOR_TIME_OFF: InstructorTimeOffEntry[] = [
  {
    id: 'ito-1',
    instructorId: 'instructor-1',
    date: '2026-09-15',
    type: 'regular',
    status: 'approved',
  },
  {
    id: 'ito-2',
    instructorId: 'instructor-1',
    date: '2026-09-17',
    type: 'personal',
    status: 'approved',
    reason: 'Medical renewal in Madrid',
  },
  {
    id: 'ito-3',
    instructorId: 'instructor-1',
    date: '2026-10-01',
    type: 'personal',
    status: 'pending',
    reason: 'Family wedding',
  },
]

// Other instructors' pending requests, as the CFI sees them — two land in
// the same week.
export const DUMMY_REVIEW_QUEUE: InstructorTimeOffEntry[] = [
  {
    id: 'ito-9',
    instructorId: 'instructor-2',
    date: '2026-09-16',
    type: 'personal',
    status: 'pending',
    reason: "Daughter's graduation",
  },
  {
    id: 'ito-10',
    instructorId: 'instructor-2',
    date: '2026-09-18',
    type: 'personal',
    status: 'pending',
    reason: 'Course exam in Barcelona',
  },
  {
    id: 'ito-11',
    instructorId: 'instructor-2',
    date: '2026-10-07',
    type: 'personal',
    status: 'pending',
    reason: 'House move',
  },
]

export const DUMMY_INSTRUCTOR_NAMES: Record<string, string> = {
  'instructor-1': 'James Whitfield',
  'instructor-2': 'Kate Ashford',
}

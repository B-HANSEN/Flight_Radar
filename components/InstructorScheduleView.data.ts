import type { RawStudentSchedule } from './InstructorScheduleView.types'

// Wednesday within the week these fixtures' slots fall in (week of 24 Aug
// 2026) — pass as `referenceDate` so stories/tests don't depend on today.
export const DUMMY_SCHEDULE_REFERENCE_DATE = new Date(2026, 7, 26)

export const DUMMY_STUDENT_SCHEDULES: RawStudentSchedule[] = [
  {
    id: 'student-1',
    name: 'Alex Moreau',
    course: 'CPL Flight Phase',
    slots: [
      {
        id: 'slot-1',
        date: '2026-08-24',
        startTime: '09:00',
        endTime: '11:00',
      },
      {
        id: 'slot-2',
        date: '2026-08-26',
        startTime: '14:00',
        endTime: '16:00',
      },
    ],
  },
  {
    id: 'student-2',
    name: 'Jamie Torres',
    course: 'PPL Flight Phase',
    slots: [
      {
        id: 'slot-3',
        date: '2026-08-25',
        startTime: '08:00',
        endTime: '10:00',
      },
      {
        id: 'slot-4',
        date: '2026-08-27',
        startTime: '13:00',
        endTime: '17:00',
      },
      {
        id: 'slot-5',
        date: '2026-08-28',
        startTime: '09:00',
        endTime: '12:00',
      },
    ],
  },
  {
    id: 'student-3',
    name: 'Priya Shah',
    course: 'PPL Flight Phase',
    slots: [
      {
        id: 'slot-6',
        date: '2026-08-26',
        startTime: '10:00',
        endTime: '13:00',
      },
    ],
  },
  {
    id: 'student-4',
    name: 'Noah Becker',
    course: 'PPL Flight Phase',
    slots: [
      {
        id: 'slot-7',
        date: '2026-08-27',
        startTime: '15:00',
        endTime: '18:00',
      },
      {
        id: 'slot-8',
        date: '2026-08-29',
        startTime: '09:00',
        endTime: '12:00',
      },
    ],
  },
]

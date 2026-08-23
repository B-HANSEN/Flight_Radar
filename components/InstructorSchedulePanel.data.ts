import type { InstructorScheduleStudent } from './InstructorSchedulePanel.types'

export const DUMMY_INSTRUCTOR_STUDENTS: InstructorScheduleStudent[] = [
  {
    id: 'student-1',
    name: 'Alex Moreau',
    course: 'IR Flight Phase',
    slots: [
      { id: 'slot-1', day: 'Mon 24', time: '09:00 - 11:00' },
      { id: 'slot-2', day: 'Wed 26', time: '14:00 - 16:00' },
    ],
  },
  {
    id: 'student-2',
    name: 'Jamie Torres',
    course: 'PPL Flight Phase',
    slots: [
      { id: 'slot-3', day: 'Tue 25', time: '08:00 - 10:00' },
      { id: 'slot-4', day: 'Thu 27', time: '13:00 - 17:00' },
      { id: 'slot-5', day: 'Fri 28', time: '09:00 - 12:00' },
    ],
  },
  {
    id: 'student-3',
    name: 'Priya Shah',
    course: 'PPL Flight Phase',
    slots: [{ id: 'slot-6', day: 'Wed 26', time: '10:00 - 13:00' }],
  },
  {
    id: 'student-4',
    name: 'Noah Becker',
    course: 'PPL Flight Phase',
    slots: [
      { id: 'slot-7', day: 'Thu 27', time: '15:00 - 18:00' },
      { id: 'slot-8', day: 'Sat 29', time: '09:00 - 12:00' },
    ],
  },
]

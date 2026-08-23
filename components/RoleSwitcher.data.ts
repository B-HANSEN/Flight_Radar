import type { Instructor, Student } from './RoleSwitcher.types'

export const DUMMY_INSTRUCTORS: Instructor[] = [
  {
    id: 'instructor-1',
    name: 'James Whitfield',
    initials: 'JW',
    color: 'var(--color-avatar-blue)',
    photoSrc: '/instructors/james-whitfield.webp',
  },
  {
    id: 'instructor-2',
    name: 'Kate Ashford',
    initials: 'KA',
    color: 'var(--color-avatar-pink)',
    photoSrc: '/instructors/kate-ashford.webp',
  },
]

export const DUMMY_STUDENTS: Student[] = [
  {
    id: 'student-1',
    name: 'Alex Moreau',
    initials: 'AM',
    color: 'var(--color-avatar-sky)',
    track: 'PPL',
  },
  {
    id: 'student-2',
    name: 'Jamie Torres',
    initials: 'JT',
    color: 'var(--color-avatar-lime)',
    track: 'PPL',
  },
  {
    id: 'student-3',
    name: 'Priya Shah',
    initials: 'PS',
    color: 'var(--color-avatar-amber)',
    track: 'CPL',
  },
  {
    id: 'student-4',
    name: 'Noah Becker',
    initials: 'NB',
    color: 'var(--color-avatar-purple)',
    track: 'PPL',
  },
]

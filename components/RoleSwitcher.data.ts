import type { Instructor, Student } from './RoleSwitcher.types'

export const DUMMY_INSTRUCTORS: Instructor[] = [
  {
    id: 'instructor-1',
    name: 'James Whitfield',
    initials: 'JW',
    color: '#1d4ed8',
    photoSrc: '/instructors/james-whitfield.webp',
  },
  {
    id: 'instructor-2',
    name: 'Kate Ashford',
    initials: 'KA',
    color: '#be185d',
    photoSrc: '/instructors/kate-ashford.webp',
  },
]

export const DUMMY_STUDENTS: Student[] = [
  {
    id: 'student-1',
    name: 'Alex Moreau',
    initials: 'AM',
    color: '#0369a1',
    track: 'PPL',
  },
  {
    id: 'student-2',
    name: 'Jamie Torres',
    initials: 'JT',
    color: '#4d7c0f',
    track: 'PPL',
  },
  {
    id: 'student-3',
    name: 'Priya Shah',
    initials: 'PS',
    color: '#b45309',
    track: 'CPL',
  },
  {
    id: 'student-4',
    name: 'Noah Becker',
    initials: 'NB',
    color: '#9333ea',
    track: 'PPL',
  },
]

import type { CourseProgress } from './Courses.types'

export const DUMMY_COURSE_PROGRESS: CourseProgress = {
  overallActualHours: '26:02',
  overallTargetHours: '45:00',
  overallPct: 58,
  vfrTotalHours: '26:02',
  ifrTotalHours: '0:00',
  mccTotalHours: '0:00',
  groups: [
    {
      key: 'currentLesson',
      rows: [
        {
          key: 'syllabus',
          values: {
            vfrDual: '21:30',
            vfrPic: '1:00',
            vfrXc: '1:00',
            acSe: '22:30',
          },
        },
        {
          key: 'actual',
          tone: 'positive',
          values: { vfrDual: '26:02', vfrXc: '1:28', acSe: '26:02' },
        },
        {
          key: 'remaining',
          values: {
            vfrDual: '0:00',
            vfrPic: '1:00',
            vfrXc: '0:00',
            acSe: '0:00',
          },
        },
      ],
    },
    {
      key: 'fullCourse',
      rows: [
        {
          key: 'syllabus',
          values: {
            vfrDual: '35:00',
            vfrPic: '10:00',
            vfrXc: '15:00',
            acSe: '45:00',
          },
        },
        {
          key: 'actual',
          tone: 'negative',
          values: { vfrDual: '26:02', vfrXc: '1:28', acSe: '26:02' },
        },
        {
          key: 'remaining',
          values: {
            vfrDual: '8:58',
            vfrPic: '10:00',
            vfrXc: '13:32',
            acSe: '18:58',
          },
        },
      ],
    },
  ],
  phases: [
    {
      number: 1,
      actualHours: '2:32',
      targetHours: '2:30',
      pct: 100,
      detail:
        'Basic handling, effects of controls, straight and level, climbing and descending.',
    },
    {
      number: 2,
      actualHours: '18:45',
      targetHours: '13:00',
      pct: 100,
      detail:
        'Circuit training, take-off and landing, stalling, spin awareness.',
    },
    {
      number: 3,
      actualHours: '4:45',
      targetHours: '9:00',
      pct: 53,
      detail: 'Navigation exercises, diversions, radio navigation aids.',
    },
    {
      number: 4,
      actualHours: '0:00',
      targetHours: '19:30',
      pct: 0,
      detail: 'Advanced navigation, night rating, cross-country qualifier.',
    },
    {
      number: 5,
      actualHours: '0:00',
      targetHours: '1:00',
      pct: 0,
      detail: 'Skills test preparation and final progress check.',
    },
  ],
}

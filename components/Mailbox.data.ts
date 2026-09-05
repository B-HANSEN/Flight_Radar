import type { MailboxEmail, MailboxPerson } from './Mailbox.types'

export const DUMMY_MAILBOX_PEOPLE: MailboxPerson[] = [
  { id: 'instructor-kate', name: 'Kate Ashford', kind: 'instructor' },
  { id: 'instructor-james', name: 'James Whitfield', kind: 'instructor' },
  { id: 'student-alex', name: 'Alex Moreau', kind: 'student' },
  { id: 'student-priya', name: 'Priya Shah', kind: 'student' },
]

export const DUMMY_MAILBOX_EMAILS: MailboxEmail[] = [
  {
    id: 'ops-apron-works',
    sender: 'Operations Desk',
    recipientId: 'student-jamie',
    category: 'operations',
    subject: 'Apron works — expect extended taxi times this week',
    date: '01/09/2026',
    dateFull: '01/09/2026 07:40',
    sentAt: '2026-09-01T07:40:00.000Z',
    preview: 'Contractors are resurfacing the south apron stands 4–7...',
    body: [
      'Contractors are resurfacing the south apron (stands 4–7) through Friday. Aircraft based there have been moved to the grass tie-downs east of the fuel farm.',
      'Add ten minutes to your pre-flight planning for the longer taxi.',
    ],
    signOff: {
      name: 'Operations Desk',
      role: 'Airfield Operations',
      org: 'Flight Radar Academy',
    },
    action: {
      type: 'view',
      label: 'View the full NOTAM',
      href: 'https://notams.example.com/lelt/apron-works',
    },
    automatic: true,
    read: false,
  },
  {
    id: 'kate-solo-prep',
    sender: 'Kate Ashford',
    senderId: 'instructor-kate',
    recipientId: 'student-jamie',
    category: 'personal',
    subject: 'Prep for your solo cross-country',
    date: '01/09/2026',
    dateFull: '01/09/2026 19:22',
    sentAt: '2026-09-01T19:22:00.000Z',
    preview: 'Nice work in the circuit today — a few things before the XC...',
    body: [
      'Nice work in the circuit today. Before we sign you off for the solo cross-country I want to see one more dual navigation exercise, focusing on diversions.',
      'Please prepare a full plan for LELT–LEGE–LELT and bring it to Thursday’s lesson.',
    ],
    signOff: {
      name: 'Kate Ashford',
      role: 'Senior Flight Instructor',
      org: 'Flight Radar Academy',
    },
    read: false,
  },
  {
    id: 'exams-calendar-2026',
    sender: 'Exams Office',
    recipientId: 'student-jamie',
    category: 'exams',
    subject: 'Official Exams Calendar 2026',
    date: '27/11/2025',
    dateFull: '27/11/2025 11:45',
    sentAt: '2025-11-27T11:45:00.000Z',
    preview: 'Please find attached the official 2026 exams calendar...',
    body: [
      'Please find attached the official 2026 exams calendar covering theoretical knowledge and practical assessment windows.',
    ],
    signOff: {
      name: 'Exams Office',
      role: 'Academics',
      org: 'Flight Radar Academy',
    },
    action: { type: 'download', label: 'Download the calendar (PDF)' },
    read: true,
  },
  {
    id: 'training-feedback-q3',
    sender: 'Training Office',
    recipientId: 'student-jamie',
    category: 'training',
    subject: 'We value your feedback',
    date: '28/08/2026',
    dateFull: '28/08/2026 10:15',
    sentAt: '2026-08-28T10:15:00.000Z',
    preview: 'A short survey on your recent training experience...',
    body: [
      'We are reaching out to invite you to complete our training quality survey for this term.',
    ],
    signOff: {
      name: 'Training Office',
      role: 'Head of Training',
      org: 'Flight Radar Academy',
    },
    action: {
      type: 'view',
      label: 'Open the survey',
      href: 'https://flightschoolsurvey.example.com/2026-q3',
    },
    automatic: true,
    read: true,
  },
  {
    id: 'alumni-launch',
    sender: 'Alumni Network',
    recipientId: 'student-jamie',
    category: 'community',
    subject: 'Together We Fly — Alumni Launch',
    date: '02/05/2026',
    dateFull: '02/05/2026 09:00',
    sentAt: '2026-05-02T09:00:00.000Z',
    preview: 'Introducing our new alumni network for graduates...',
    body: [
      'We are launching an alumni network connecting graduates across the industry.',
    ],
    signOff: {
      name: 'Alumni Network',
      role: 'Community Team',
      org: 'Flight Radar Academy',
    },
    action: {
      type: 'join',
      label: 'Join the alumni network',
      href: 'https://alumni.example.com/join',
    },
    read: true,
  },
]

export const DUMMY_MAILBOX_SENT: MailboxEmail[] = [
  {
    id: 'jamie-crosswind-question',
    sender: 'Jamie Torres',
    senderId: 'student-jamie',
    recipientId: 'instructor-kate',
    category: 'personal',
    subject: 'Question about crosswind limits for solo',
    date: '31/08/2026',
    dateFull: '31/08/2026 20:11',
    sentAt: '2026-08-31T20:11:00.000Z',
    preview: 'What crosswind should I treat as my personal limit solo?...',
    body: [
      'Quick question before Thursday — what crosswind component should I treat as my personal limit for the solo cross-country?',
    ],
    signOff: {
      name: 'Jamie Torres',
      role: 'PPL student',
      org: 'Flight Radar Academy',
    },
    read: true,
  },
]

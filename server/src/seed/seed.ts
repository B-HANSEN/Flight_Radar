import { NestFactory } from '@nestjs/core'
import { getModelToken } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { AppModule } from '../app.module'
import { CalendarEvent } from '../agenda/schemas/calendar-event.schema'
import { Aircraft } from '../aircraft/schemas/aircraft.schema'
import {
  AvailabilityDateMode,
  AvailabilityEntry,
  AvailabilityRecurrenceMode,
  AvailabilityTimeMode,
  AvailabilityWeekday,
} from '../availability/schemas/availability-entry.schema'
import { Booking } from '../bookings/schemas/booking.schema'
import { Certificate } from '../certificates/schemas/certificate.schema'
import { CourseProgress } from '../courses/schemas/course-progress.schema'
import { DocumentFolder } from '../documents/schemas/document-folder.schema'
import { EmergencyContact } from '../emergency-contact/schemas/emergency-contact.schema'
import { FlightEvaluation } from '../flight-evaluations/schemas/flight-evaluation.schema'
import { Instructor } from '../instructors/schemas/instructor.schema'
import { InstructorTimeOff } from '../instructor-time-off/schemas/instructor-time-off.schema'
import { LogbookEntry } from '../logbook/schemas/logbook-entry.schema'
import { MailboxEmail } from '../mailbox/schemas/mailbox-email.schema'
import { NewsItem } from '../news/schemas/news-item.schema'
import { ScheduleBlock } from '../schedule/schemas/schedule-block.schema'
import { Student } from '../students/schemas/student.schema'
import { toDisplayDate } from '../common/date'
import { DocumentKind, generateDocumentFile } from './document-files'

// Single demo student — no Users module / auth yet, see TODO-BE-setup.md.
const studentId = 'student-1'
const AESA = 'AESA — Agencia Estatal de Seguridad Aérea'
const academy = 'Flight Radar Academy'

const aircraft: Omit<Aircraft, '_id'>[] = [
  {
    arcid: 'EC-DKN',
    type: 'Cessna 152',
    photoSrc: '/aircraft/cessna-152.webp',
  },
  {
    arcid: 'EC-DMC',
    type: 'Cessna 152',
    photoSrc: '/aircraft/cessna-152.webp',
  },
  {
    arcid: 'EC-DRV',
    type: 'Cessna 152',
    photoSrc: '/aircraft/cessna-152.webp',
  },
  {
    arcid: 'EC-ERV',
    type: 'Cessna 152',
    photoSrc: '/aircraft/cessna-152.webp',
  },
  {
    arcid: 'EC-EXL',
    type: 'Cessna 152',
    photoSrc: '/aircraft/cessna-152.webp',
  },
  {
    arcid: 'EC-FED',
    type: 'Cessna 152',
    photoSrc: '/aircraft/cessna-152.webp',
  },
  {
    arcid: 'EC-GHT',
    type: 'Cessna 152',
    photoSrc: '/aircraft/cessna-152.webp',
  },
  {
    arcid: 'EC-JTJ',
    type: 'Cessna 172',
    photoSrc: '/aircraft/cessna-172s.webp',
  },
  {
    arcid: 'EC-JOB',
    type: 'Cessna 172',
    photoSrc: '/aircraft/cessna-172s.webp',
  },
  {
    arcid: 'EC-JPY',
    type: 'Cessna 172',
    photoSrc: '/aircraft/cessna-172s.webp',
  },
  {
    arcid: 'EC-CZZ',
    type: 'Cessna 172',
    photoSrc: '/aircraft/cessna-172s.webp',
  },
  {
    arcid: 'EC-HIK',
    type: 'Cessna 172',
    photoSrc: '/aircraft/cessna-172s.webp',
  },
  {
    arcid: 'EC-DAE',
    type: 'Cessna 172',
    photoSrc: '/aircraft/cessna-172s.webp',
  },
  {
    arcid: 'EC-IJL',
    type: 'Cessna 172',
    photoSrc: '/aircraft/cessna-172s.webp',
  },
  {
    arcid: 'EC-KOP',
    type: 'Cessna 182',
    photoSrc: '/aircraft/cessna-182t.webp',
  },
  {
    arcid: 'EC-KOQ',
    type: 'Cessna 182',
    photoSrc: '/aircraft/cessna-182t.webp',
  },
]

type PersonCertificateSeed = {
  personName: string
} & Omit<Certificate, '_id' | 'personId'>

// One entry per student AND per instructor — the role switcher can preview
// either, and /me/certificates shows whoever is currently active. James
// Whitfield (the school's senior CFI, since 2015) holds the full licence
// progression up to ATPL; Kate Ashford (CFI since 2019) holds up to CPL.
const CERTIFICATES_BY_PERSON: PersonCertificateSeed[] = [
  {
    personName: 'Jamie Torres',
    name: 'Medical certificate class 2',
    category: 'Medical',
    status: 'current',
    issued: '12/03/2025',
    expiration: '12/03/2030',
    documentNumber: 'MED2-2025-04821',
    issuingAuthority: AESA,
    holderName: 'Torres, Jamie',
  },
  {
    personName: 'Jamie Torres',
    name: 'Radiotelephony Certificate',
    category: 'Certificates',
    status: 'current',
    issued: '18/09/2023',
    renewed: '18/09/2025',
    expiration: '18/09/2028',
    documentNumber: 'RTF-2023-00912',
    issuingAuthority: AESA,
    holderName: 'Torres, Jamie',
    comment: 'Spanish',
  },
  {
    personName: 'Alex Moreau',
    name: 'Medical certificate class 2',
    category: 'Medical',
    status: 'current',
    issued: '15/01/2025',
    expiration: '15/01/2030',
    documentNumber: 'MED2-2025-01187',
    issuingAuthority: AESA,
    holderName: 'Moreau, Alex',
  },
  {
    personName: 'Alex Moreau',
    name: 'Private Pilot Licence (PPL)',
    category: 'Licences',
    status: 'current',
    issued: '10/04/2022',
    expiration: '—',
    documentNumber: 'ES.FCL.PPL.00219',
    issuingAuthority: AESA,
    holderName: 'Moreau, Alex',
  },
  {
    personName: 'Alex Moreau',
    name: 'Radiotelephony Certificate',
    category: 'Certificates',
    status: 'current',
    issued: '02/02/2022',
    expiration: '02/02/2027',
    documentNumber: 'RTF-2022-00147',
    issuingAuthority: AESA,
    holderName: 'Moreau, Alex',
    comment: 'Spanish',
  },
  {
    personName: 'Priya Shah',
    name: 'Medical certificate class 1',
    category: 'Medical',
    status: 'current',
    issued: '08/02/2025',
    expiration: '08/02/2026',
    documentNumber: 'MED1-2025-00734',
    issuingAuthority: AESA,
    holderName: 'Shah, Priya',
  },
  {
    personName: 'Priya Shah',
    name: 'Medical certificate class 2',
    category: 'Medical',
    status: 'archived',
    issued: '20/06/2020',
    expiration: '20/06/2025',
    documentNumber: 'MED2-2020-00412',
    issuingAuthority: AESA,
    holderName: 'Shah, Priya',
  },
  {
    personName: 'Priya Shah',
    name: 'Private Pilot Licence (PPL)',
    category: 'Licences',
    status: 'current',
    issued: '14/11/2024',
    expiration: '—',
    documentNumber: 'ES.FCL.PPL.00356',
    issuingAuthority: AESA,
    holderName: 'Shah, Priya',
  },
  {
    personName: 'Priya Shah',
    name: 'Instrument Rating (IR)',
    category: 'Ratings',
    status: 'current',
    issued: '10/06/2026',
    expiration: '30/06/2028',
    documentNumber: 'ES.FCL.IR.00077',
    issuingAuthority: AESA,
    holderName: 'Shah, Priya',
  },
  {
    personName: 'Priya Shah',
    name: 'Multi-Engine Rating (ME)',
    category: 'Ratings',
    status: 'current',
    issued: '15/07/2026',
    expiration: '31/07/2028',
    documentNumber: 'ES.FCL.ME.00051',
    issuingAuthority: AESA,
    holderName: 'Shah, Priya',
  },
  {
    personName: 'Priya Shah',
    name: 'Radiotelephony Certificate',
    category: 'Certificates',
    status: 'current',
    issued: '14/11/2024',
    expiration: '14/11/2029',
    documentNumber: 'RTF-2024-00521',
    issuingAuthority: AESA,
    holderName: 'Shah, Priya',
    comment: 'Spanish',
  },
  {
    personName: 'Priya Shah',
    name: 'Radiotelephony Certificate',
    category: 'Certificates',
    status: 'current',
    issued: '14/11/2024',
    expiration: '14/11/2029',
    documentNumber: 'RTF-2024-00522',
    issuingAuthority: AESA,
    holderName: 'Shah, Priya',
    comment: 'English',
  },
  {
    personName: 'Noah Becker',
    name: 'Medical certificate class 2',
    category: 'Medical',
    status: 'current',
    issued: '22/09/2025',
    expiration: '22/09/2030',
    documentNumber: 'MED2-2025-05390',
    issuingAuthority: AESA,
    holderName: 'Becker, Noah',
  },
  {
    personName: 'Noah Becker',
    name: 'Radiotelephony Certificate',
    category: 'Certificates',
    status: 'current',
    issued: '03/12/2025',
    expiration: '03/12/2030',
    documentNumber: 'RTF-2025-00688',
    issuingAuthority: AESA,
    holderName: 'Becker, Noah',
    comment: 'Spanish',
  },
  {
    personName: 'James Whitfield',
    name: 'Medical certificate class 1',
    category: 'Medical',
    status: 'current',
    issued: '03/01/2026',
    expiration: '03/01/2027',
    documentNumber: 'MED1-2026-00089',
    issuingAuthority: AESA,
    holderName: 'Whitfield, James',
  },
  {
    personName: 'James Whitfield',
    name: 'Medical certificate class 1',
    category: 'Medical',
    status: 'archived',
    issued: '03/01/2025',
    expiration: '03/01/2026',
    documentNumber: 'MED1-2025-00088',
    issuingAuthority: AESA,
    holderName: 'Whitfield, James',
  },
  {
    personName: 'James Whitfield',
    name: 'Private Pilot Licence (PPL)',
    category: 'Licences',
    status: 'current',
    issued: '11/05/2008',
    expiration: '—',
    documentNumber: 'ES.FCL.PPL.00042',
    issuingAuthority: AESA,
    holderName: 'Whitfield, James',
  },
  {
    personName: 'James Whitfield',
    name: 'Commercial Pilot Licence (CPL)',
    category: 'Licences',
    status: 'current',
    issued: '19/08/2010',
    expiration: '—',
    documentNumber: 'ES.FCL.CPL.00071',
    issuingAuthority: AESA,
    holderName: 'Whitfield, James',
  },
  {
    personName: 'James Whitfield',
    name: 'Airline Transport Pilot Licence (ATPL)',
    category: 'Licences',
    status: 'current',
    issued: '02/06/2015',
    expiration: '—',
    documentNumber: 'ES.FCL.ATPL.00033',
    issuingAuthority: AESA,
    holderName: 'Whitfield, James',
  },
  {
    personName: 'James Whitfield',
    name: 'Instrument Rating (IR)',
    category: 'Ratings',
    status: 'current',
    issued: '14/03/2012',
    expiration: '31/03/2027',
    documentNumber: 'ES.FCL.IR.00019',
    issuingAuthority: AESA,
    holderName: 'Whitfield, James',
  },
  {
    personName: 'James Whitfield',
    name: 'Multi-Engine Rating (ME)',
    category: 'Ratings',
    status: 'current',
    issued: '22/09/2012',
    expiration: '30/09/2027',
    documentNumber: 'ES.FCL.ME.00014',
    issuingAuthority: AESA,
    holderName: 'Whitfield, James',
  },
  {
    personName: 'James Whitfield',
    name: 'Flight Instructor Certificate (FI)',
    category: 'Certificates',
    status: 'current',
    issued: '09/09/2015',
    expiration: '09/09/2028',
    documentNumber: 'ES.FCL.FI.00012',
    issuingAuthority: AESA,
    holderName: 'Whitfield, James',
  },
  {
    personName: 'James Whitfield',
    name: 'Radiotelephony Certificate',
    category: 'Certificates',
    status: 'current',
    issued: '11/05/2008',
    expiration: '11/05/2030',
    documentNumber: 'RTF-2008-00019',
    issuingAuthority: AESA,
    holderName: 'Whitfield, James',
    comment: 'Spanish',
  },
  {
    personName: 'James Whitfield',
    name: 'Radiotelephony Certificate',
    category: 'Certificates',
    status: 'current',
    issued: '11/05/2008',
    expiration: '11/05/2030',
    documentNumber: 'RTF-2008-00020',
    issuingAuthority: AESA,
    holderName: 'Whitfield, James',
    comment: 'English',
  },
  {
    personName: 'Kate Ashford',
    name: 'Medical certificate class 1',
    category: 'Medical',
    status: 'current',
    issued: '20/11/2025',
    expiration: '20/11/2026',
    documentNumber: 'MED1-2025-00654',
    issuingAuthority: AESA,
    holderName: 'Ashford, Kate',
  },
  {
    personName: 'Kate Ashford',
    name: 'Medical certificate class 1',
    category: 'Medical',
    status: 'archived',
    issued: '20/11/2024',
    expiration: '20/11/2025',
    documentNumber: 'MED1-2024-00611',
    issuingAuthority: AESA,
    holderName: 'Ashford, Kate',
  },
  {
    personName: 'Kate Ashford',
    name: 'Private Pilot Licence (PPL)',
    category: 'Licences',
    status: 'current',
    issued: '06/06/2013',
    expiration: '—',
    documentNumber: 'ES.FCL.PPL.00098',
    issuingAuthority: AESA,
    holderName: 'Ashford, Kate',
  },
  {
    personName: 'Kate Ashford',
    name: 'Commercial Pilot Licence (CPL)',
    category: 'Licences',
    status: 'current',
    issued: '17/04/2016',
    expiration: '—',
    documentNumber: 'ES.FCL.CPL.00105',
    issuingAuthority: AESA,
    holderName: 'Ashford, Kate',
  },
  {
    personName: 'Kate Ashford',
    name: 'Instrument Rating (IR)',
    category: 'Ratings',
    status: 'current',
    issued: '22/09/2016',
    expiration: '30/09/2027',
    documentNumber: 'ES.FCL.IR.00058',
    issuingAuthority: AESA,
    holderName: 'Ashford, Kate',
  },
  {
    personName: 'Kate Ashford',
    name: 'Multi-Engine Rating (ME)',
    category: 'Ratings',
    status: 'current',
    issued: '10/03/2017',
    expiration: '10/03/2027',
    documentNumber: 'ES.FCL.ME.00033',
    issuingAuthority: AESA,
    holderName: 'Ashford, Kate',
  },
  {
    personName: 'Kate Ashford',
    name: 'Flight Instructor Certificate (FI)',
    category: 'Certificates',
    status: 'current',
    issued: '19/04/2019',
    expiration: '19/04/2029',
    documentNumber: 'ES.FCL.FI.00027',
    issuingAuthority: AESA,
    holderName: 'Ashford, Kate',
  },
  {
    personName: 'Kate Ashford',
    name: 'Radiotelephony Certificate',
    category: 'Certificates',
    status: 'current',
    issued: '06/06/2013',
    expiration: '06/06/2028',
    documentNumber: 'RTF-2013-00088',
    issuingAuthority: AESA,
    holderName: 'Ashford, Kate',
    comment: 'Spanish',
  },
  {
    personName: 'Kate Ashford',
    name: 'Radiotelephony Certificate',
    category: 'Certificates',
    status: 'current',
    issued: '06/06/2013',
    expiration: '06/06/2028',
    documentNumber: 'RTF-2013-00089',
    issuingAuthority: AESA,
    holderName: 'Ashford, Kate',
    comment: 'English',
  },
]

// Keyed to each student/instructor's real seeded _id (see personIdByName in
// seed(), same as buildEmergencyContacts below).
function buildCertificates(
  personIdByName: Record<string, string>,
): Omit<Certificate, '_id'>[] {
  return CERTIFICATES_BY_PERSON.map(({ personName, ...cert }) => ({
    ...cert,
    personId: personIdByName[personName],
  }))
}

const mailboxEmails: Omit<MailboxEmail, '_id'>[] = [
  {
    sender: 'Training Office',
    subject: 'We value your feedback',
    date: '30/05/2026',
    dateFull: '30/05/2026 16:20',
    preview: 'A short survey on your recent training experience...',
    body: [
      'We are reaching out to invite you to complete our end-of-term training quality survey.',
      'Your answers are collected anonymously and help us understand where the school is doing well and where we need to improve, especially as our student numbers have grown this year.',
      'The survey takes about five minutes to complete.',
    ],
    linkText: 'flightschoolsurvey.example.com/2026-q2',
    signOff: {
      name: 'Training Office',
      role: 'Head of Training',
      org: academy,
    },
    automatic: true,
    read: false,
    studentId,
  },
  {
    sender: 'Operations Desk',
    subject: 'Runway 07/25 closed for resurfacing, 12–19 Aug',
    date: '24/03/2026',
    dateFull: '24/03/2026 09:05',
    preview: 'Scheduled maintenance work will close the main runway...',
    body: [
      'Scheduled resurfacing work will close runway 07/25 from 12 to 19 August. All flight operations will use runway 03/21 during this period.',
    ],
    linkText: 'View the full NOTAM',
    signOff: {
      name: 'Operations Desk',
      role: 'Airfield Operations',
      org: academy,
    },
    read: false,
    studentId,
  },
  {
    sender: 'Training Office',
    subject: 'We value your feedback',
    date: '11/02/2026',
    dateFull: '11/02/2026 14:10',
    preview: 'A short survey on your recent training experience...',
    body: [
      'We are reaching out to invite you to complete our training quality survey for this term.',
    ],
    linkText: 'flightschoolsurvey.example.com/2026-q1',
    signOff: {
      name: 'Training Office',
      role: 'Head of Training',
      org: academy,
    },
    automatic: true,
    studentId,
  },
  {
    sender: 'Exams Office',
    subject: 'Official Exams Calendar 2026',
    date: '27/11/2025',
    dateFull: '27/11/2025 11:45',
    preview: 'Please find attached the official 2026 exams calendar...',
    body: [
      'Please find attached the official 2026 exams calendar covering theoretical and practical assessment dates.',
    ],
    linkText: 'Download the calendar',
    signOff: { name: 'Exams Office', role: 'Academics', org: academy },
    studentId,
  },
  {
    sender: 'Training Office',
    subject: 'We value your feedback',
    date: '18/10/2025',
    dateFull: '18/10/2025 10:30',
    preview: 'A short survey on your recent training experience...',
    body: [
      'We are reaching out to invite you to complete our training quality survey for this term.',
    ],
    linkText: 'flightschoolsurvey.example.com/2025-q4',
    signOff: {
      name: 'Training Office',
      role: 'Head of Training',
      org: academy,
    },
    automatic: true,
    studentId,
  },
  {
    sender: 'Training Office',
    subject: 'We value your feedback',
    date: '19/07/2025',
    dateFull: '19/07/2025 13:15',
    preview: 'A short survey on your recent training experience...',
    body: [
      'We are reaching out to invite you to complete our training quality survey for this term.',
    ],
    linkText: 'flightschoolsurvey.example.com/2025-q3',
    signOff: {
      name: 'Training Office',
      role: 'Head of Training',
      org: academy,
    },
    automatic: true,
    studentId,
  },
  {
    sender: 'Alumni Network',
    subject: 'Together We Fly — Alumni Launch',
    date: '02/05/2025',
    dateFull: '02/05/2025 09:00',
    preview: 'Introducing our new alumni network for graduates...',
    body: [
      'We are excited to launch our new alumni network, connecting graduates across the industry.',
    ],
    linkText: 'Join the alumni network',
    signOff: { name: 'Alumni Network', role: 'Community Team', org: academy },
    studentId,
  },
  {
    sender: 'Training Office',
    subject: 'We value your feedback',
    date: '14/04/2025',
    dateFull: '14/04/2025 15:50',
    preview: 'A short survey on your recent training experience...',
    body: [
      'We are reaching out to invite you to complete our training quality survey for this term.',
    ],
    linkText: 'flightschoolsurvey.example.com/2025-q2',
    signOff: {
      name: 'Training Office',
      role: 'Head of Training',
      org: academy,
    },
    automatic: true,
    studentId,
  },
]

// One consolidated availability fixture per real student — this single set
// now drives /me/availability, the "not available" blocks derived on
// /me/agenda, AND the open slots in the instructor scheduling view, so all
// three always agree (previously three disjoint fixtures, see TODO.md).
// Anchored to the current/next months (no past-month entries); each student
// gets a couple of recurring windows plus a few one-off slots of varied
// length. Priya is deliberately sparse to keep exercising the near-empty
// state in InstructorSchedulePanel.
type StudentAvailabilitySeed = {
  dateMode: AvailabilityDateMode
  onDate?: string
  fromDate?: string
  toDate?: string
  timeMode: AvailabilityTimeMode
  startTime?: string
  endTime?: string
  recurrenceMode: AvailabilityRecurrenceMode
  recurrenceDays?: AvailabilityWeekday[]
}

const WEEKDAY_LABELS: Record<AvailabilityWeekday, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
}

const STUDENT_AVAILABILITY: Record<string, StudentAvailabilitySeed[]> = {
  'Jamie Torres': [
    {
      dateMode: 'range',
      fromDate: '01/08/2026',
      toDate: '31/08/2026',
      timeMode: 'between',
      startTime: '08:00',
      endTime: '21:00',
      recurrenceMode: 'everyday',
    },
    {
      dateMode: 'range',
      fromDate: '01/09/2026',
      toDate: '15/09/2026',
      timeMode: 'between',
      startTime: '15:00',
      endTime: '20:00',
      recurrenceMode: 'everyday',
    },
    {
      dateMode: 'range',
      fromDate: '16/09/2026',
      toDate: '30/09/2026',
      timeMode: 'allDay',
      recurrenceMode: 'days',
      recurrenceDays: ['mon', 'wed', 'fri'],
    },
    {
      dateMode: 'on',
      onDate: '05/10/2026',
      timeMode: 'between',
      startTime: '09:00',
      endTime: '13:00',
      recurrenceMode: 'everyday',
    },
    {
      dateMode: 'range',
      fromDate: '01/10/2026',
      toDate: '31/10/2026',
      timeMode: 'between',
      startTime: '18:00',
      endTime: '21:00',
      recurrenceMode: 'everyday',
    },
  ],
  'Alex Moreau': [
    {
      dateMode: 'range',
      fromDate: '01/08/2026',
      toDate: '31/08/2026',
      timeMode: 'between',
      startTime: '09:00',
      endTime: '12:00',
      recurrenceMode: 'everyday',
    },
    {
      dateMode: 'on',
      onDate: '22/08/2026',
      timeMode: 'between',
      startTime: '09:00',
      endTime: '11:00',
      recurrenceMode: 'everyday',
    },
    {
      dateMode: 'on',
      onDate: '26/08/2026',
      timeMode: 'between',
      startTime: '14:00',
      endTime: '17:00',
      recurrenceMode: 'everyday',
    },
    {
      dateMode: 'range',
      fromDate: '01/09/2026',
      toDate: '30/09/2026',
      timeMode: 'between',
      startTime: '13:00',
      endTime: '18:00',
      recurrenceMode: 'days',
      recurrenceDays: ['tue', 'thu'],
    },
    {
      dateMode: 'on',
      onDate: '09/09/2026',
      timeMode: 'between',
      startTime: '09:00',
      endTime: '11:00',
      recurrenceMode: 'everyday',
    },
    {
      dateMode: 'on',
      onDate: '23/09/2026',
      timeMode: 'between',
      startTime: '10:00',
      endTime: '12:00',
      recurrenceMode: 'everyday',
    },
  ],
  'Noah Becker': [
    {
      dateMode: 'range',
      fromDate: '15/08/2026',
      toDate: '31/08/2026',
      timeMode: 'allDay',
      recurrenceMode: 'days',
      recurrenceDays: ['sat', 'sun'],
    },
    {
      dateMode: 'on',
      onDate: '28/08/2026',
      timeMode: 'between',
      startTime: '09:00',
      endTime: '10:00',
      recurrenceMode: 'everyday',
    },
    {
      dateMode: 'on',
      onDate: '30/08/2026',
      timeMode: 'between',
      startTime: '11:00',
      endTime: '15:00',
      recurrenceMode: 'everyday',
    },
    {
      dateMode: 'range',
      fromDate: '01/09/2026',
      toDate: '30/09/2026',
      timeMode: 'between',
      startTime: '14:00',
      endTime: '17:00',
      recurrenceMode: 'everyday',
    },
    {
      dateMode: 'on',
      onDate: '12/09/2026',
      timeMode: 'between',
      startTime: '09:00',
      endTime: '10:00',
      recurrenceMode: 'everyday',
    },
  ],
  'Priya Shah': [
    {
      dateMode: 'on',
      onDate: '22/09/2026',
      timeMode: 'between',
      startTime: '10:00',
      endTime: '12:00',
      recurrenceMode: 'everyday',
    },
  ],
}

function availabilityDateLabel(seed: StudentAvailabilitySeed): string {
  return seed.dateMode === 'on'
    ? `On ${seed.onDate}`
    : `From ${seed.fromDate} to ${seed.toDate}`
}

function availabilityTimeLabel(seed: StudentAvailabilitySeed): string {
  return seed.timeMode === 'allDay'
    ? 'All day'
    : `Between ${seed.startTime} and ${seed.endTime}`
}

function availabilityRecurrenceLabel(seed: StudentAvailabilitySeed): string {
  if (seed.recurrenceMode === 'everyday') return 'Everyday'
  const days = (seed.recurrenceDays ?? []).map((day) => WEEKDAY_LABELS[day])
  return `On ${days.join(', ')}`
}

function buildAvailabilityEntries(
  studentIdByName: Record<string, string>,
): Omit<AvailabilityEntry, '_id'>[] {
  return Object.entries(STUDENT_AVAILABILITY).flatMap(([name, seeds]) =>
    seeds.map((seed) => ({
      dateLabel: availabilityDateLabel(seed),
      dateMode: seed.dateMode,
      onDate: seed.onDate,
      fromDate: seed.fromDate,
      toDate: seed.toDate,
      timeLabel: availabilityTimeLabel(seed),
      timeMode: seed.timeMode,
      startTime: seed.startTime,
      endTime: seed.endTime,
      recurrence: availabilityRecurrenceLabel(seed),
      recurrenceMode: seed.recurrenceMode,
      recurrenceDays: seed.recurrenceDays,
      studentId: studentIdByName[name],
    })),
  )
}

const logbookEntries: Omit<LogbookEntry, '_id'>[] = [
  {
    date: '19/07/2025',
    depPlace: 'LELL',
    depTime: '15:34',
    arrPlace: 'LELL',
    arrTime: '16:44',
    model: 'Cessna 152',
    reg: 'EC-ERV',
    se: '1:10',
    total: '1:10',
    pic: 'J. Whitfield',
    landingsDay: 3,
    remarks: 'Circuit and landing practice',
    studentId,
  },
  {
    date: '20/07/2025',
    depPlace: 'LELL',
    depTime: '18:05',
    arrPlace: 'LELL',
    arrTime: '19:27',
    model: 'Cessna 152',
    reg: 'EC-EXL',
    se: '1:22',
    total: '1:22',
    pic: 'J. Whitfield',
    landingsDay: 4,
    remarks: 'Steep turns and stalls',
    studentId,
  },
  {
    date: '06/09/2025',
    depPlace: 'LELL',
    depTime: '12:16',
    arrPlace: 'LELL',
    arrTime: '13:28',
    model: 'Cessna 152',
    reg: 'EC-DMC',
    se: '1:12',
    total: '1:12',
    pic: 'J. Whitfield',
    landingsDay: 3,
    remarks: 'Emergency procedures',
    studentId,
  },
  {
    date: '07/09/2025',
    depPlace: 'LELL',
    depTime: '14:56',
    arrPlace: 'LEVD',
    arrTime: '16:56',
    model: 'Cessna 152',
    reg: 'EC-FED',
    se: '2:00',
    xcDual: '2:00',
    total: '2:00',
    pic: 'J. Whitfield',
    landingsDay: 2,
    remarks: 'First cross-country navigation exercise',
    studentId,
  },
  {
    date: '05/04/2026',
    depPlace: 'LELL',
    depTime: '11:47',
    arrPlace: 'LELL',
    arrTime: '12:57',
    model: 'Cessna 152',
    reg: 'EC-ERV',
    se: '1:10',
    total: '1:10',
    pic: 'R. Sinclair',
    landingsDay: 5,
    remarks: 'Circuit consolidation',
    studentId,
  },
  {
    date: '08/04/2026',
    depTime: '18:59',
    depPlace: 'LELL',
    arrPlace: 'LELL',
    arrTime: '20:03',
    model: 'Cessna 152',
    reg: 'EC-EXL',
    se: '1:04',
    total: '1:04',
    pic: 'K. Ashford',
    landingsDay: 2,
    night: true,
    remarks: 'Introduction to night flying',
    studentId,
  },
  {
    date: '09/04/2026',
    depPlace: 'LELL',
    depTime: '17:02',
    arrPlace: 'LELL',
    arrTime: '18:21',
    model: 'Cessna 152',
    reg: 'EC-ERV',
    se: '1:19',
    total: '1:19',
    pic: 'R. Sinclair',
    landingsDay: 4,
    remarks: 'Crosswind landings',
    studentId,
  },
  {
    date: '19/05/2026',
    depPlace: 'LELL',
    depTime: '16:03',
    arrPlace: 'LELL',
    arrTime: '17:13',
    model: 'Cessna 152',
    reg: 'EC-ERV',
    se: '1:10',
    total: '1:10',
    pic: 'R. Sinclair',
    landingsDay: 3,
    remarks: 'Precision approaches',
    studentId,
  },
  {
    date: '23/05/2026',
    depPlace: 'LELL',
    depTime: '11:19',
    arrPlace: 'LELL',
    arrTime: '12:15',
    model: 'Cessna 152',
    reg: 'EC-ERV',
    se: '0:56',
    total: '0:56',
    pic: 'R. Sinclair',
    landingsDay: 6,
    remarks: 'Short field landings',
    studentId,
  },
  {
    date: '24/05/2026',
    depPlace: 'LELL',
    depTime: '15:02',
    arrPlace: 'LELL',
    arrTime: '16:00',
    model: 'Cessna 152',
    reg: 'EC-ERV',
    se: '0:58',
    total: '0:58',
    pic: 'R. Sinclair',
    landingsDay: 5,
    remarks: 'Go-around practice',
    studentId,
  },
  {
    date: '30/06/2026',
    depPlace: 'LELL',
    depTime: '09:15',
    arrPlace: 'LELL',
    arrTime: '10:21',
    model: 'Cessna 152',
    reg: 'EC-FED',
    se: '1:06',
    total: '1:06',
    pic: 'R. Sinclair',
    landingsDay: 5,
    remarks: 'Solo consolidation prep',
    studentId,
  },
  {
    date: '03/07/2026',
    depPlace: 'LELL',
    depTime: '12:57',
    arrPlace: 'LEVD',
    arrTime: '14:21',
    model: 'Cessna 152',
    reg: 'EC-FED',
    se: '1:24',
    xcDual: '1:24',
    total: '1:24',
    pic: 'M. Whitcombe',
    landingsDay: 4,
    remarks: 'Cross-country to LEVD',
    studentId,
  },
  {
    date: '07/07/2026',
    depPlace: 'LELL',
    depTime: '11:52',
    arrPlace: 'LELL',
    arrTime: '12:58',
    model: 'Cessna 152',
    reg: 'EC-EXL',
    se: '1:06',
    total: '1:06',
    pic: 'R. Sinclair',
    landingsDay: 4,
    remarks: 'Circuit revision',
    studentId,
  },
  {
    date: '10/07/2026',
    depPlace: 'LELL',
    depTime: '15:10',
    arrPlace: 'LELL',
    arrTime: '16:04',
    model: 'Cessna 152',
    reg: 'EC-FED',
    se: '0:54',
    total: '0:54',
    pic: 'R. Sinclair',
    landingsDay: 3,
    remarks: 'Flapless landings',
    studentId,
  },
  {
    date: '13/07/2026',
    depPlace: 'LELL',
    depTime: '09:46',
    arrPlace: 'LELL',
    arrTime: '10:52',
    model: 'Cessna 152',
    reg: 'EC-FED',
    se: '1:06',
    total: '1:06',
    pic: 'R. Sinclair',
    landingsDay: 5,
    remarks: 'Steep turns revision',
    studentId,
  },
  {
    date: '18/07/2026',
    depPlace: 'LELL',
    depTime: '19:13',
    arrPlace: 'LELL',
    arrTime: '20:24',
    model: 'Cessna 152',
    reg: 'EC-EXL',
    se: '1:11',
    total: '1:11',
    pic: 'K. Ashford',
    landingsDay: 2,
    night: true,
    remarks: 'Night circuits',
    studentId,
  },
]

// `person` holds the student's name (matching BookingsService.create, see
// toDisplayDate's callers) and `instructorName` the full instructor name
// used to resolve a real instructorId. These are the demo student's own
// past lessons, so `person` is the same student throughout.
type LegacyBookingSeed = Omit<Booking, '_id' | 'instructorId'> & {
  instructorName: string
}

const bookings: LegacyBookingSeed[] = [
  {
    type: 'Instruction',
    date: '15/08/2026',
    tail: 'EC-ERV',
    person: 'Jamie Torres',
    time: '10:00 - 11:30',
    studentId,
    instructorName: 'James Whitfield',
    trainingCode: 'VBD10',
  },
  {
    type: 'Instruction',
    date: '16/08/2026',
    tail: 'EC-ERV',
    person: 'Jamie Torres',
    time: '15:00 - 17:00',
    studentId,
    instructorName: 'Kate Ashford',
    trainingCode: 'VBD11',
  },
  {
    type: 'Instruction',
    date: '17/08/2026',
    tail: 'EC-ERV',
    person: 'Jamie Torres',
    time: '09:00 - 10:30',
    studentId,
    instructorName: 'James Whitfield',
    trainingCode: 'VBD12',
  },
  {
    type: 'Instruction',
    date: '18/08/2026',
    tail: 'EC-ERV',
    person: 'Jamie Torres',
    time: '13:00 - 14:30',
    studentId,
    instructorName: 'James Whitfield',
    trainingCode: 'VBD13',
  },
]

// Resolves the real per-student and per-instructor ids for the legacy demo
// bookings, which are otherwise pinned to the `studentId` placeholder (see
// line 24). `person` holds the student's name, `instructorName` the
// instructor's — both keyed off the seeded docs so the homepage's
// per-student booking filter matches the default demo persona.
function withResolvedIds(
  entries: LegacyBookingSeed[],
  studentIdByName: Record<string, string>,
  instructorIdByName: Record<string, string>,
): Omit<Booking, '_id'>[] {
  return entries.map(({ instructorName, ...entry }) => ({
    ...entry,
    studentId: studentIdByName[entry.person] ?? entry.studentId,
    instructorId: instructorIdByName[instructorName],
  }))
}

// The legacy flight evaluations are pinned to the same `studentId`
// placeholder; resolve each to its real student id (keyed by the `student`
// name) so the homepage's per-student signature filter matches.
function withResolvedStudentId(
  entries: Omit<FlightEvaluation, '_id'>[],
  studentIdByName: Record<string, string>,
): Omit<FlightEvaluation, '_id'>[] {
  return entries.map((entry) => ({
    ...entry,
    studentId: studentIdByName[entry.student] ?? entry.studentId,
  }))
}

// Flight evaluations double as the source of the "missing signatures"
// shown on the homepage: 3847780, 3956214 and 4041369 are unsigned, and
// 4041369 is also referenced by the 09/10/2026 booking in calendarEvents.
const flightEvaluationCourse = 'PPL Flight Phase (A_1_PPL(A)_v2_FLT)'
const flightEvaluationRoute = 'LELL - LELL'

const flightEvaluations: Omit<FlightEvaluation, '_id'>[] = [
  {
    sessionId: '3267346',
    date: '19/07/2025',
    type: 'Instruction',
    signed: true,
    student: 'Jamie Torres',
    instructor: 'J. Whitfield',
    course: flightEvaluationCourse,
    sessionTitle: 'Familiarization with the airplane',
    aircraft: 'EC-ERV',
    role: 'DUAL',
    route: flightEvaluationRoute,
    flightTimeDual: '01:10',
    flightTimeSolo: '00:00',
    landingsDual: 1,
    landingsSolo: 0,
    maneuvers: [
      { title: 'FAM01 - Familiarization with the airplane' },
      { title: 'FAM02 - Emergency practises at ground' },
      { title: 'FAM03 - Flight preparation and subsequent performance' },
      { title: 'FAM04 - Aerial experience' },
    ],
    observations:
      "First flight of Jamie, we took some flight time and did all the paperwork together and read all the meteorology/NOTAMS, mass and balance... Jamie now knows how to and where to check all the preflight documentation. Afterwards we did the flight plan together and we went to the aircraft. The student followed all the checklists step by step, he tried to do communications and he did well. We took off rwy 13 and went to the East to do and see how the basic primary flight controls work and understood them, we saw the relationship between power/altitude and pitch/airspeed. During the flight he was paying a lot of attention outside in order to that there weren't other aircraft close to us. As said on the post briefing, he needs to study the meteorology charts and meaning of codes and study the departure/take-off/emergency briefings.",
    scorePreparation: 2,
    scoreTechnique: 3,
    scoreInitiative: 3,
    scoreInterest: 3,
    scoreAssimilation: 2,
    finalScore: 3,
    finalNote: 'APTO, pasa a la siguiente fase',
    studentId,
  },
  {
    sessionId: '3860899',
    date: '20/07/2025',
    type: 'Instruction',
    signed: true,
    student: 'Jamie Torres',
    instructor: 'J. Whitfield',
    course: flightEvaluationCourse,
    sessionTitle: 'Steep turns and stalls',
    aircraft: 'EC-EXL',
    role: 'DUAL',
    route: flightEvaluationRoute,
    flightTimeDual: '00:56',
    flightTimeSolo: '00:00',
    landingsDual: 2,
    landingsSolo: 0,
    maneuvers: [{ title: 'VBD05 - Steep turns and stalls', score: '3' }],
    observations:
      'Practice area work: 45-degree steep turns and power-off stalls.\n\nAltitude control improving. Watch for early recovery inputs before full stall break.',
    scorePreparation: 3,
    scoreTechnique: 3,
    scoreInitiative: 3,
    scoreInterest: 3,
    scoreAssimilation: 3,
    finalScore: 3,
    finalNote: 'APTO, pasa a la siguiente fase',
    studentId,
  },
  {
    sessionId: '3864603',
    date: '06/09/2025',
    type: 'Instruction',
    signed: true,
    student: 'Jamie Torres',
    instructor: 'J. Whitfield',
    course: flightEvaluationCourse,
    sessionTitle: 'Emergency procedures',
    aircraft: 'EC-DMC',
    role: 'DUAL',
    route: flightEvaluationRoute,
    flightTimeDual: '01:10',
    flightTimeSolo: '00:00',
    landingsDual: 3,
    landingsSolo: 0,
    maneuvers: [{ title: 'VBD08 - Emergency procedures', score: '4' }],
    observations:
      'Simulated engine failure after takeoff and forced landing pattern.\n\nGood decision-making under time pressure. Continue practicing the memory items without prompting.',
    scorePreparation: 4,
    scoreTechnique: 3,
    scoreInitiative: 4,
    scoreInterest: 4,
    scoreAssimilation: 3,
    finalScore: 3,
    finalNote: 'APTO, pasa a la siguiente fase',
    studentId,
  },
  {
    sessionId: '3423871',
    date: '07/09/2025',
    type: 'Instruction',
    signed: true,
    student: 'Jamie Torres',
    instructor: 'J. Whitfield',
    course: flightEvaluationCourse,
    sessionTitle: 'First cross-country navigation exercise',
    aircraft: 'EC-FED',
    role: 'DUAL',
    route: flightEvaluationRoute,
    flightTimeDual: '02:00',
    flightTimeSolo: '00:00',
    landingsDual: 2,
    landingsSolo: 0,
    maneuvers: [
      { title: 'NAV01 - First cross-country navigation exercise', score: '3' },
    ],
    observations:
      'First cross-country navigation exercise, LELL to LEVD and back.\n\nFlight planning was thorough and the fuel/time calculations were accurate. In the air, Jamie held his headings well but was slow to notice track drift over the second leg — work on cross-checking the plog against ground features more frequently. Good radio work on both frequencies.',
    scorePreparation: 3,
    scoreTechnique: 3,
    scoreInitiative: 4,
    scoreInterest: 4,
    scoreAssimilation: 3,
    finalScore: 3,
    finalNote: 'APTO, pasa a la siguiente fase',
    studentId,
  },
  {
    sessionId: '3878920',
    date: '05/04/2026',
    type: 'Instruction',
    signed: true,
    student: 'Jamie Torres',
    instructor: 'J. Whitfield',
    course: flightEvaluationCourse,
    sessionTitle: 'Circuit consolidation',
    aircraft: 'EC-ERV',
    role: 'DUAL',
    route: flightEvaluationRoute,
    flightTimeDual: '01:02',
    flightTimeSolo: '00:00',
    landingsDual: 6,
    landingsSolo: 0,
    maneuvers: [{ title: 'VBD03 - Circuit consolidation', score: '4' }],
    observations:
      'Standard traffic pattern practice at LEL, RWY13. Light winds.\n\nGood radio discipline and consistent spacing on downwind. Continue refining flare timing.',
    scorePreparation: 4,
    scoreTechnique: 4,
    scoreInitiative: 4,
    scoreInterest: 4,
    scoreAssimilation: 4,
    finalScore: 4,
    finalNote: 'APTO, pasa a la siguiente fase',
    studentId,
  },
  {
    sessionId: '3611298',
    date: '08/04/2026',
    type: 'Instruction',
    signed: true,
    student: 'Jamie Torres',
    instructor: 'K. Ashford',
    course: flightEvaluationCourse,
    sessionTitle: 'Introduction to night flying',
    aircraft: 'EC-EXL',
    role: 'DUAL',
    route: flightEvaluationRoute,
    flightTimeDual: '01:04',
    flightTimeSolo: '00:00',
    landingsDual: 2,
    landingsSolo: 0,
    maneuvers: [{ title: 'NIT01 - Introduction to night flying', score: '3' }],
    observations:
      "First night session: cockpit and airfield lighting familiarization, then circuits at LELL.\n\nGood adaptation to the reduced visual references; runway lighting cues were used correctly on final. Depth perception on the flare needs another session or two before it's fully consistent.",
    scorePreparation: 3,
    scoreTechnique: 3,
    scoreInitiative: 3,
    scoreInterest: 4,
    scoreAssimilation: 3,
    finalScore: 3,
    finalNote: 'APTO, pasa a la siguiente fase',
    studentId,
  },
  {
    sessionId: '3875338',
    date: '09/04/2026',
    type: 'Instruction',
    signed: true,
    student: 'Jamie Torres',
    instructor: 'J. Whitfield',
    course: flightEvaluationCourse,
    sessionTitle: 'Crosswind landings',
    aircraft: 'EC-ERV',
    role: 'DUAL',
    route: flightEvaluationRoute,
    flightTimeDual: '00:48',
    flightTimeSolo: '00:00',
    landingsDual: 5,
    landingsSolo: 0,
    maneuvers: [{ title: 'VBD07 - Crosswind landings', score: '3' }],
    observations:
      'Gusty crosswind conditions, RWY13. Worked on aileron-into-wind technique during rollout.\n\nStill correcting drift late on final approach; keep working the crab-to-sideslip transition earlier.',
    scorePreparation: 3,
    scoreTechnique: 3,
    scoreInitiative: 3,
    scoreInterest: 4,
    scoreAssimilation: 3,
    finalScore: 3,
    finalNote: 'APTO, pasa a la siguiente fase',
    studentId,
  },
  {
    sessionId: '3779076',
    date: '19/05/2026',
    type: 'Instruction',
    signed: true,
    student: 'Jamie Torres',
    instructor: 'J. Whitfield',
    course: flightEvaluationCourse,
    sessionTitle: 'Traffic circuits and landing (II)',
    aircraft: 'EC-ERV',
    role: 'DUAL',
    route: flightEvaluationRoute,
    flightTimeDual: '00:58',
    flightTimeSolo: '00:00',
    landingsDual: 3,
    landingsSolo: 0,
    maneuvers: [
      { title: 'VBD09 - Traffic circuits and landing (II)' },
      { title: 'Assessment of Competencies' },
    ],
    observations:
      "In this second touch-and-go session, Jamie arrived with all the documentation ready and prepared, showing a good disposition to continue building on his skills in the traffic circuit. The student demonstrates that he theoretically knows the legs of the circuit and its structure. However, during today's flight, severe difficulties in the approach and landing phases became evident, which require immediate attention:\n\nUnlike the previous session, during this flight Jamie was unable to correctly maintain the approach path. When closing in on the runway, he presents serious difficulties maintaining the centerline, especially after cutting the power. At that critical moment, he fails to keep the aircraft parallel to the runway, heading directly towards it. On the first approach, this caused a hard impact that resulted in a bounce, forcing the instructor to immediately take control to execute a safety go-around.\n\nOn the second attempt, once the student was over the runway after cutting the power, he applied power in an uncontrolled manner and the aircraft veered sharply to the left. As a result, the instructor had to take over the controls once again to perform a second go-around. During the final approach, Jamie was also unable to safely manage the path and parameters, so the instructor assumed control definitively to perform the final landing.\n\nIn conclusion, this session has made it clear that the student is at a stage where he needs more touch-and-go sessions aimed at assimilating the approach path, correcting aircraft tendencies after power reduction, and stabilizing the attitude before touching the ground. We will continue working intensively in the cockpit to consolidate this maneuver with full safety.",
    scorePreparation: 2,
    scoreTechnique: 2,
    scoreInitiative: 2,
    scoreInterest: 2,
    scoreAssimilation: 2,
    finalScore: 2,
    finalNote: 'NO APTO, no pasa a la siguiente fase',
    studentId,
  },
  {
    sessionId: '3745219',
    date: '24/05/2026',
    type: 'Instruction',
    signed: true,
    student: 'Jamie Torres',
    instructor: 'J. Whitfield',
    course: flightEvaluationCourse,
    sessionTitle: 'Go-around practice',
    aircraft: 'EC-ERV',
    role: 'DUAL',
    route: flightEvaluationRoute,
    flightTimeDual: '00:56',
    flightTimeSolo: '00:00',
    landingsDual: 2,
    landingsSolo: 0,
    maneuvers: [{ title: 'VBD11 - Go-around practice', score: '3' }],
    observations:
      'Dedicated go-around practice from various points on final, including a late go-around after the flare.\n\nPower and pitch sequencing is becoming automatic; still needs a firmer, earlier call-out of the decision to go around instead of trying to salvage a bad approach first.',
    scorePreparation: 3,
    scoreTechnique: 3,
    scoreInitiative: 3,
    scoreInterest: 3,
    scoreAssimilation: 3,
    finalScore: 3,
    finalNote: 'APTO, pasa a la siguiente fase',
    studentId,
  },
  {
    sessionId: '3839383',
    date: '30/06/2026',
    type: 'Instruction',
    signed: true,
    student: 'Jamie Torres',
    instructor: 'J. Whitfield',
    course: flightEvaluationCourse,
    sessionTitle: 'Solo consolidation prep',
    aircraft: 'EC-FED',
    role: 'DUAL',
    route: flightEvaluationRoute,
    flightTimeDual: '01:00',
    flightTimeSolo: '00:00',
    landingsDual: 5,
    landingsSolo: 0,
    maneuvers: [
      { title: 'VBD09 - Traffic circuits and landing (II)', score: '2' },
      { title: 'Assessment of Competencies', score: '3' },
    ],
    observations:
      "It has been another takeoff and landing session with Jamie, who demonstrated good preparation, a solid understanding of each leg of the traffic pattern, proper radio management, and good overall control of the aircraft's attitudes.\n\nHowever, his primary difficulties arise once on the final approach leg. Although Jamie is progressively improving his airspeed management, he still struggles to maintain a precise aiming point on the runway, tending to lose his reference on the threshold. Additionally, he finds it challenging to maintain a stable glideslope, showing a tendency to fly either too high or too low without applying sufficient or timely corrections. Once over the runway, judging the flare height remains a challenge; he sometimes executes it too high or too abruptly, causing a balloon, floating down a significant amount of runway, and making it difficult to control a second smooth flare. These unstable approaches led to a few go-arounds today, as well as some bounced landings settling on all three wheels at once.\n\nIn conclusion, although he is gradually getting the concepts, we need to keep reinforcing takeoffs and landings in the upcoming sessions to fine-tune and consolidate his stability during the final phase of the approach. Let's keep working on it!",
    scorePreparation: 4,
    scoreTechnique: 2,
    scoreInitiative: 4,
    scoreInterest: 4,
    scoreAssimilation: 2,
    finalScore: 3,
    finalNote: 'APTO, pasa a la siguiente fase',
    studentId,
  },
  {
    sessionId: '3856112',
    date: '03/07/2026',
    type: 'Instruction',
    signed: true,
    student: 'Jamie Torres',
    instructor: 'K. Ashford',
    course: flightEvaluationCourse,
    sessionTitle: 'Cross-country to LEVD',
    aircraft: 'EC-FED',
    role: 'DUAL',
    route: flightEvaluationRoute,
    flightTimeDual: '01:24',
    flightTimeSolo: '00:00',
    landingsDual: 4,
    landingsSolo: 0,
    maneuvers: [{ title: 'NAV05 - Cross-country to LEVD', score: '3' }],
    observations:
      'Second cross-country leg, LELL-LEVD-LELL, including a planned diversion briefed before departure.\n\nDiversion decision-making was prompt and well reasoned; the replanned heading and ETA were close to the eventual actuals. Continue tightening the top-of-descent planning into LEVD.',
    scorePreparation: 3,
    scoreTechnique: 3,
    scoreInitiative: 4,
    scoreInterest: 3,
    scoreAssimilation: 3,
    finalScore: 3,
    finalNote: 'APTO, pasa a la siguiente fase',
    studentId,
  },
  {
    sessionId: '3847780',
    date: '07/07/2026',
    type: 'Instruction',
    signed: false,
    student: 'Jamie Torres',
    instructor: 'J. Whitfield',
    course: flightEvaluationCourse,
    sessionTitle: 'Circuit revision',
    aircraft: 'EC-EXL',
    role: 'DUAL',
    route: flightEvaluationRoute,
    flightTimeDual: '01:24',
    flightTimeSolo: '00:00',
    landingsDual: 4,
    landingsSolo: 0,
    maneuvers: [
      { title: 'VBD08 - Traffic circuits and landing (I)', score: '3' },
      { title: 'Assessment of Competencies', score: '3' },
    ],
    observations:
      'The student realised touch and goes and the circuit in LELL. The student demonstrated that he knows perfectly the theory and the procedure in case of an engine failure and a emergency landing. He also demonstrated to know the visual features during the circuit. The student needs to practice more touch and goes, specially the approach. We did 7 touch and goes, and 2 go-arounds. The student demonstrated a good decision making, but needs more confidence. The approaches need to be more calm, reduce power since the base, and try to descend comfortable. The student tends to descend with too much energy, without reducing RPMs. Nose position or airspeed, power for vertical speed! The day was quite complicated due to the considerable crosswind during final. Keep working and practicing.',
    scorePreparation: 3,
    scoreTechnique: 3,
    scoreInitiative: 3,
    scoreInterest: 3,
    scoreAssimilation: 3,
    finalScore: 3,
    finalNote: 'APTO, pasa a la siguiente fase',
    studentId,
  },
  {
    sessionId: '3901447',
    date: '13/07/2026',
    type: 'Instruction',
    signed: true,
    student: 'Jamie Torres',
    instructor: 'J. Whitfield',
    course: flightEvaluationCourse,
    sessionTitle: 'Steep turns revision',
    aircraft: 'EC-FED',
    role: 'DUAL',
    route: flightEvaluationRoute,
    flightTimeDual: '01:06',
    flightTimeSolo: '00:00',
    landingsDual: 5,
    landingsSolo: 0,
    maneuvers: [{ title: 'VBD05 - Steep turns revision', score: '4' }],
    observations:
      'Revisited 45-degree steep turns in both directions plus a couple of 60-degree turns for exposure.\n\nAltitude and bank control were both solid today, including the increased back-pressure and power adjustment for the steeper turns. Good session.',
    scorePreparation: 3,
    scoreTechnique: 4,
    scoreInitiative: 3,
    scoreInterest: 3,
    scoreAssimilation: 3,
    finalScore: 3,
    finalNote: 'APTO, pasa a la siguiente fase',
    studentId,
  },
  {
    sessionId: '3956214',
    date: '21/07/2026',
    type: 'Instruction',
    signed: false,
    student: 'Jamie Torres',
    instructor: 'K. Ashford',
    course: flightEvaluationCourse,
    sessionTitle: 'Pre-solo consolidation flight',
    aircraft: 'EC-ERV',
    role: 'DUAL',
    route: flightEvaluationRoute,
    flightTimeDual: '00:52',
    flightTimeSolo: '00:00',
    landingsDual: 4,
    landingsSolo: 0,
    maneuvers: [{ title: 'VBD14 - Pre-solo consolidation flight', score: '3' }],
    observations:
      "Full circuit consolidation session ahead of the pre-solo check: normal, flapless and short-field landings, plus two practice forced landings from the circuit.\n\nJamie is now consistently stabilized by short final and handling the radio calls without prompting. One more session polishing the flare and he'll be ready for the pre-solo check.",
    scorePreparation: 3,
    scoreTechnique: 4,
    scoreInitiative: 3,
    scoreInterest: 4,
    scoreAssimilation: 3,
    finalScore: 3,
    finalNote: 'APTO, pasa a la siguiente fase',
    studentId,
  },
  {
    sessionId: '4041369',
    date: '09/10/2026',
    type: 'Instruction',
    signed: false,
    student: 'Jamie Torres',
    instructor: 'K. Ashford',
    course: flightEvaluationCourse,
    sessionTitle: 'Final check before solo flight',
    aircraft: 'EC-ERV',
    role: 'DUAL',
    route: flightEvaluationRoute,
    flightTimeDual: '00:54',
    flightTimeSolo: '00:00',
    landingsDual: 4,
    landingsSolo: 0,
    maneuvers: [
      { title: 'VBD15 - Final check before solo flight', score: '4' },
      { title: 'Assessment of Competencies', score: '3' },
    ],
    observations:
      'We did touch n\' goes at LEL, RWY13. Wind was gusty and lots of thermals.\n\nOverall, the pilot has a good and solid foundation. Excellent briefings and good execution of the traffic pattern and handling of communications.\n\nAreas of improvement:\n-Aim to maintain the approach speed steady.\n-Aim to keep the RWY Center Line in all landings.\n-Keep the nose wheel in the air for longer during the flare, while avoiding "ballooning."\n\nRecommendations: remove the carb heat on short final, in case power is needed to correct a "too-low" approach, and be also ready for a go-around.\n\nWe reviewed the go-around procedure, and the pilot must remember to apply power and set Take-Off flaps immediately.\n\nVery good session.',
    scorePreparation: 4,
    scoreTechnique: 3,
    scoreInitiative: 4,
    scoreInterest: 4,
    scoreAssimilation: 3,
    finalScore: 3,
    finalNote: 'APTO, pasa a la siguiente fase',
    studentId,
  },
]

// Pending (unsigned) evaluations for the other students, so every persona
// has a realistic "missing signatures" list. Stand-in for the real
// report-authoring flow — see TODO-flight-evaluations.md. Counts vary on
// purpose (Jamie already has 3 unsigned above): Alex 5, Priya 2, Noah 0.
function pendingEvaluation(
  student: string,
  sessionId: string,
  date: string,
  instructor: string,
  sessionTitle: string,
  aircraft: string,
): Omit<FlightEvaluation, '_id'> {
  return {
    sessionId,
    date,
    type: 'Instruction',
    signed: false,
    student,
    instructor,
    course: flightEvaluationCourse,
    sessionTitle,
    aircraft,
    role: 'DUAL',
    route: flightEvaluationRoute,
    flightTimeDual: '01:00',
    flightTimeSolo: '00:00',
    landingsDual: 3,
    landingsSolo: 0,
    maneuvers: [{ title: sessionTitle, score: '3' }],
    observations: `Dual instruction: ${sessionTitle.toLowerCase()}. Awaiting the student's signature.`,
    scorePreparation: 3,
    scoreTechnique: 3,
    scoreInitiative: 3,
    scoreInterest: 4,
    scoreAssimilation: 3,
    finalScore: 3,
    finalNote: 'APTO, pasa a la siguiente fase',
    studentId,
  }
}

const pendingEvaluations: Omit<FlightEvaluation, '_id'>[] = [
  pendingEvaluation(
    'Alex Moreau',
    '4102233',
    '03/08/2026',
    'J. Whitfield',
    'Steep turns and slow flight',
    'EC-DKN',
  ),
  pendingEvaluation(
    'Alex Moreau',
    '4108876',
    '10/08/2026',
    'J. Whitfield',
    'Circuit consolidation',
    'EC-DKN',
  ),
  pendingEvaluation(
    'Alex Moreau',
    '4115402',
    '17/08/2026',
    'K. Ashford',
    'Practice forced landings',
    'EC-EXL',
  ),
  pendingEvaluation(
    'Alex Moreau',
    '4121999',
    '24/08/2026',
    'J. Whitfield',
    'Navigation exercise 1',
    'EC-EXL',
  ),
  pendingEvaluation(
    'Alex Moreau',
    '4128514',
    '28/08/2026',
    'J. Whitfield',
    'Pre-solo check preparation',
    'EC-DKN',
  ),
  pendingEvaluation(
    'Priya Shah',
    '4104510',
    '06/08/2026',
    'K. Ashford',
    'Familiarization with the airplane',
    'EC-FED',
  ),
  pendingEvaluation(
    'Priya Shah',
    '4119088',
    '21/08/2026',
    'K. Ashford',
    'Effects of controls, straight and level',
    'EC-FED',
  ),
]

const newsItems: Omit<NewsItem, '_id'>[] = [
  {
    tag: 'operations',
    date: '06/08/2026',
    title: 'New self-briefing kiosk open in the ops room',
    summary:
      'A touchscreen briefing kiosk with live METAR/TAF, NOTAMs and the aircraft schedule is now available next to the flight-planning desk.',
    body: [
      "The kiosk pulls live weather and NOTAM data directly from AEMET and AIS España, so there's no need to share the one laptop during busy briefing slots.",
      'It also mirrors the aircraft schedule board, so you can check availability for EC-ERV, EC-EXL and EC-FED without leaving the desk.',
      'Instructors will keep using the paper mass-and-balance forms for now; the kiosk is for planning and weather only. Let the ops desk know if you spot any data mismatches.',
    ],
  },
  {
    tag: 'operations',
    date: '02/08/2026',
    title: 'Sabadell tower frequency change effective now',
    summary:
      'The 8.33 kHz channel spacing update is live at LELL: TWR now runs on 120.805 MHz and GND on 121.605 MHz.',
    body: [
      'As part of the wider 8.33 kHz channel-spacing rollout across Spanish controlled aerodromes, Sabadell TWR and GND have moved to their new frequencies with immediate effect.',
      'Update your kneeboard cards and any saved presets in your handheld radios before your next flight — the old 118.xxx/121.xxx pairing is no longer monitored.',
      "If you're flying with an older 25 kHz-only radio, speak to maintenance before your next booking; it will not be able to select the new channel.",
    ],
  },
  {
    tag: 'fuel',
    date: '28/07/2026',
    title: 'New BP supply agreement airports',
    summary:
      'AVGAS 100LL is now available under the BP / Aeroclub agreement at A Coruña, Algeciras and Alicante-Elche.',
    body: [
      "The academy's fuel agreement with BP / Aeroclub now extends to A Coruña (LECO), Algeciras (LEAG) and Alicante-Elche (LEAL), on top of the existing network.",
      'Use your Aeroclub fuel card as normal; the discounted in-agreement rate applies automatically at the pump, no separate authorisation needed.',
      "Keep the receipt from any of these stops — cross-country students should log it with their expense claim for reimbursement of the card's fixed monthly fee.",
    ],
  },
  {
    tag: 'atc',
    date: '19/07/2026',
    title: 'ATIS-SIMA now live at Reus',
    summary:
      'Pilots can hear updated operational and weather information for LERS on 120.250 MHz, easing radio load on approach.',
    body: [
      'Reus (LERS) has switched on its automated ATIS-SIMA broadcast, giving pilots current runway-in-use, wind, QNH and other operational information on 120.250 MHz before first contact.',
      'Listen out for the information letter and include it in your initial call to Reus Approach or Tower — this is now expected rather than optional.',
      'The change is aimed at reducing frequency congestion during busy weekend traffic; expect fewer routine weather read-outs from controllers as a result.',
    ],
  },
  {
    tag: 'fuel',
    date: '12/07/2026',
    title: 'Jet A-1 self-service pump now open weekends',
    summary:
      'The Jet A-1 self-service pump at the north apron is now available Saturdays and Sundays, matching weekday hours.',
    body: [
      'Previously restricted to weekdays 08:00–18:00, the Jet A-1 self-service pump on the north apron now operates the same hours on weekends, following demand from weekend cross-country students.',
      'Card payment only — the fuel desk is unstaffed outside weekday hours, so bring your Aeroclub card or a supported credit card.',
      "As always, complete the bonding and static-discharge check before connecting the nozzle, and log the uplift in the aircraft's fuel log before departure.",
    ],
  },
  {
    tag: 'atc',
    date: '05/07/2026',
    title: 'New VFR reporting points published for LELL',
    summary:
      'Two new VFR reporting points, NOVEMBER and OSCAR, have been added to the Sabadell VFR arrival chart to spread traffic on busy days.',
    body: [
      'AESA has approved two additional VFR reporting points for Sabadell (LELL): NOVEMBER, over the reservoir 4 NM to the north-west, and OSCAR, over the motorway junction 3 NM to the south-east.',
      "The updated VFR arrival chart is available from the ops desk and will be uploaded to the documents section shortly; make sure you're briefing from the new version before your next arrival.",
      'Expect tower to route inbound traffic via these points more frequently during peak circuit hours, especially at weekends.',
    ],
  },
]

// The instructor's students, shown in the role-switcher's "switch view"
// picker so an instructor can preview the app as one of them.
const students: Omit<Student, '_id'>[] = [
  {
    name: 'Alex Moreau',
    initials: 'AM',
    color: 'var(--color-avatar-sky)',
    track: 'IR',
    course: 'IR Flight Phase',
    email: 'alex.moreau@example.com',
    phone: '+34 600 234 567',
    birthday: '22 June 1998',
    info: 'IR online · Q3 2025',
    photoSrc: '/students/alex-moreau.webp',
  },
  {
    name: 'Jamie Torres',
    initials: 'JT',
    color: 'var(--color-avatar-lime)',
    track: 'PPL',
    course: 'PPL Flight Phase',
    email: 'jamie.torres@example.com',
    phone: '+34 600 123 456',
    birthday: '14 March 1994',
    info: 'PPL online · Q1 2025',
    // Reuses the photo already used for her profile card sidebar —
    // app/[locale]/me/layout.tsx's default persona.
    photoSrc: '/me/jamie-torres.webp',
  },
  {
    name: 'Priya Shah',
    initials: 'PS',
    color: 'var(--color-avatar-amber)',
    track: 'CPL',
    course: 'CPL Flight Phase',
    email: 'priya.shah@example.com',
    phone: '+34 600 345 678',
    birthday: '5 November 1996',
    info: 'CPL online · Q2 2025',
    photoSrc: '/students/priya-shah.webp',
  },
  {
    name: 'Noah Becker',
    initials: 'NB',
    color: 'var(--color-avatar-purple)',
    track: 'PPL',
    course: 'PPL Flight Phase',
    email: 'noah.becker@example.com',
    phone: '+34 600 456 789',
    birthday: '30 January 2000',
    info: 'PPL online · Q4 2025',
    photoSrc: '/students/noah-becker.webp',
  },
]

// The school's flight instructors. James Whitfield ("J. Whitfield") and
// Kate Ashford ("K. Ashford") are the two names already scattered through
// bookings/logbook/signatures/flight-evaluations seed data below — this is
// the first place they exist as real profile records rather than loose
// strings. No Users module yet (no auth), so there's still no login tied
// to a specific instructor — RoleSwitcher lets a visitor preview either one.
const instructors: Omit<Instructor, '_id'>[] = [
  {
    name: 'James Whitfield',
    initials: 'JW',
    color: 'var(--color-avatar-blue)',
    photoSrc: '/instructors/james-whitfield.webp',
    email: 'james.whitfield@example.com',
    phone: '+34 600 111 222',
    birthday: '8 September 1985',
    info: 'Chief Flight Instructor · Since 2015',
    isChief: true,
  },
  {
    name: 'Kate Ashford',
    initials: 'KA',
    color: 'var(--color-avatar-pink)',
    photoSrc: '/instructors/kate-ashford.webp',
    email: 'kate.ashford@example.com',
    phone: '+34 600 222 333',
    birthday: '19 April 1990',
    info: 'Deputy Chief Flight Instructor · Since 2019',
  },
]

// Real per-student September bookings — distinct from the `bookings`/
// `calendarEvents` arrays above (which are all keyed to the hardcoded
// single-demo-persona placeholder `studentId`, see line 23) — these feed
// the scheduling modal's "already scheduled that day" list and buffer check
// (GET /schedule/student-flights), which need a real per-student id to
// query against. Kept clear of each other by at least the 90 min buffer
// BookingsService.create now enforces.
type StudentFlightSeed = {
  studentName: string
  instructorName: string
  date: string // ISO, matches CalendarEvent.date
  startTime: string
  endTime: string
  // Absent for a Theory (ground-school) lesson, which uses no aircraft.
  tail?: string
  lessonType: string
  // Instructor's note; for a Theory lesson it carries the topic.
  comments?: string
  // Hardcoded syllabus code for a flight lesson — resolved to a title +
  // briefing checklist by lib/trainingContent.ts on the agenda. Left unset
  // for Theory (its topic comes straight from `comments`); when unset for a
  // flight, DEFAULT_TRAINING_CODE_BY_LESSON_TYPE fills one in.
  trainingCode?: string
  // A booking the student later cancelled — shown struck-through on the
  // agenda by default, hidden by the "Hide cancelations" toggle.
  cancelled?: boolean
}

const DEFAULT_TRAINING_CODE_BY_LESSON_TYPE: Record<string, string | undefined> =
  {
    'Dual instruction': 'VTD03',
    Instruction: 'VBD10',
    'Checkride prep': 'VBD15',
    'Solo supervised': 'SOLO01',
    Theory: undefined,
  }

// Generates a steady 2-3 lessons/week for a student across a run of weeks so
// every active student has a realistically full agenda. Syllabus codes and
// instructors/tails rotate; every Nth generated lesson becomes a Theory
// (ground-school) session. Priya is left out on purpose to keep her hours low.
const BULK_SYLLABUS_CODES = [
  'VTD03',
  'VBD10',
  'VBD11',
  'VBD12',
  'VBD13',
  'NAV06',
  'NAV08',
  'VBD18',
  'VBD19',
]

const BULK_THEORY_TOPICS = [
  'Radio procedures and RT phraseology',
  'Meteorology — reading METARs and TAFs',
  'Mass & balance and aircraft performance',
  'Emergency procedures and the practice forced landing',
  'Air law and airspace',
  'Principles of flight and stalling',
]

type LessonPlan = {
  studentName: string
  instructors: string[]
  tails: string[]
  firstMonday: string // ISO, a Monday
  weeks: number
  // 1 = Monday … 7 = Sunday, paired with a fixed time window.
  slots: { weekday: number; start: string; end: string }[]
  theoryEvery: number // every Nth generated lesson is Theory
}

const LESSON_PLANS: LessonPlan[] = [
  {
    studentName: 'Jamie Torres',
    instructors: ['James Whitfield', 'Kate Ashford'],
    tails: ['EC-ERV', 'EC-EXL', 'EC-FED'],
    firstMonday: '2026-09-07',
    weeks: 8,
    slots: [
      { weekday: 1, start: '09:00', end: '11:00' },
      { weekday: 4, start: '13:00', end: '15:00' },
    ],
    theoryEvery: 4,
  },
  {
    studentName: 'Alex Moreau',
    instructors: ['James Whitfield', 'Kate Ashford'],
    tails: ['EC-ERV', 'EC-EXL', 'EC-FED'],
    firstMonday: '2026-09-07',
    weeks: 8,
    slots: [
      { weekday: 2, start: '09:00', end: '11:00' },
      { weekday: 5, start: '14:00', end: '16:00' },
      { weekday: 3, start: '10:00', end: '12:00' },
    ],
    theoryEvery: 5,
  },
  {
    studentName: 'Noah Becker',
    instructors: ['Kate Ashford', 'James Whitfield'],
    tails: ['EC-EXL', 'EC-FED', 'EC-ERV'],
    firstMonday: '2026-09-14',
    weeks: 7,
    slots: [
      { weekday: 3, start: '09:00', end: '10:30' },
      { weekday: 6, start: '11:00', end: '12:30' },
    ],
    theoryEvery: 4,
  },
]

function isoAddDays(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00`)
  date.setDate(date.getDate() + days)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function generatePlanFlights(plan: LessonPlan): StudentFlightSeed[] {
  const flights: StudentFlightSeed[] = []
  let index = 0

  for (let week = 0; week < plan.weeks; week += 1) {
    for (const slot of plan.slots) {
      const date = isoAddDays(plan.firstMonday, week * 7 + (slot.weekday - 1))
      const instructorName = plan.instructors[index % plan.instructors.length]
      const isTheoryLesson = index > 0 && index % plan.theoryEvery === 0

      if (isTheoryLesson) {
        flights.push({
          studentName: plan.studentName,
          instructorName,
          date,
          startTime: slot.start,
          endTime: slot.end,
          lessonType: 'Theory',
          comments:
            BULK_THEORY_TOPICS[
              Math.floor(index / plan.theoryEvery) % BULK_THEORY_TOPICS.length
            ],
        })
      } else {
        flights.push({
          studentName: plan.studentName,
          instructorName,
          date,
          startTime: slot.start,
          endTime: slot.end,
          tail: plan.tails[index % plan.tails.length],
          lessonType: 'Dual instruction',
          trainingCode: BULK_SYLLABUS_CODES[index % BULK_SYLLABUS_CODES.length],
        })
      }
      index += 1
    }
  }

  return flights
}

// Marks 2-3 lessons per calendar month per student as cancelled, so every
// student's agenda has some struck-through history behind the "View
// cancelations" toggle. Deterministic: picks are spread across the month and
// at least one lesson per month always survives; already-cancelled entries
// are left as-is. A month with a single lesson gets one cancellation.
function applyMonthlyCancellations(
  flights: StudentFlightSeed[],
): StudentFlightSeed[] {
  const indicesByMonth = new Map<string, number[]>()
  flights.forEach((flight, i) => {
    const key = `${flight.studentName}|${flight.date.slice(0, 7)}`
    const list = indicesByMonth.get(key) ?? []
    list.push(i)
    indicesByMonth.set(key, list)
  })

  const cancel = new Set<number>()
  let monthNo = 0
  for (const indices of indicesByMonth.values()) {
    // Never cancel every lesson in a month that has more than one.
    const maxCancellable =
      indices.length <= 1 ? indices.length : indices.length - 1
    const target = Math.min(2 + (monthNo % 2), maxCancellable)
    const start = indices.length <= 1 ? 0 : 1
    const step = Math.max(1, Math.floor((indices.length - start) / target))
    for (
      let picked = 0, k = start;
      picked < target && k < indices.length;
      k += step
    ) {
      cancel.add(indices[k])
      picked += 1
    }
    monthNo += 1
  }

  return flights.map((flight, i) =>
    cancel.has(i) ? { ...flight, cancelled: true } : flight,
  )
}

// Curated lessons for specific dates — the default demo persona's first solo,
// a cancelled lesson, and the per-student September detail the instructor
// scheduling demo leans on. Merged with the generated bulk below.
const EXPLICIT_STUDENT_FLIGHTS: StudentFlightSeed[] = [
  // Jamie Torres is the default demo persona — a full, varied agenda across
  // the current and next month (migrated from the old standalone
  // `calendarEvents` array), including one cancelled lesson.
  {
    studentName: 'Jamie Torres',
    instructorName: 'James Whitfield',
    date: '2026-10-06',
    startTime: '18:10',
    endTime: '20:20',
    tail: 'EC-EXL',
    lessonType: 'Dual instruction',
    trainingCode: 'VTD01',
  },
  {
    studentName: 'Jamie Torres',
    instructorName: 'Kate Ashford',
    date: '2026-10-09',
    startTime: '13:10',
    endTime: '15:20',
    tail: 'EC-ERV',
    lessonType: 'Checkride prep',
    trainingCode: 'VBD15',
  },
  {
    studentName: 'Jamie Torres',
    instructorName: 'James Whitfield',
    date: '2026-10-14',
    startTime: '09:00',
    endTime: '12:30',
    tail: 'EC-KLM',
    lessonType: 'Dual instruction',
    trainingCode: 'VTD04',
    cancelled: true,
  },
  {
    studentName: 'Jamie Torres',
    instructorName: 'Kate Ashford',
    date: '2026-09-02',
    startTime: '10:00',
    endTime: '11:15',
    tail: 'EC-FED',
    lessonType: 'Dual instruction',
    trainingCode: 'VBD03',
  },
  {
    studentName: 'Jamie Torres',
    instructorName: 'James Whitfield',
    date: '2026-09-07',
    startTime: '09:00',
    endTime: '10:15',
    tail: 'EC-FED',
    lessonType: 'Checkride prep',
    trainingCode: 'VBD16',
  },
  {
    studentName: 'Jamie Torres',
    instructorName: 'James Whitfield',
    date: '2026-09-09',
    startTime: '15:00',
    endTime: '16:00',
    tail: 'EC-ERV',
    lessonType: 'Solo supervised',
    trainingCode: 'SOLO01',
  },
  {
    studentName: 'Jamie Torres',
    instructorName: 'Kate Ashford',
    date: '2026-09-18',
    startTime: '10:00',
    endTime: '11:30',
    tail: 'EC-ERV',
    lessonType: 'Solo supervised',
    trainingCode: 'VBD18',
  },
  {
    studentName: 'Jamie Torres',
    instructorName: 'Kate Ashford',
    date: '2026-09-25',
    startTime: '19:00',
    endTime: '20:30',
    tail: 'EC-EXL',
    lessonType: 'Dual instruction',
    trainingCode: 'NIT02',
  },
  {
    studentName: 'Jamie Torres',
    instructorName: 'James Whitfield',
    date: '2026-09-30',
    startTime: '10:00',
    endTime: '11:15',
    tail: 'EC-FED',
    lessonType: 'Checkride prep',
    trainingCode: 'VBD19',
  },
  {
    studentName: 'Jamie Torres',
    instructorName: 'James Whitfield',
    date: '2026-09-14',
    startTime: '09:00',
    endTime: '11:30',
    tail: 'EC-EXL',
    lessonType: 'Dual instruction',
    trainingCode: 'NAV06',
  },
  {
    studentName: 'Jamie Torres',
    instructorName: 'James Whitfield',
    date: '2026-09-21',
    startTime: '09:00',
    endTime: '12:00',
    tail: 'EC-EXL',
    lessonType: 'Dual instruction',
    trainingCode: 'NAV08',
  },
  // Theory (ground-school) lessons — no aircraft; the agenda shows the
  // comment below as the topic.
  {
    studentName: 'Jamie Torres',
    instructorName: 'James Whitfield',
    date: '2026-09-16',
    startTime: '18:00',
    endTime: '19:30',
    lessonType: 'Theory',
    comments: 'Navigation theory — map reading, drift and diversions',
  },
  {
    studentName: 'Jamie Torres',
    instructorName: 'Kate Ashford',
    date: '2026-09-28',
    startTime: '18:00',
    endTime: '19:30',
    lessonType: 'Theory',
    comments: 'Radio procedures and RT phraseology',
  },

  {
    studentName: 'Alex Moreau',
    instructorName: 'James Whitfield',
    date: '2026-09-03',
    startTime: '09:00',
    endTime: '11:00',
    tail: 'EC-ERV',
    lessonType: 'Dual instruction',
  },
  {
    studentName: 'Alex Moreau',
    instructorName: 'James Whitfield',
    date: '2026-09-03',
    startTime: '13:00',
    endTime: '14:30',
    tail: 'EC-DMC',
    lessonType: 'Checkride prep',
  },
  {
    studentName: 'Alex Moreau',
    instructorName: 'James Whitfield',
    date: '2026-09-10',
    startTime: '10:00',
    endTime: '12:00',
    tail: 'EC-ERV',
    lessonType: 'Dual instruction',
  },
  {
    studentName: 'Alex Moreau',
    instructorName: 'Kate Ashford',
    date: '2026-09-17',
    startTime: '08:00',
    endTime: '10:00',
    tail: 'EC-DRV',
    lessonType: 'Solo supervised',
  },
  {
    studentName: 'Alex Moreau',
    instructorName: 'James Whitfield',
    date: '2026-09-24',
    startTime: '14:00',
    endTime: '16:00',
    tail: 'EC-ERV',
    lessonType: 'Dual instruction',
  },

  {
    studentName: 'Jamie Torres',
    instructorName: 'Kate Ashford',
    date: '2026-09-04',
    startTime: '08:00',
    endTime: '09:30',
    tail: 'EC-JTJ',
    lessonType: 'Dual instruction',
  },
  {
    studentName: 'Jamie Torres',
    instructorName: 'Kate Ashford',
    date: '2026-09-11',
    startTime: '09:00',
    endTime: '10:00',
    tail: 'EC-JOB',
    lessonType: 'Solo supervised',
  },
  {
    studentName: 'Jamie Torres',
    instructorName: 'James Whitfield',
    date: '2026-09-11',
    startTime: '13:00',
    endTime: '14:00',
    tail: 'EC-JTJ',
    lessonType: 'Checkride prep',
  },
  {
    studentName: 'Jamie Torres',
    instructorName: 'Kate Ashford',
    date: '2026-09-18',
    startTime: '15:00',
    endTime: '16:30',
    tail: 'EC-JOB',
    lessonType: 'Dual instruction',
  },

  // Priya keeps a light September load — roughly 0-2 lessons a week.
  {
    studentName: 'Priya Shah',
    instructorName: 'James Whitfield',
    date: '2026-09-03',
    startTime: '10:00',
    endTime: '12:00',
    tail: 'EC-DMC',
    lessonType: 'Dual instruction',
  },
  {
    studentName: 'Priya Shah',
    instructorName: 'James Whitfield',
    date: '2026-09-08',
    startTime: '09:00',
    endTime: '11:30',
    tail: 'EC-KOP',
    lessonType: 'Dual instruction',
  },
  {
    studentName: 'Priya Shah',
    instructorName: 'James Whitfield',
    date: '2026-09-15',
    startTime: '13:00',
    endTime: '15:00',
    tail: 'EC-KOQ',
    lessonType: 'Checkride prep',
  },
  {
    studentName: 'Priya Shah',
    instructorName: 'Kate Ashford',
    date: '2026-09-17',
    startTime: '09:00',
    endTime: '11:00',
    tail: 'EC-DMC',
    lessonType: 'Dual instruction',
  },
  {
    studentName: 'Priya Shah',
    instructorName: 'Kate Ashford',
    date: '2026-09-22',
    startTime: '10:00',
    endTime: '12:00',
    tail: 'EC-KOP',
    lessonType: 'Solo supervised',
  },
  {
    studentName: 'Priya Shah',
    instructorName: 'James Whitfield',
    date: '2026-09-24',
    startTime: '14:00',
    endTime: '16:00',
    tail: 'EC-KOQ',
    lessonType: 'Checkride prep',
  },
  {
    studentName: 'Priya Shah',
    instructorName: 'Kate Ashford',
    date: '2026-09-29',
    startTime: '16:00',
    endTime: '17:30',
    lessonType: 'Theory',
    comments: 'Meteorology — reading METARs and TAFs',
  },

  {
    studentName: 'Noah Becker',
    instructorName: 'Kate Ashford',
    date: '2026-09-05',
    startTime: '11:00',
    endTime: '12:30',
    tail: 'EC-JPY',
    lessonType: 'Dual instruction',
  },
  {
    studentName: 'Noah Becker',
    instructorName: 'Kate Ashford',
    date: '2026-09-12',
    startTime: '09:00',
    endTime: '10:00',
    tail: 'EC-CZZ',
    lessonType: 'Solo supervised',
  },
  {
    studentName: 'Noah Becker',
    instructorName: 'James Whitfield',
    date: '2026-09-19',
    startTime: '14:00',
    endTime: '15:30',
    tail: 'EC-JPY',
    lessonType: 'Dual instruction',
  },

  // Ground-school (Theory) lessons — no aircraft, the topic lives in comments.
  {
    studentName: 'Alex Moreau',
    instructorName: 'James Whitfield',
    date: '2026-09-04',
    startTime: '16:00',
    endTime: '17:30',
    lessonType: 'Theory',
    comments: 'Cross-country prep',
  },
  {
    studentName: 'Jamie Torres',
    instructorName: 'James Whitfield',
    date: '2026-09-09',
    startTime: '08:00',
    endTime: '09:30',
    lessonType: 'Theory',
    comments: 'Circuit pattern',
  },
  {
    studentName: 'Priya Shah',
    instructorName: 'Kate Ashford',
    date: '2026-09-11',
    startTime: '13:00',
    endTime: '14:30',
    lessonType: 'Theory',
    comments: 'Navigation',
  },
  {
    studentName: 'Noah Becker',
    instructorName: 'Kate Ashford',
    date: '2026-09-16',
    startTime: '10:00',
    endTime: '11:00',
    lessonType: 'Theory',
    comments: 'Radio procedures',
  },
]

type InstructorTimeOffSeed = { instructorName: string; date: string }

// Deterministic PRNG (mulberry32) so re-running the seed script reproduces
// the same days off instead of reshuffling them on every run.
function mulberry32(seed: number): () => number {
  let state = seed
  return function random() {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pickTwoDistinctWeekdays(rng: () => number, pool: number[]): number[] {
  const remaining = [...pool]
  const first = remaining.splice(Math.floor(rng() * remaining.length), 1)[0]
  const second = remaining.splice(Math.floor(rng() * remaining.length), 1)[0]
  return [first, second]
}

// Generates each instructor's days off, one week at a time, so a fixed rule
// (Kate's Monday) can coexist with choices that vary week to week. 1 = Monday
// … 7 = Sunday, matching LessonPlan.slots. Kate is always off Monday plus one
// more day that moves around; James gets 2 days off, usually consecutive.
// Never lets both instructors be off on the same date, so the school always
// has someone available.
function generateInstructorTimeOff(
  firstMonday: string,
  weeks: number,
  seed: number,
): InstructorTimeOffSeed[] {
  const rng = mulberry32(seed)
  const entries: InstructorTimeOffSeed[] = []
  const allWeekdays = [1, 2, 3, 4, 5, 6, 7]

  for (let week = 0; week < weeks; week += 1) {
    const weekMonday = isoAddDays(firstMonday, week * 7)

    const kateSecondWeekday = 2 + Math.floor(rng() * 6) // 2..7 (Tue..Sun)
    const kateWeekdays = [1, kateSecondWeekday]

    const jamesPool = allWeekdays.filter((day) => !kateWeekdays.includes(day))
    const consecutivePairs = jamesPool
      .filter((day) => jamesPool.includes(day + 1))
      .map((day) => [day, day + 1])
    const jamesWeekdays =
      consecutivePairs.length > 0 && rng() < 0.7
        ? consecutivePairs[Math.floor(rng() * consecutivePairs.length)]
        : pickTwoDistinctWeekdays(rng, jamesPool)

    for (const weekday of kateWeekdays) {
      entries.push({
        instructorName: 'Kate Ashford',
        date: isoAddDays(weekMonday, weekday - 1),
      })
    }
    for (const weekday of jamesWeekdays) {
      entries.push({
        instructorName: 'James Whitfield',
        date: isoAddDays(weekMonday, weekday - 1),
      })
    }
  }

  return entries
}

// Covers the whole window the agenda can browse to from today (3 months
// ahead, see AGENDA_MONTHS_AHEAD in agenda.service.ts) plus some slack.
const INSTRUCTOR_TIME_OFF: InstructorTimeOffSeed[] = generateInstructorTimeOff(
  '2026-09-07',
  17,
  20260907,
)

// Reassigns a flight to the other instructor whenever the one it's booked
// with is off that date — generateInstructorTimeOff guarantees the two
// instructors are never both off on the same day, so a swap target always
// exists.
function reassignAwayFromInstructorTimeOff(
  flights: StudentFlightSeed[],
  timeOff: InstructorTimeOffSeed[],
): StudentFlightSeed[] {
  const timeOffSet = new Set(
    timeOff.map((entry) => `${entry.instructorName}|${entry.date}`),
  )
  const otherInstructor: Record<string, string> = {
    'James Whitfield': 'Kate Ashford',
    'Kate Ashford': 'James Whitfield',
  }

  return flights.map((flight) => {
    if (!timeOffSet.has(`${flight.instructorName}|${flight.date}`)) {
      return flight
    }
    const swapped = otherInstructor[flight.instructorName]
    if (!swapped || timeOffSet.has(`${swapped}|${flight.date}`)) {
      console.warn(
        `Seed: no instructor available for ${flight.studentName} on ${flight.date} — leaving ${flight.instructorName} assigned`,
      )
      return flight
    }
    return { ...flight, instructorName: swapped }
  })
}

const STUDENT_FLIGHTS: StudentFlightSeed[] = applyMonthlyCancellations(
  reassignAwayFromInstructorTimeOff(
    [...LESSON_PLANS.flatMap(generatePlanFlights), ...EXPLICIT_STUDENT_FLIGHTS],
    INSTRUCTOR_TIME_OFF,
  ),
)

function flightTrainingCode(flight: StudentFlightSeed): string | undefined {
  if (flight.trainingCode) return flight.trainingCode
  return DEFAULT_TRAINING_CODE_BY_LESSON_TYPE[flight.lessonType]
}

function buildStudentFlights(
  studentIdByName: Record<string, string>,
  instructorIdByName: Record<string, string>,
): {
  bookings: Omit<Booking, '_id'>[]
  calendarEvents: Omit<CalendarEvent, '_id'>[]
} {
  const bookings: Omit<Booking, '_id'>[] = []
  const calendarEvents: Omit<CalendarEvent, '_id'>[] = []

  for (const flight of STUDENT_FLIGHTS) {
    const flightStudentId = studentIdByName[flight.studentName]
    const flightInstructorId = instructorIdByName[flight.instructorName]
    if (!flightStudentId || !flightInstructorId) continue
    const time = `${flight.startTime} - ${flight.endTime}`
    const trainingCode = flightTrainingCode(flight)

    bookings.push({
      type: flight.lessonType,
      date: toDisplayDate(flight.date),
      tail: flight.tail,
      person: flight.studentName,
      time,
      studentId: flightStudentId,
      instructorId: flightInstructorId,
      comments: flight.comments,
      trainingCode,
      cancelled: flight.cancelled,
    })

    calendarEvents.push({
      type: 'booking',
      date: flight.date,
      time,
      tailNumber: flight.tail,
      flightLines: [
        flight.comments
          ? `${flight.lessonType} · ${flight.comments}`
          : `${flight.lessonType} · ${flight.tail ?? trainingCode ?? ''}`,
      ],
      trainingCode,
      cancelled: flight.cancelled,
      studentId: flightStudentId,
    })
  }

  return { bookings, calendarEvents }
}

// Filename + extension + kind — generateDocumentFile (in document-files.ts)
// fills in real PDF/XLSX bytes matching each at seed time.
const documentFolderTemplates: {
  name: string
  files: { name: string; ext: 'PDF' | 'XLSX'; kind: DocumentKind }[]
}[] = [
  {
    name: 'EC-ERV',
    files: [
      { name: 'Weight and Balance.pdf', ext: 'PDF', kind: 'weight-balance' },
      { name: 'Weight and Balance.xlsx', ext: 'XLSX', kind: 'weight-balance' },
      { name: 'Normal Checklist.pdf', ext: 'PDF', kind: 'checklist' },
      {
        name: 'Emergency Checklist.pdf',
        ext: 'PDF',
        kind: 'emergency-checklist',
      },
    ],
  },
  {
    name: 'EC-EXL',
    files: [
      { name: 'Weight and Balance.pdf', ext: 'PDF', kind: 'weight-balance' },
      { name: 'Weight and Balance.xlsx', ext: 'XLSX', kind: 'weight-balance' },
      { name: 'Normal Checklist.pdf', ext: 'PDF', kind: 'checklist' },
    ],
  },
  {
    name: 'EC-FED',
    files: [
      { name: 'Weight and Balance.pdf', ext: 'PDF', kind: 'weight-balance' },
      { name: 'Weight and Balance.xlsx', ext: 'XLSX', kind: 'weight-balance' },
      { name: 'Normal Checklist.pdf', ext: 'PDF', kind: 'checklist' },
    ],
  },
  {
    name: 'EC-DNX',
    files: [
      { name: 'Weight and Balance.pdf', ext: 'PDF', kind: 'weight-balance' },
      { name: 'Weight and Balance.xlsx', ext: 'XLSX', kind: 'weight-balance' },
    ],
  },
  {
    name: 'EC-FGI',
    files: [
      { name: 'Weight and Balance.pdf', ext: 'PDF', kind: 'weight-balance' },
      { name: 'Normal Checklist.pdf', ext: 'PDF', kind: 'checklist' },
      {
        name: 'Emergency Checklist.pdf',
        ext: 'PDF',
        kind: 'emergency-checklist',
      },
    ],
  },
]

// A couple of the folders above (EC-DNX, EC-FGI) reference tails outside
// the seeded fleet — default those to the school's most common trainer.
const DEFAULT_DOCUMENT_AIRCRAFT_TYPE = 'Cessna 152'

async function buildDocumentFolders(): Promise<Omit<DocumentFolder, '_id'>[]> {
  const aircraftTypeByArcid = Object.fromEntries(
    aircraft.map((ac) => [ac.arcid, ac.type]),
  )

  return Promise.all(
    documentFolderTemplates.map(async (folder) => ({
      name: folder.name,
      files: await Promise.all(
        folder.files.map((file) =>
          generateDocumentFile(
            folder.name,
            aircraftTypeByArcid[folder.name] ?? DEFAULT_DOCUMENT_AIRCRAFT_TYPE,
            file.kind,
            file.ext,
          ).then((generated) => ({
            name: file.name,
            ext: file.ext,
            mimeType: generated.mimeType,
            data: generated.data,
          })),
        ),
      ),
    })),
  )
}

const courseProgress: Omit<CourseProgress, '_id'> = {
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
  studentId,
}

type PersonEmergencyContactSeed = {
  personName: string
  name: string
  relation: string
  phone: string
}

// One entry per student AND per instructor — the role switcher can preview
// either, and /me's profile card shows whoever is currently active.
const EMERGENCY_CONTACTS_BY_PERSON: PersonEmergencyContactSeed[] = [
  {
    personName: 'Alex Moreau',
    name: 'Camille Moreau',
    relation: 'Mother',
    phone: '+34 600 876 543',
  },
  {
    personName: 'Jamie Torres',
    name: 'Jane Doe',
    relation: 'Sister',
    phone: '+34 600 987 654',
  },
  {
    personName: 'Priya Shah',
    name: 'Raj Shah',
    relation: 'Father',
    phone: '+34 600 765 432',
  },
  {
    personName: 'Noah Becker',
    name: 'Lena Becker',
    relation: 'Sister',
    phone: '+34 600 654 321',
  },
  {
    personName: 'James Whitfield',
    name: 'Susan Whitfield',
    relation: 'Spouse',
    phone: '+34 600 543 210',
  },
  {
    personName: 'Kate Ashford',
    name: 'Liam Ashford',
    relation: 'Brother',
    phone: '+34 600 432 109',
  },
]

// Keyed to each student/instructor's real seeded _id (see personIdByName,
// resolved after students and instructors are inserted) — replaces the old
// single hardcoded-studentId placeholder now that /me profiles are wired to
// whichever student or instructor is active in the role switcher, not just
// one fixed demo persona.
function buildEmergencyContacts(
  personIdByName: Record<string, string>,
): Omit<EmergencyContact, '_id'>[] {
  return EMERGENCY_CONTACTS_BY_PERSON.map(({ personName, ...contact }) => ({
    ...contact,
    personId: personIdByName[personName],
  }))
}

// Week-view blocks are derived from the same per-aircraft day template so
// picking any weekday in the week view always matches the day view. start/end
// for 'day' blocks are hours-of-day (9-21.5); 'week' blocks are day-index +
// hour fraction (0 = Monday 00:00, 7 = next Monday).
const HOURS_PER_DAY = 24
const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6]

type DayBlockTemplate = Pick<
  ScheduleBlock,
  'label' | 'kind' | 'start' | 'end' | 'studentName' | 'instructorName'
>

function buildAircraftScheduleBlocks(
  aircraftId: string,
  dayBlocks: DayBlockTemplate[],
): Omit<ScheduleBlock, '_id'>[] {
  const day = dayBlocks.map((block) => ({
    ...block,
    aircraftId,
    period: 'day' as const,
  }))

  const week = WEEKDAYS.flatMap((dayIndex) =>
    dayBlocks.map((block) => ({
      ...block,
      aircraftId,
      period: 'week' as const,
      start: dayIndex + block.start / HOURS_PER_DAY,
      end: dayIndex + block.end / HOURS_PER_DAY,
    })),
  )

  return [...day, ...week]
}

function buildScheduleBlocks(
  aircraftIdByArcid: Record<string, string>,
): Omit<ScheduleBlock, '_id'>[] {
  const erv = aircraftIdByArcid['EC-ERV']
  const exl = aircraftIdByArcid['EC-EXL']
  const fed = aircraftIdByArcid['EC-FED']

  return [
    ...buildAircraftScheduleBlocks(erv, [
      {
        label: 'Reserved 09:00–12:00',
        kind: 'reserved',
        start: 9,
        end: 12,
        studentName: 'Alex Moreau',
        instructorName: 'James Whitfield',
      },
      {
        label: 'Reserved 13:30–16:00',
        kind: 'reserved',
        start: 13.5,
        end: 16,
        studentName: 'Priya Shah',
        instructorName: 'Kate Ashford',
      },
      {
        label: 'Reserved 16:30–19:00',
        kind: 'reserved',
        start: 16.5,
        end: 19,
        studentName: 'Noah Becker',
        instructorName: 'James Whitfield',
      },
    ]),
    ...buildAircraftScheduleBlocks(exl, [
      {
        label: 'Reserved 09:00–12:00',
        kind: 'reserved',
        start: 9,
        end: 12,
        studentName: 'Jamie Torres',
        instructorName: 'Kate Ashford',
      },
      {
        label: 'Reserved',
        kind: 'reserved',
        start: 14.5,
        end: 16,
        studentName: 'Priya Shah',
        instructorName: 'James Whitfield',
      },
      {
        label: 'Reserved 16:00–21:30',
        kind: 'reserved',
        start: 16,
        end: 21.5,
        studentName: 'Alex Moreau',
        instructorName: 'Kate Ashford',
      },
    ]),
    ...buildAircraftScheduleBlocks(fed, [
      { label: 'Not available', kind: 'unavailable', start: 9, end: 14.5 },
      {
        label: 'Reserved',
        kind: 'reserved',
        start: 14.5,
        end: 16,
        studentName: 'Noah Becker',
        instructorName: 'Kate Ashford',
      },
      {
        label: 'Reserved',
        kind: 'reserved',
        start: 16.5,
        end: 18,
        studentName: 'Jamie Torres',
        instructorName: 'James Whitfield',
      },
      {
        label: 'Reserved 18:00–20:30',
        kind: 'reserved',
        start: 18,
        end: 20.5,
        studentName: 'Priya Shah',
        instructorName: 'Kate Ashford',
      },
    ]),
  ]
}

async function seed() {
  const onlyIfEmpty = process.argv.includes('--if-empty')
  if (onlyIfEmpty && process.env.NODE_ENV === 'production') {
    console.log('Skipping auto-seed in production')
    return
  }

  const app = await NestFactory.createApplicationContext(AppModule)

  async function seedMany<T>(
    model: Model<T>,
    data: T[],
    label: string,
  ): Promise<void> {
    if (onlyIfEmpty && (await model.countDocuments()) > 0) {
      console.log(`Skipped ${label} (already has data)`)
      return
    }
    await model.deleteMany({})
    await model.insertMany(data)
    console.log(`Seeded ${data.length} ${label}`)
  }

  const calendarEventModel = app.get<Model<CalendarEvent>>(
    getModelToken(CalendarEvent.name),
  )
  const aircraftModel = app.get<Model<Aircraft>>(getModelToken(Aircraft.name))
  const availabilityEntryModel = app.get<Model<AvailabilityEntry>>(
    getModelToken(AvailabilityEntry.name),
  )
  const bookingModel = app.get<Model<Booking>>(getModelToken(Booking.name))
  const certificateModel = app.get<Model<Certificate>>(
    getModelToken(Certificate.name),
  )
  const courseProgressModel = app.get<Model<CourseProgress>>(
    getModelToken(CourseProgress.name),
  )
  const documentFolderModel = app.get<Model<DocumentFolder>>(
    getModelToken(DocumentFolder.name),
  )
  const emergencyContactModel = app.get<Model<EmergencyContact>>(
    getModelToken(EmergencyContact.name),
  )
  const flightEvaluationModel = app.get<Model<FlightEvaluation>>(
    getModelToken(FlightEvaluation.name),
  )
  const instructorModel = app.get<Model<Instructor>>(
    getModelToken(Instructor.name),
  )
  const instructorTimeOffModel = app.get<Model<InstructorTimeOff>>(
    getModelToken(InstructorTimeOff.name),
  )
  const logbookEntryModel = app.get<Model<LogbookEntry>>(
    getModelToken(LogbookEntry.name),
  )
  const mailboxEmailModel = app.get<Model<MailboxEmail>>(
    getModelToken(MailboxEmail.name),
  )
  const newsItemModel = app.get<Model<NewsItem>>(getModelToken(NewsItem.name))
  const scheduleBlockModel = app.get<Model<ScheduleBlock>>(
    getModelToken(ScheduleBlock.name),
  )
  const studentModel = app.get<Model<Student>>(getModelToken(Student.name))

  let aircraftDocs: { arcid: string; _id: { toString(): string } }[]
  if (onlyIfEmpty && (await aircraftModel.countDocuments()) > 0) {
    console.log('Skipped aircraft (already has data)')
    aircraftDocs = await aircraftModel.find()
  } else {
    await aircraftModel.deleteMany({})
    aircraftDocs = await aircraftModel.insertMany(aircraft)
    console.log(`Seeded ${aircraft.length} aircraft`)
  }

  const aircraftIdByArcid = Object.fromEntries(
    aircraftDocs.map((doc) => [doc.arcid, doc._id.toString()]),
  )
  const scheduleBlocks = buildScheduleBlocks(aircraftIdByArcid)
  await seedMany(scheduleBlockModel, scheduleBlocks, 'schedule blocks')

  let studentDocs: { name: string; _id: { toString(): string } }[]
  if (onlyIfEmpty && (await studentModel.countDocuments()) > 0) {
    console.log('Skipped students (already has data)')
    studentDocs = await studentModel.find()
  } else {
    await studentModel.deleteMany({})
    studentDocs = await studentModel.insertMany(students)
    console.log(`Seeded ${students.length} students`)
  }

  const studentIdByName = Object.fromEntries(
    studentDocs.map((doc) => [doc.name, doc._id.toString()]),
  )

  let instructorDocs: { name: string; _id: { toString(): string } }[]
  if (onlyIfEmpty && (await instructorModel.countDocuments()) > 0) {
    console.log('Skipped instructors (already has data)')
    instructorDocs = await instructorModel.find()
  } else {
    await instructorModel.deleteMany({})
    instructorDocs = await instructorModel.insertMany(instructors)
    console.log(`Seeded ${instructors.length} instructors`)
  }

  const instructorIdByName = Object.fromEntries(
    instructorDocs.map((doc) => [doc.name, doc._id.toString()]),
  )

  await seedMany(
    instructorTimeOffModel,
    INSTRUCTOR_TIME_OFF.map((entry) => ({
      instructorId: instructorIdByName[entry.instructorName],
      date: entry.date,
    })),
    'instructor time off entries',
  )

  const studentFlights = buildStudentFlights(
    studentIdByName,
    instructorIdByName,
  )

  await seedMany(
    availabilityEntryModel,
    buildAvailabilityEntries(studentIdByName),
    'availability entries',
  )
  await seedMany(
    calendarEventModel,
    studentFlights.calendarEvents,
    'calendar events',
  )
  if (onlyIfEmpty && (await courseProgressModel.countDocuments()) > 0) {
    console.log('Skipped course progress (already has data)')
  } else {
    await courseProgressModel.deleteMany({})
    await courseProgressModel.insertOne(courseProgress)
    console.log('Seeded course progress')
  }

  const documentFolders = await buildDocumentFolders()
  await seedMany(documentFolderModel, documentFolders, 'document folders')

  const personIdByName = { ...studentIdByName, ...instructorIdByName }

  const emergencyContacts = buildEmergencyContacts(personIdByName)
  await seedMany(emergencyContactModel, emergencyContacts, 'emergency contacts')
  const certificates = buildCertificates(personIdByName)
  await seedMany(certificateModel, certificates, 'certificates')
  await seedMany(
    flightEvaluationModel,
    withResolvedStudentId(
      [...flightEvaluations, ...pendingEvaluations],
      studentIdByName,
    ),
    'flight evaluations',
  )
  await seedMany(logbookEntryModel, logbookEntries, 'logbook entries')
  await seedMany(mailboxEmailModel, mailboxEmails, 'mailbox emails')
  await seedMany(
    bookingModel,
    [
      ...withResolvedIds(bookings, studentIdByName, instructorIdByName),
      ...studentFlights.bookings,
    ],
    'bookings',
  )
  await seedMany(newsItemModel, newsItems, 'news items')

  await app.close()
}

void seed()

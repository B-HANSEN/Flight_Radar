import { NestFactory } from '@nestjs/core'
import { getModelToken } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
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

// The demo persona whose past lessons, mailbox and course progress the
// fixtures below all belong to. Resolved to a real seeded student id at
// seed time (studentIdByName), same as every other collection.
const demoStudentName = 'Jamie Torres'
const AESA = 'AESA — Agencia Estatal de Seguridad Aérea'
const academy = 'Flight Radar Academy'

// Turns an aircraft _id string (from aircraftIdByArcid) into a real
// ObjectId for Booking.aircraftId / CalendarEvent.aircraftId.
function toAircraftObjectId(
  id: string | undefined,
): Types.ObjectId | undefined {
  return id ? new Types.ObjectId(id) : undefined
}

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
    issued: '22/01/2026',
    expiration: '22/01/2027',
    documentNumber: 'MED1-2026-00518',
    issuingAuthority: AESA,
    holderName: 'Shah, Priya',
  },
  {
    personName: 'Priya Shah',
    name: 'Medical certificate class 1',
    category: 'Medical',
    status: 'archived',
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

const mailboxEmails: Omit<MailboxEmail, '_id' | 'studentId'>[] = [
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

function buildAvailabilityEntries(
  studentIdByName: Record<string, string>,
): Omit<AvailabilityEntry, '_id'>[] {
  return Object.entries(STUDENT_AVAILABILITY).flatMap(([name, seeds]) =>
    seeds.map((seed) => ({
      dateMode: seed.dateMode,
      onDate: seed.onDate,
      fromDate: seed.fromDate,
      toDate: seed.toDate,
      timeMode: seed.timeMode,
      startTime: seed.startTime,
      endTime: seed.endTime,
      recurrenceMode: seed.recurrenceMode,
      recurrenceDays: seed.recurrenceDays,
      studentId: studentIdByName[name],
    })),
  )
}

// Jamie Torres's PPL flight-phase logbook — the demo persona's own record
// and the fullest of the four. The other students' logbooks are in
// LOGBOOK_BY_STUDENT below.
const logbookEntries: Omit<LogbookEntry, '_id' | 'studentId'>[] = [
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
    pic: 'J. Whitfield',
    landingsDay: 5,
    remarks: 'Circuit consolidation',
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
    pic: 'J. Whitfield',
    landingsDay: 4,
    remarks: 'Crosswind landings',
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
    pic: 'J. Whitfield',
    landingsDay: 3,
    remarks: 'Traffic circuits and landing (II)',
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
    pic: 'J. Whitfield',
    landingsDay: 6,
    remarks: 'Short field landings',
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
    pic: 'J. Whitfield',
    landingsDay: 5,
    remarks: 'Go-around practice',
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
    pic: 'J. Whitfield',
    landingsDay: 5,
    remarks: 'Solo consolidation prep',
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
    pic: 'K. Ashford',
    landingsDay: 4,
    remarks: 'Cross-country to LEVD',
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
    pic: 'J. Whitfield',
    landingsDay: 4,
    remarks: 'Circuit revision',
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
    pic: 'J. Whitfield',
    landingsDay: 3,
    remarks: 'Flapless landings',
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
    pic: 'J. Whitfield',
    landingsDay: 5,
    remarks: 'Steep turns revision',
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
  },
]

// The remaining students' logbooks, keyed by name (resolved to a real
// student id in buildLogbookEntries, same shape as STUDENT_AVAILABILITY).
// Each one tracks that student's licences/ratings and current course (see
// `students`):
//   Alex Moreau — PPL holder, IR flight phase: all C172, instrument-only
//     sorties building to the IR skill test.
//   Priya Shah — PPL + IR holder, CPL flight phase: a slice covering her
//     IR training (C172) through the start of CPL complex work (C182),
//     including a solo commercial cross-country. No ME entries — the fleet
//     has no twin.
//   Noah Becker — ab-initio PPL, weekend student: an earlier, sparser
//     progression than Jamie's, reaching first solo.
const LOGBOOK_BY_STUDENT: Record<
  string,
  Omit<LogbookEntry, '_id' | 'studentId'>[]
> = {
  'Alex Moreau': [
    {
      date: '12/05/2026',
      depPlace: 'LELL',
      depTime: '09:30',
      arrPlace: 'LELL',
      arrTime: '10:48',
      model: 'Cessna 172',
      reg: 'EC-JTJ',
      se: '1:18',
      total: '1:18',
      pic: 'J. Whitfield',
      landingsDay: 1,
      remarks:
        'Basic attitude instrument flying — full and partial panel, rate-1 turns, climbs and descents on instruments',
    },
    {
      date: '19/05/2026',
      depPlace: 'LELL',
      depTime: '09:15',
      arrPlace: 'LELL',
      arrTime: '10:39',
      model: 'Cessna 172',
      reg: 'EC-JTJ',
      se: '1:24',
      total: '1:24',
      pic: 'J. Whitfield',
      landingsDay: 1,
      remarks:
        'Recovery from unusual attitudes, full and partial panel; timed compass turns',
    },
    {
      date: '26/05/2026',
      depPlace: 'LELL',
      depTime: '14:00',
      arrPlace: 'LELL',
      arrTime: '15:36',
      model: 'Cessna 172',
      reg: 'EC-JOB',
      se: '1:36',
      total: '1:36',
      pic: 'K. Ashford',
      landingsDay: 1,
      remarks:
        'VOR radial tracking and interception, DME arcs, fix-to-fix navigation',
    },
    {
      date: '02/06/2026',
      depPlace: 'LELL',
      depTime: '09:00',
      arrPlace: 'LELL',
      arrTime: '10:30',
      model: 'Cessna 172',
      reg: 'EC-JTJ',
      se: '1:30',
      total: '1:30',
      pic: 'J. Whitfield',
      landingsDay: 1,
      remarks: 'ADF orientation and homing, NDB tracking with wind correction',
    },
    {
      date: '09/06/2026',
      depPlace: 'LELL',
      depTime: '10:00',
      arrPlace: 'LELL',
      arrTime: '11:30',
      model: 'Cessna 172',
      reg: 'EC-JPY',
      se: '1:30',
      total: '1:30',
      pic: 'J. Whitfield',
      landingsDay: 1,
      remarks:
        'Holding pattern entries (direct, parallel, teardrop) at CJN; timing and drift correction',
    },
    {
      date: '16/06/2026',
      depPlace: 'LELL',
      depTime: '09:20',
      arrPlace: 'LELL',
      arrTime: '10:50',
      model: 'Cessna 172',
      reg: 'EC-JOB',
      se: '1:30',
      total: '1:30',
      pic: 'K. Ashford',
      landingsDay: 3,
      remarks:
        'ILS RWY 06 LELL — three approaches, one raw-data, go-around from decision altitude',
    },
    {
      date: '23/06/2026',
      depPlace: 'LELL',
      depTime: '13:30',
      arrPlace: 'LEVD',
      arrTime: '15:06',
      model: 'Cessna 172',
      reg: 'EC-JTJ',
      se: '1:36',
      xcDual: '1:36',
      total: '1:36',
      pic: 'J. Whitfield',
      landingsDay: 2,
      remarks:
        'VOR/DME and NDB approaches at LEVD, published missed approach and hold',
    },
    {
      date: '30/06/2026',
      depPlace: 'LELL',
      depTime: '09:10',
      arrPlace: 'LELL',
      arrTime: '10:40',
      model: 'Cessna 172',
      reg: 'EC-JPY',
      se: '1:30',
      total: '1:30',
      pic: 'J. Whitfield',
      landingsDay: 2,
      remarks:
        'Partial-panel ILS and localizer-only approach, timed turns, instrument-failure drills',
    },
    {
      date: '07/07/2026',
      depPlace: 'LELL',
      depTime: '12:00',
      arrPlace: 'LELL',
      arrTime: '14:06',
      model: 'Cessna 172',
      reg: 'EC-JOB',
      se: '2:06',
      xcDual: '2:06',
      total: '2:06',
      pic: 'K. Ashford',
      landingsDay: 2,
      remarks:
        'IFR navigation LELL–LERS–LELL: airway joining, en-route hold, ILS on return',
    },
    {
      date: '21/07/2026',
      depPlace: 'LELL',
      depTime: '11:30',
      arrPlace: 'LELL',
      arrTime: '13:48',
      model: 'Cessna 172',
      reg: 'EC-JTJ',
      se: '2:18',
      xcDual: '2:18',
      total: '2:18',
      pic: 'J. Whitfield',
      landingsDay: 3,
      remarks:
        'IFR cross-country LELL–LEDA–LEVD–LELL, full procedural approach at each airfield',
    },
    {
      date: '11/08/2026',
      depPlace: 'LELL',
      depTime: '09:00',
      arrPlace: 'LELL',
      arrTime: '10:30',
      model: 'Cessna 172',
      reg: 'EC-JPY',
      se: '1:30',
      total: '1:30',
      pic: 'J. Whitfield',
      landingsDay: 3,
      remarks:
        'Approach consolidation — ILS, VOR/DME, RNP; single-pilot IFR workload management',
    },
    {
      date: '25/08/2026',
      depPlace: 'LELL',
      depTime: '14:15',
      arrPlace: 'LELL',
      arrTime: '15:57',
      model: 'Cessna 172',
      reg: 'EC-JOB',
      se: '1:42',
      total: '1:42',
      pic: 'K. Ashford',
      landingsDay: 2,
      remarks:
        'IR skill-test rehearsal: departure, airway, hold, two approaches, go-around, diversion',
    },
    {
      date: '01/09/2026',
      depPlace: 'LELL',
      depTime: '09:30',
      arrPlace: 'LELL',
      arrTime: '11:06',
      model: 'Cessna 172',
      reg: 'EC-JTJ',
      se: '1:36',
      total: '1:36',
      pic: 'J. Whitfield',
      landingsDay: 2,
      remarks:
        'Final IR skill-test preparation — partial-panel non-precision approach, unusual attitudes, holding',
    },
  ],
  'Priya Shah': [
    {
      date: '14/02/2026',
      depPlace: 'LELL',
      depTime: '10:00',
      arrPlace: 'LELL',
      arrTime: '11:18',
      model: 'Cessna 172',
      reg: 'EC-JTJ',
      se: '1:18',
      total: '1:18',
      pic: 'K. Ashford',
      landingsDay: 1,
      remarks:
        'IR: basic attitude instrument flying, partial panel, rate-1 turns and standard climbs/descents',
    },
    {
      date: '07/03/2026',
      depPlace: 'LELL',
      depTime: '09:30',
      arrPlace: 'LELL',
      arrTime: '11:00',
      model: 'Cessna 172',
      reg: 'EC-JOB',
      se: '1:30',
      total: '1:30',
      pic: 'J. Whitfield',
      landingsDay: 1,
      remarks: 'IR: VOR radial tracking, ADF homing, DME arcs and fix-to-fix',
    },
    {
      date: '28/03/2026',
      depPlace: 'LELL',
      depTime: '10:15',
      arrPlace: 'LELL',
      arrTime: '11:39',
      model: 'Cessna 172',
      reg: 'EC-JTJ',
      se: '1:24',
      total: '1:24',
      pic: 'K. Ashford',
      landingsDay: 2,
      remarks: 'IR: holding entries at CJN, ILS RWY 06 LELL to minimums',
    },
    {
      date: '18/04/2026',
      depPlace: 'LELL',
      depTime: '13:00',
      arrPlace: 'LEVD',
      arrTime: '14:36',
      model: 'Cessna 172',
      reg: 'EC-JPY',
      se: '1:36',
      xcDual: '1:36',
      total: '1:36',
      pic: 'J. Whitfield',
      landingsDay: 1,
      remarks:
        'IR: VOR/DME and NDB approaches at LEVD, published missed approach',
    },
    {
      date: '09/05/2026',
      depPlace: 'LELL',
      depTime: '09:00',
      arrPlace: 'LELL',
      arrTime: '11:12',
      model: 'Cessna 172',
      reg: 'EC-JOB',
      se: '2:12',
      xcDual: '2:12',
      total: '2:12',
      pic: 'K. Ashford',
      landingsDay: 2,
      remarks:
        'IR: IFR navigation LELL–LERS–LELL, airway joining and procedural approach',
    },
    {
      date: '30/05/2026',
      depPlace: 'LELL',
      depTime: '10:00',
      arrPlace: 'LELL',
      arrTime: '11:42',
      model: 'Cessna 172',
      reg: 'EC-JTJ',
      se: '1:42',
      total: '1:42',
      pic: 'J. Whitfield',
      landingsDay: 2,
      remarks:
        'IR skill-test rehearsal: hold, precision and non-precision approach, partial panel',
    },
    {
      date: '10/06/2026',
      depPlace: 'LELL',
      depTime: '09:15',
      arrPlace: 'LELL',
      arrTime: '11:03',
      model: 'Cessna 172',
      reg: 'EC-JOB',
      se: '1:48',
      xcDual: '1:00',
      total: '1:48',
      pic: 'J. Whitfield',
      landingsDay: 2,
      remarks:
        'IR skill test — pass. Departure, airway, hold, ILS RWY 06, VOR/DME approach LEVD, partial panel, diversion',
    },
    {
      date: '08/08/2026',
      depPlace: 'LELL',
      depTime: '09:00',
      arrPlace: 'LELL',
      arrTime: '10:24',
      model: 'Cessna 182',
      reg: 'EC-KOP',
      se: '1:24',
      total: '1:24',
      pic: 'J. Whitfield',
      landingsDay: 3,
      remarks:
        'CPL: C182 complex conversion — constant-speed propeller, cowl flaps, systems; steep turns and slow flight to commercial tolerances',
    },
    {
      date: '22/08/2026',
      depPlace: 'LELL',
      depTime: '10:00',
      arrPlace: 'LELL',
      arrTime: '11:30',
      model: 'Cessna 182',
      reg: 'EC-KOP',
      se: '1:30',
      total: '1:30',
      pic: 'K. Ashford',
      landingsDay: 4,
      remarks:
        'CPL: chandelles, lazy eights, steep spiral and eights-on-pylons to commercial tolerances',
    },
    {
      date: '29/08/2026',
      depPlace: 'LELL',
      depTime: '09:30',
      arrPlace: 'LELL',
      arrTime: '10:42',
      model: 'Cessna 182',
      reg: 'EC-KOQ',
      se: '1:12',
      total: '1:12',
      pic: 'J. Whitfield',
      landingsDay: 6,
      remarks:
        'CPL: short-field and soft-field take-offs and landings, precision approaches, power-off 180',
    },
    {
      date: '02/09/2026',
      depPlace: 'LELL',
      depTime: '08:30',
      arrPlace: 'LELL',
      arrTime: '11:00',
      model: 'Cessna 182',
      reg: 'EC-KOP',
      se: '2:30',
      total: '2:30',
      pic: 'P. Shah',
      landingsDay: 1,
      remarks:
        'CPL: solo cross-country LELL–LEDA–LERS–LELL, ~300 NM triangle, full commercial navigation log and a planned diversion',
    },
  ],
  'Noah Becker': [
    {
      date: '11/10/2025',
      depPlace: 'LELL',
      depTime: '10:00',
      arrPlace: 'LELL',
      arrTime: '10:48',
      model: 'Cessna 152',
      reg: 'EC-DMC',
      se: '0:48',
      total: '0:48',
      pic: 'K. Ashford',
      landingsDay: 1,
      remarks:
        'Air experience — effects of controls, primary and secondary; taxiing',
    },
    {
      date: '25/10/2025',
      depPlace: 'LELL',
      depTime: '10:15',
      arrPlace: 'LELL',
      arrTime: '11:21',
      model: 'Cessna 152',
      reg: 'EC-DMC',
      se: '1:06',
      total: '1:06',
      pic: 'K. Ashford',
      landingsDay: 1,
      remarks:
        'Straight and level, climbing and descending, effect of power and flap',
    },
    {
      date: '15/11/2025',
      depPlace: 'LELL',
      depTime: '09:45',
      arrPlace: 'LELL',
      arrTime: '10:45',
      model: 'Cessna 152',
      reg: 'EC-DRV',
      se: '1:00',
      total: '1:00',
      pic: 'K. Ashford',
      landingsDay: 1,
      remarks: 'Medium level turns, climbing and descending turns, lookout',
    },
    {
      date: '06/12/2025',
      depPlace: 'LELL',
      depTime: '10:30',
      arrPlace: 'LELL',
      arrTime: '11:24',
      model: 'Cessna 152',
      reg: 'EC-DMC',
      se: '0:54',
      total: '0:54',
      pic: 'J. Whitfield',
      landingsDay: 1,
      remarks: 'Slow flight and flight at minimum controllable airspeed',
    },
    {
      date: '17/01/2026',
      depPlace: 'LELL',
      depTime: '11:00',
      arrPlace: 'LELL',
      arrTime: '12:12',
      model: 'Cessna 152',
      reg: 'EC-GHT',
      se: '1:12',
      total: '1:12',
      pic: 'K. Ashford',
      landingsDay: 1,
      remarks:
        'Stall recognition and recovery, clean and with flap; incipient spin awareness',
    },
    {
      date: '07/02/2026',
      depPlace: 'LELL',
      depTime: '10:00',
      arrPlace: 'LELL',
      arrTime: '11:00',
      model: 'Cessna 152',
      reg: 'EC-DMC',
      se: '1:00',
      total: '1:00',
      pic: 'K. Ashford',
      landingsDay: 4,
      remarks:
        'Introduction to the circuit, RWY 13 — normal approach and landing',
    },
    {
      date: '28/02/2026',
      depPlace: 'LELL',
      depTime: '09:30',
      arrPlace: 'LELL',
      arrTime: '10:36',
      model: 'Cessna 152',
      reg: 'EC-DRV',
      se: '1:06',
      total: '1:06',
      pic: 'K. Ashford',
      landingsDay: 5,
      remarks: 'Circuit consolidation, flapless and glide approaches',
    },
    {
      date: '21/03/2026',
      depPlace: 'LELL',
      depTime: '10:15',
      arrPlace: 'LELL',
      arrTime: '11:15',
      model: 'Cessna 152',
      reg: 'EC-DMC',
      se: '1:00',
      total: '1:00',
      pic: 'J. Whitfield',
      landingsDay: 4,
      remarks:
        'Circuit emergencies — engine failure after take-off, glide approach, go-around',
    },
    {
      date: '18/04/2026',
      depPlace: 'LELL',
      depTime: '09:45',
      arrPlace: 'LELL',
      arrTime: '10:39',
      model: 'Cessna 152',
      reg: 'EC-EXL',
      se: '0:54',
      total: '0:54',
      pic: 'K. Ashford',
      landingsDay: 5,
      remarks: 'Crosswind circuits, RWY 31 — into-wind aileron on the roll-out',
    },
    {
      date: '16/05/2026',
      depPlace: 'LELL',
      depTime: '10:00',
      arrPlace: 'LELL',
      arrTime: '11:12',
      model: 'Cessna 152',
      reg: 'EC-DMC',
      se: '1:12',
      total: '1:12',
      pic: 'K. Ashford',
      landingsDay: 6,
      remarks:
        'Pre-solo consolidation — emergency briefs, local area, standards check',
    },
    {
      date: '13/06/2026',
      depPlace: 'LELL',
      depTime: '09:30',
      arrPlace: 'LELL',
      arrTime: '09:45',
      model: 'Cessna 152',
      reg: 'EC-DMC',
      se: '0:15',
      total: '0:15',
      pic: 'N. Becker',
      landingsDay: 1,
      remarks: 'First solo — one circuit RWY 13',
    },
    {
      date: '11/07/2026',
      depPlace: 'LELL',
      depTime: '10:00',
      arrPlace: 'LELL',
      arrTime: '10:48',
      model: 'Cessna 152',
      reg: 'EC-DMC',
      se: '0:48',
      total: '0:48',
      pic: 'K. Ashford',
      landingsDay: 5,
      remarks: 'Post-solo circuit consolidation, dual',
    },
    {
      date: '08/08/2026',
      depPlace: 'LELL',
      depTime: '09:15',
      arrPlace: 'LELL',
      arrTime: '10:21',
      model: 'Cessna 152',
      reg: 'EC-DRV',
      se: '1:06',
      total: '1:06',
      pic: 'K. Ashford',
      landingsDay: 2,
      remarks:
        'Upper-air work — steep turns 45°, stalling revision, incipient spin',
    },
    {
      date: '30/08/2026',
      depPlace: 'LELL',
      depTime: '10:30',
      arrPlace: 'LELL',
      arrTime: '11:12',
      model: 'Cessna 152',
      reg: 'EC-DMC',
      se: '0:42',
      total: '0:42',
      pic: 'N. Becker',
      landingsDay: 1,
      remarks: 'Solo — local training area, general handling',
    },
  ],
}

// Jamie's logbook resolves to the demo persona; the rest resolve by name.
function buildLogbookEntries(
  studentIdByName: Record<string, string>,
): Omit<LogbookEntry, '_id'>[] {
  return [
    ...logbookEntries.map((entry) => ({
      ...entry,
      studentId: studentIdByName[demoStudentName],
    })),
    ...Object.entries(LOGBOOK_BY_STUDENT).flatMap(([name, entries]) =>
      entries.map((entry) => ({
        ...entry,
        studentId: studentIdByName[name],
      })),
    ),
  ]
}

// Mailbox emails and course progress are the demo persona's own records
// and carry no per-row name, so they resolve to the one real seeded
// student id rather than a per-entry lookup.
function withDemoStudentId<T extends object>(
  entries: T[],
  studentIdByName: Record<string, string>,
): (T & { studentId: string })[] {
  return entries.map((entry) => ({
    ...entry,
    studentId: studentIdByName[demoStudentName],
  }))
}

// `person` holds the student's name (matching BookingsService.create, see
// toDisplayDate's callers) and `instructorName` the full instructor name
// used to resolve a real instructorId. These are the demo student's own
// past lessons, so `person` is the same student throughout.
type LegacyBookingSeed = Omit<Booking, '_id' | 'instructorId' | 'studentId'> & {
  instructorName: string
}

const bookings: LegacyBookingSeed[] = [
  {
    type: 'Instruction',
    date: '15/08/2026',
    tail: 'EC-ERV',
    person: 'Jamie Torres',
    time: '10:00 - 11:30',
    instructorName: 'James Whitfield',
    trainingCode: 'VBD10',
  },
  {
    type: 'Instruction',
    date: '16/08/2026',
    tail: 'EC-ERV',
    person: 'Jamie Torres',
    time: '15:00 - 17:00',
    instructorName: 'Kate Ashford',
    trainingCode: 'VBD11',
  },
  {
    type: 'Instruction',
    date: '17/08/2026',
    tail: 'EC-ERV',
    person: 'Jamie Torres',
    time: '09:00 - 10:30',
    instructorName: 'James Whitfield',
    trainingCode: 'VBD12',
  },
  {
    type: 'Instruction',
    date: '18/08/2026',
    tail: 'EC-ERV',
    person: 'Jamie Torres',
    time: '13:00 - 14:30',
    instructorName: 'James Whitfield',
    trainingCode: 'VBD13',
  },
]

// Resolves the real per-student and per-instructor ids for the legacy demo
// bookings. `person` holds the student's name, `instructorName` the
// instructor's — both keyed off the seeded docs so the homepage's
// per-student booking filter matches the default demo persona.
function withResolvedIds(
  entries: LegacyBookingSeed[],
  studentIdByName: Record<string, string>,
  instructorIdByName: Record<string, string>,
  aircraftIdByArcid: Record<string, string>,
): Omit<Booking, '_id'>[] {
  return entries.map(({ instructorName, ...entry }) => ({
    ...entry,
    studentId: studentIdByName[entry.person],
    instructorId: instructorIdByName[instructorName],
    aircraftId: toAircraftObjectId(
      entry.tail ? aircraftIdByArcid[entry.tail] : undefined,
    ),
  }))
}

// Resolves each legacy flight evaluation to its real student id (keyed by
// the `student` name) so the homepage's per-student signature filter
// matches.
function withResolvedStudentId(
  entries: Omit<FlightEvaluation, '_id' | 'studentId'>[],
  studentIdByName: Record<string, string>,
): Omit<FlightEvaluation, '_id'>[] {
  return entries.map((entry) => ({
    ...entry,
    studentId: studentIdByName[entry.student],
  }))
}

// Flight evaluations double as the source of the "missing signatures"
// shown on the homepage. Every evaluation below lines up 1:1 with a
// `logbookEntries` row (date / aircraft / instructor / time / landings
// match); 3847780 (07/07/2026) and 3956214 (18/07/2026) are the demo
// persona's two still-unsigned evaluations.
const flightEvaluationCourse = 'PPL Flight Phase (A_1_PPL(A)_v2_FLT)'
const irFlightPhaseCourse = 'IR Flight Phase (A_5_IR(A)_v2_FLT)'
const cplFlightPhaseCourse = 'CPL Flight Phase (A_4_CPL(A)_v2_FLT)'
const flightEvaluationRoute = 'LELL - LELL'

const flightEvaluations: Omit<FlightEvaluation, '_id' | 'studentId'>[] = [
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
    landingsDual: 3,
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
    flightTimeDual: '01:22',
    flightTimeSolo: '00:00',
    landingsDual: 4,
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
    flightTimeDual: '01:12',
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
    flightTimeDual: '01:10',
    flightTimeSolo: '00:00',
    landingsDual: 5,
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
    flightTimeDual: '01:19',
    flightTimeSolo: '00:00',
    landingsDual: 4,
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
    flightTimeDual: '01:10',
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
    flightTimeDual: '00:58',
    flightTimeSolo: '00:00',
    landingsDual: 5,
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
    flightTimeDual: '01:06',
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
    flightTimeDual: '01:06',
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
  },
  {
    sessionId: '3956214',
    date: '18/07/2026',
    type: 'Instruction',
    signed: false,
    student: 'Jamie Torres',
    instructor: 'K. Ashford',
    course: flightEvaluationCourse,
    sessionTitle: 'Night circuits',
    aircraft: 'EC-EXL',
    role: 'DUAL',
    route: flightEvaluationRoute,
    flightTimeDual: '01:11',
    flightTimeSolo: '00:00',
    landingsDual: 2,
    landingsSolo: 0,
    maneuvers: [{ title: 'NIT02 - Night circuits', score: '3' }],
    observations:
      'Second night session: circuits at LELL, RWY13, with normal and flapless approaches flown on the runway and PAPI lighting, plus a simulated electrical failure and torch drill.\n\nCircuit geometry and radio calls were consistent throughout, and the flare judgement in the reduced visual cues is close to the day standard now. One more night session before the dual night cross-country.',
    scorePreparation: 3,
    scoreTechnique: 4,
    scoreInitiative: 3,
    scoreInterest: 4,
    scoreAssimilation: 3,
    finalScore: 3,
    finalNote: 'APTO, pasa a la siguiente fase',
  },
]

// Signed evaluations for the other students, lined up with their
// LOGBOOK_BY_STUDENT entries (date / aircraft / instructor / times match).
// A representative subset rather than one per flight; the most recent
// couple of lessons for Alex and Priya are left unsigned in
// pendingEvaluations below so each persona still has a "missing
// signatures" list. Solo flights (no instructor sign-off) have no entry.
const additionalFlightEvaluations: Omit<
  FlightEvaluation,
  '_id' | 'studentId'
>[] = [
  {
    sessionId: '4090012',
    date: '12/05/2026',
    type: 'Instruction',
    signed: true,
    student: 'Alex Moreau',
    instructor: 'J. Whitfield',
    course: irFlightPhaseCourse,
    sessionTitle: 'Basic instrument flying',
    aircraft: 'EC-JTJ',
    role: 'DUAL',
    route: flightEvaluationRoute,
    flightTimeDual: '01:18',
    flightTimeSolo: '00:00',
    landingsDual: 1,
    landingsSolo: 0,
    maneuvers: [
      { title: 'IFR01 - Attitude instrument flying (full panel)', score: '3' },
      { title: 'IFR02 - Partial-panel flight', score: '3' },
    ],
    observations:
      'Introductory instrument sortie: full and partial-panel attitude flying, rate-1 turns and standard climbs and descents. Scan is developing; tends to fixate on the attitude indicator under partial panel.',
    scorePreparation: 3,
    scoreTechnique: 3,
    scoreInitiative: 3,
    scoreInterest: 4,
    scoreAssimilation: 3,
    finalScore: 3,
    finalNote: 'APTO, pasa a la siguiente fase',
  },
  {
    sessionId: '4090847',
    date: '19/05/2026',
    type: 'Instruction',
    signed: true,
    student: 'Alex Moreau',
    instructor: 'J. Whitfield',
    course: irFlightPhaseCourse,
    sessionTitle: 'Unusual attitudes and compass turns',
    aircraft: 'EC-JTJ',
    role: 'DUAL',
    route: flightEvaluationRoute,
    flightTimeDual: '01:24',
    flightTimeSolo: '00:00',
    landingsDual: 1,
    landingsSolo: 0,
    maneuvers: [
      { title: 'IFR03 - Unusual attitude recovery', score: '3' },
      { title: 'IFR04 - Timed compass turns', score: '3' },
    ],
    observations:
      'Recovery from unusual attitudes full and partial panel, and timed turns onto compass headings. Recoveries prompt and correctly prioritised; timing on the compass turns still runs a little long.',
    scorePreparation: 3,
    scoreTechnique: 3,
    scoreInitiative: 3,
    scoreInterest: 3,
    scoreAssimilation: 3,
    finalScore: 3,
    finalNote: 'APTO, pasa a la siguiente fase',
  },
  {
    sessionId: '4091533',
    date: '26/05/2026',
    type: 'Instruction',
    signed: true,
    student: 'Alex Moreau',
    instructor: 'K. Ashford',
    course: irFlightPhaseCourse,
    sessionTitle: 'VOR and DME navigation',
    aircraft: 'EC-JOB',
    role: 'DUAL',
    route: flightEvaluationRoute,
    flightTimeDual: '01:36',
    flightTimeSolo: '00:00',
    landingsDual: 1,
    landingsSolo: 0,
    maneuvers: [
      { title: 'NAV-IR01 - VOR tracking and interception', score: '3' },
      { title: 'NAV-IR02 - DME arcs', score: '3' },
    ],
    observations:
      'Radial interception and tracking, DME arcs and fix-to-fix. Good situational awareness; wind correction on the arcs needs to be anticipated rather than chased.',
    scorePreparation: 3,
    scoreTechnique: 3,
    scoreInitiative: 3,
    scoreInterest: 4,
    scoreAssimilation: 3,
    finalScore: 3,
    finalNote: 'APTO, pasa a la siguiente fase',
  },
  {
    sessionId: '4092280',
    date: '02/06/2026',
    type: 'Instruction',
    signed: true,
    student: 'Alex Moreau',
    instructor: 'J. Whitfield',
    course: irFlightPhaseCourse,
    sessionTitle: 'NDB navigation',
    aircraft: 'EC-JTJ',
    role: 'DUAL',
    route: flightEvaluationRoute,
    flightTimeDual: '01:30',
    flightTimeSolo: '00:00',
    landingsDual: 1,
    landingsSolo: 0,
    maneuvers: [
      { title: 'NAV-IR03 - ADF orientation and homing', score: '3' },
      { title: 'NAV-IR04 - NDB tracking with drift', score: '3' },
    ],
    observations:
      'ADF orientation, homing and tracking with a drift allowance. Mental picture of bearings is solid; keep the workload down by setting the RMI early.',
    scorePreparation: 3,
    scoreTechnique: 3,
    scoreInitiative: 3,
    scoreInterest: 3,
    scoreAssimilation: 4,
    finalScore: 3,
    finalNote: 'APTO, pasa a la siguiente fase',
  },
  {
    sessionId: '4093104',
    date: '09/06/2026',
    type: 'Instruction',
    signed: true,
    student: 'Alex Moreau',
    instructor: 'J. Whitfield',
    course: irFlightPhaseCourse,
    sessionTitle: 'Holding patterns',
    aircraft: 'EC-JPY',
    role: 'DUAL',
    route: flightEvaluationRoute,
    flightTimeDual: '01:30',
    flightTimeSolo: '00:00',
    landingsDual: 1,
    landingsSolo: 0,
    maneuvers: [
      { title: 'IAP01 - Holding pattern entries', score: '3' },
      { title: 'IAP02 - Holding timing and drift', score: '3' },
    ],
    observations:
      'Direct, parallel and teardrop entries at CJN with timing and drift correction. Entries chosen correctly; outbound timing improving with the wind allowance.',
    scorePreparation: 4,
    scoreTechnique: 3,
    scoreInitiative: 3,
    scoreInterest: 4,
    scoreAssimilation: 3,
    finalScore: 3,
    finalNote: 'APTO, pasa a la siguiente fase',
  },
  {
    sessionId: '4093995',
    date: '16/06/2026',
    type: 'Instruction',
    signed: true,
    student: 'Alex Moreau',
    instructor: 'K. Ashford',
    course: irFlightPhaseCourse,
    sessionTitle: 'ILS approaches',
    aircraft: 'EC-JOB',
    role: 'DUAL',
    route: flightEvaluationRoute,
    flightTimeDual: '01:30',
    flightTimeSolo: '00:00',
    landingsDual: 3,
    landingsSolo: 0,
    maneuvers: [
      { title: 'IAP03 - ILS approach (raw data)', score: '3' },
      { title: 'IAP04 - Go-around from decision altitude', score: '3' },
    ],
    observations:
      'Three ILS RWY 06 approaches, one flown raw-data, and a go-around from decision altitude. Localiser tracking is tidy; on the raw-data approach the glidepath was chased slightly late.',
    scorePreparation: 3,
    scoreTechnique: 3,
    scoreInitiative: 3,
    scoreInterest: 4,
    scoreAssimilation: 3,
    finalScore: 3,
    finalNote: 'APTO, pasa a la siguiente fase',
  },
  {
    sessionId: '4094881',
    date: '23/06/2026',
    type: 'Instruction',
    signed: true,
    student: 'Alex Moreau',
    instructor: 'J. Whitfield',
    course: irFlightPhaseCourse,
    sessionTitle: 'Non-precision approaches',
    aircraft: 'EC-JTJ',
    role: 'DUAL',
    route: 'LELL - LEVD - LELL',
    flightTimeDual: '01:36',
    flightTimeSolo: '00:00',
    landingsDual: 2,
    landingsSolo: 0,
    maneuvers: [
      { title: 'IAP05 - VOR/DME approach', score: '3' },
      { title: 'IAP06 - NDB approach', score: '3' },
      { title: 'IAP07 - Missed approach and hold', score: '3' },
    ],
    observations:
      'VOR/DME and NDB approaches at LEVD with the published missed approach and hold. Profile management good; step-down fixes on the NDB approach were a touch high.',
    scorePreparation: 3,
    scoreTechnique: 3,
    scoreInitiative: 4,
    scoreInterest: 3,
    scoreAssimilation: 3,
    finalScore: 3,
    finalNote: 'APTO, pasa a la siguiente fase',
  },
  {
    sessionId: '4095720',
    date: '30/06/2026',
    type: 'Instruction',
    signed: true,
    student: 'Alex Moreau',
    instructor: 'J. Whitfield',
    course: irFlightPhaseCourse,
    sessionTitle: 'Partial-panel approaches',
    aircraft: 'EC-JPY',
    role: 'DUAL',
    route: flightEvaluationRoute,
    flightTimeDual: '01:30',
    flightTimeSolo: '00:00',
    landingsDual: 2,
    landingsSolo: 0,
    maneuvers: [
      { title: 'IAP08 - Partial-panel ILS', score: '3' },
      { title: 'IAP09 - Localiser-only approach', score: '3' },
      { title: 'IAP10 - Timed turns', score: '3' },
    ],
    observations:
      'Partial-panel ILS and localiser-only approaches with timed turns and simulated instrument failures. Workload handling is the strong point; heading control degrades a little when task-saturated.',
    scorePreparation: 3,
    scoreTechnique: 3,
    scoreInitiative: 3,
    scoreInterest: 4,
    scoreAssimilation: 3,
    finalScore: 3,
    finalNote: 'APTO, pasa a la siguiente fase',
  },
  {
    sessionId: '4200145',
    date: '14/02/2026',
    type: 'Instruction',
    signed: true,
    student: 'Priya Shah',
    instructor: 'K. Ashford',
    course: irFlightPhaseCourse,
    sessionTitle: 'Basic instrument flying',
    aircraft: 'EC-JTJ',
    role: 'DUAL',
    route: flightEvaluationRoute,
    flightTimeDual: '01:18',
    flightTimeSolo: '00:00',
    landingsDual: 1,
    landingsSolo: 0,
    maneuvers: [
      { title: 'IFR01 - Attitude instrument flying', score: '4' },
      { title: 'IFR02 - Partial-panel flight', score: '3' },
    ],
    observations:
      'First sortie of the IR course. As a current PPL holder the partial-panel scan came together quickly; rate-1 turns and standard profiles held to tolerance.',
    scorePreparation: 4,
    scoreTechnique: 4,
    scoreInitiative: 3,
    scoreInterest: 4,
    scoreAssimilation: 4,
    finalScore: 4,
    finalNote: 'APTO, pasa a la siguiente fase',
  },
  {
    sessionId: '4200832',
    date: '07/03/2026',
    type: 'Instruction',
    signed: true,
    student: 'Priya Shah',
    instructor: 'J. Whitfield',
    course: irFlightPhaseCourse,
    sessionTitle: 'Radio navigation',
    aircraft: 'EC-JOB',
    role: 'DUAL',
    route: flightEvaluationRoute,
    flightTimeDual: '01:30',
    flightTimeSolo: '00:00',
    landingsDual: 1,
    landingsSolo: 0,
    maneuvers: [
      { title: 'NAV-IR01 - VOR tracking', score: '4' },
      { title: 'NAV-IR02 - ADF homing', score: '4' },
      { title: 'NAV-IR03 - DME arcs', score: '4' },
    ],
    observations:
      'VOR radial work, ADF homing and DME arcs. Accurate tracking and anticipates the intercept well.',
    scorePreparation: 4,
    scoreTechnique: 4,
    scoreInitiative: 4,
    scoreInterest: 4,
    scoreAssimilation: 4,
    finalScore: 4,
    finalNote: 'APTO, pasa a la siguiente fase',
  },
  {
    sessionId: '4201560',
    date: '28/03/2026',
    type: 'Instruction',
    signed: true,
    student: 'Priya Shah',
    instructor: 'K. Ashford',
    course: irFlightPhaseCourse,
    sessionTitle: 'Holding and ILS',
    aircraft: 'EC-JTJ',
    role: 'DUAL',
    route: flightEvaluationRoute,
    flightTimeDual: '01:24',
    flightTimeSolo: '00:00',
    landingsDual: 2,
    landingsSolo: 0,
    maneuvers: [
      { title: 'IAP01 - Holding pattern entries', score: '4' },
      { title: 'IAP02 - ILS approach to minimums', score: '4' },
    ],
    observations:
      'Holding entries at CJN and ILS RWY 06 to minimums. Consistent on the localiser with precise glidepath control.',
    scorePreparation: 4,
    scoreTechnique: 4,
    scoreInitiative: 3,
    scoreInterest: 4,
    scoreAssimilation: 4,
    finalScore: 4,
    finalNote: 'APTO, pasa a la siguiente fase',
  },
  {
    sessionId: '4202293',
    date: '18/04/2026',
    type: 'Instruction',
    signed: true,
    student: 'Priya Shah',
    instructor: 'J. Whitfield',
    course: irFlightPhaseCourse,
    sessionTitle: 'Non-precision approaches',
    aircraft: 'EC-JPY',
    role: 'DUAL',
    route: 'LELL - LEVD - LELL',
    flightTimeDual: '01:36',
    flightTimeSolo: '00:00',
    landingsDual: 1,
    landingsSolo: 0,
    maneuvers: [
      { title: 'IAP03 - VOR/DME approach', score: '4' },
      { title: 'IAP04 - NDB approach', score: '4' },
      { title: 'IAP05 - Missed approach', score: '4' },
    ],
    observations:
      'VOR/DME and NDB approaches at LEVD with the published missed approach. Profile flown accurately with good energy management.',
    scorePreparation: 4,
    scoreTechnique: 4,
    scoreInitiative: 4,
    scoreInterest: 4,
    scoreAssimilation: 4,
    finalScore: 4,
    finalNote: 'APTO, pasa a la siguiente fase',
  },
  {
    sessionId: '4203015',
    date: '09/05/2026',
    type: 'Instruction',
    signed: true,
    student: 'Priya Shah',
    instructor: 'K. Ashford',
    course: irFlightPhaseCourse,
    sessionTitle: 'IFR cross-country',
    aircraft: 'EC-JOB',
    role: 'DUAL',
    route: 'LELL - LERS - LELL',
    flightTimeDual: '02:12',
    flightTimeSolo: '00:00',
    landingsDual: 2,
    landingsSolo: 0,
    maneuvers: [
      { title: 'NAV-IR04 - Airways joining', score: '4' },
      { title: 'IAP06 - Procedural approach on return', score: '4' },
    ],
    observations:
      'IFR navigation LELL–LERS–LELL, airway joining and a procedural approach on return. Workload well organised throughout.',
    scorePreparation: 4,
    scoreTechnique: 4,
    scoreInitiative: 4,
    scoreInterest: 4,
    scoreAssimilation: 4,
    finalScore: 4,
    finalNote: 'APTO, pasa a la siguiente fase',
  },
  {
    sessionId: '4203748',
    date: '30/05/2026',
    type: 'Instruction',
    signed: true,
    student: 'Priya Shah',
    instructor: 'J. Whitfield',
    course: irFlightPhaseCourse,
    sessionTitle: 'IR skill-test rehearsal',
    aircraft: 'EC-JTJ',
    role: 'DUAL',
    route: flightEvaluationRoute,
    flightTimeDual: '01:42',
    flightTimeSolo: '00:00',
    landingsDual: 2,
    landingsSolo: 0,
    maneuvers: [
      { title: 'IAP07 - Precision approach', score: '4' },
      { title: 'IAP08 - Non-precision approach', score: '4' },
      { title: 'IFR03 - Partial-panel approach', score: '4' },
    ],
    observations:
      'Full IR profile rehearsal: hold, precision and non-precision approach, partial panel. Flown to test standard.',
    scorePreparation: 4,
    scoreTechnique: 4,
    scoreInitiative: 4,
    scoreInterest: 4,
    scoreAssimilation: 4,
    finalScore: 4,
    finalNote: 'APTO, pasa a la siguiente fase',
  },
  {
    sessionId: '4204471',
    date: '10/06/2026',
    type: 'Skill test',
    signed: true,
    student: 'Priya Shah',
    instructor: 'J. Whitfield',
    course: irFlightPhaseCourse,
    sessionTitle: 'IR skill test',
    aircraft: 'EC-JOB',
    role: 'DUAL',
    route: 'LELL - LEVD - LELL',
    flightTimeDual: '01:48',
    flightTimeSolo: '00:00',
    landingsDual: 2,
    landingsSolo: 0,
    maneuvers: [
      { title: 'SKT-IR01 - Departure and airway', score: '4' },
      { title: 'SKT-IR02 - Holding', score: '4' },
      { title: 'SKT-IR03 - ILS RWY 06 LELL', score: '4' },
      { title: 'SKT-IR04 - VOR/DME approach LEVD', score: '4' },
      { title: 'SKT-IR05 - Partial panel and diversion', score: '4' },
    ],
    observations:
      'IR skill test — pass. All sections flown to standard; the partial-panel non-precision approach was the strongest item.',
    scorePreparation: 4,
    scoreTechnique: 4,
    scoreInitiative: 4,
    scoreInterest: 4,
    scoreAssimilation: 4,
    finalScore: 4,
    finalNote: 'APTO — IR(A) superado',
  },
  {
    sessionId: '4205199',
    date: '08/08/2026',
    type: 'Instruction',
    signed: true,
    student: 'Priya Shah',
    instructor: 'J. Whitfield',
    course: cplFlightPhaseCourse,
    sessionTitle: 'Complex conversion and commercial manoeuvres',
    aircraft: 'EC-KOP',
    role: 'DUAL',
    route: flightEvaluationRoute,
    flightTimeDual: '01:24',
    flightTimeSolo: '00:00',
    landingsDual: 3,
    landingsSolo: 0,
    maneuvers: [
      { title: 'CPL01 - C182 systems and complex checks', score: '4' },
      { title: 'CPL02 - Steep turns', score: '4' },
      { title: 'CPL03 - Slow flight', score: '3' },
    ],
    observations:
      'C182 complex conversion — constant-speed propeller, cowl flaps and systems — then steep turns and slow flight to commercial tolerances. Handling of the heavier aircraft is confident.',
    scorePreparation: 4,
    scoreTechnique: 4,
    scoreInitiative: 4,
    scoreInterest: 4,
    scoreAssimilation: 3,
    finalScore: 4,
    finalNote: 'APTO, pasa a la siguiente fase',
  },
  {
    sessionId: '4300218',
    date: '11/10/2025',
    type: 'Instruction',
    signed: true,
    student: 'Noah Becker',
    instructor: 'K. Ashford',
    course: flightEvaluationCourse,
    sessionTitle: 'Air experience and effects of controls',
    aircraft: 'EC-DMC',
    role: 'DUAL',
    route: flightEvaluationRoute,
    flightTimeDual: '00:48',
    flightTimeSolo: '00:00',
    landingsDual: 1,
    landingsSolo: 0,
    maneuvers: [
      { title: 'FAM01 - Air experience', score: '3' },
      {
        title: 'EFC01 - Primary and secondary effects of controls',
        score: '2',
      },
    ],
    observations:
      'First lesson: taxiing, primary and secondary effects of controls, and the attitude-and-power relationship. Relaxed at the controls; needs to bring lookout further outside.',
    scorePreparation: 2,
    scoreTechnique: 2,
    scoreInitiative: 3,
    scoreInterest: 4,
    scoreAssimilation: 3,
    finalScore: 3,
    finalNote: 'APTO, pasa a la siguiente fase',
  },
  {
    sessionId: '4300941',
    date: '17/01/2026',
    type: 'Instruction',
    signed: true,
    student: 'Noah Becker',
    instructor: 'K. Ashford',
    course: flightEvaluationCourse,
    sessionTitle: 'Stalling',
    aircraft: 'EC-GHT',
    role: 'DUAL',
    route: flightEvaluationRoute,
    flightTimeDual: '01:12',
    flightTimeSolo: '00:00',
    landingsDual: 1,
    landingsSolo: 0,
    maneuvers: [
      { title: 'STL01 - Stall recognition and recovery', score: '3' },
      { title: 'STL02 - Stalling with flap', score: '2' },
    ],
    observations:
      'Clean and flapped stalls, recognition and recovery, plus incipient-spin awareness. Recovery actions in the right order; still adding power a little late.',
    scorePreparation: 3,
    scoreTechnique: 2,
    scoreInitiative: 3,
    scoreInterest: 3,
    scoreAssimilation: 3,
    finalScore: 3,
    finalNote: 'APTO, pasa a la siguiente fase',
  },
  {
    sessionId: '4301663',
    date: '07/02/2026',
    type: 'Instruction',
    signed: true,
    student: 'Noah Becker',
    instructor: 'K. Ashford',
    course: flightEvaluationCourse,
    sessionTitle: 'Introduction to the circuit',
    aircraft: 'EC-DMC',
    role: 'DUAL',
    route: flightEvaluationRoute,
    flightTimeDual: '01:00',
    flightTimeSolo: '00:00',
    landingsDual: 4,
    landingsSolo: 0,
    maneuvers: [
      { title: 'CCT01 - Circuit pattern and RT', score: '3' },
      { title: 'CCT02 - Normal approach and landing', score: '2' },
    ],
    observations:
      'First circuit lesson, RWY 13: pattern, radio calls and the normal approach and landing. Downwind checks flowing; roundout still high.',
    scorePreparation: 3,
    scoreTechnique: 2,
    scoreInitiative: 3,
    scoreInterest: 4,
    scoreAssimilation: 3,
    finalScore: 3,
    finalNote: 'APTO, pasa a la siguiente fase',
  },
  {
    sessionId: '4302385',
    date: '28/02/2026',
    type: 'Instruction',
    signed: true,
    student: 'Noah Becker',
    instructor: 'K. Ashford',
    course: flightEvaluationCourse,
    sessionTitle: 'Circuit consolidation',
    aircraft: 'EC-DRV',
    role: 'DUAL',
    route: flightEvaluationRoute,
    flightTimeDual: '01:06',
    flightTimeSolo: '00:00',
    landingsDual: 5,
    landingsSolo: 0,
    maneuvers: [
      { title: 'CCT03 - Flapless approach', score: '3' },
      { title: 'CCT04 - Glide approach', score: '3' },
    ],
    observations:
      'Flapless and glide approaches. Circuit shape more consistent; judgement of the glide approach aiming point is improving.',
    scorePreparation: 3,
    scoreTechnique: 3,
    scoreInitiative: 3,
    scoreInterest: 3,
    scoreAssimilation: 3,
    finalScore: 3,
    finalNote: 'APTO, pasa a la siguiente fase',
  },
  {
    sessionId: '4303107',
    date: '21/03/2026',
    type: 'Instruction',
    signed: true,
    student: 'Noah Becker',
    instructor: 'J. Whitfield',
    course: flightEvaluationCourse,
    sessionTitle: 'Circuit emergencies',
    aircraft: 'EC-DMC',
    role: 'DUAL',
    route: flightEvaluationRoute,
    flightTimeDual: '01:00',
    flightTimeSolo: '00:00',
    landingsDual: 4,
    landingsSolo: 0,
    maneuvers: [
      { title: 'EMG01 - Engine failure after take-off', score: '3' },
      { title: 'EMG02 - Glide approach', score: '3' },
      { title: 'EMG03 - Go-around', score: '3' },
    ],
    observations:
      'Engine failure after take-off, glide approach and go-around. Attitude flown first, checks from memory; go-around drill is crisp.',
    scorePreparation: 3,
    scoreTechnique: 3,
    scoreInitiative: 3,
    scoreInterest: 4,
    scoreAssimilation: 3,
    finalScore: 3,
    finalNote: 'APTO, pasa a la siguiente fase',
  },
  {
    sessionId: '4303829',
    date: '18/04/2026',
    type: 'Instruction',
    signed: true,
    student: 'Noah Becker',
    instructor: 'K. Ashford',
    course: flightEvaluationCourse,
    sessionTitle: 'Crosswind circuits',
    aircraft: 'EC-EXL',
    role: 'DUAL',
    route: flightEvaluationRoute,
    flightTimeDual: '00:54',
    flightTimeSolo: '00:00',
    landingsDual: 5,
    landingsSolo: 0,
    maneuvers: [
      { title: 'CCT05 - Crosswind take-off', score: '3' },
      { title: 'CCT06 - Crosswind approach and landing', score: '2' },
    ],
    observations:
      'Crosswind circuits on RWY 31 with into-wind aileron on the roll-out. Drift held on the approach; occasionally lands slightly crabbed.',
    scorePreparation: 3,
    scoreTechnique: 2,
    scoreInitiative: 3,
    scoreInterest: 3,
    scoreAssimilation: 3,
    finalScore: 3,
    finalNote: 'APTO, pasa a la siguiente fase',
  },
  {
    sessionId: '4304551',
    date: '16/05/2026',
    type: 'Instruction',
    signed: true,
    student: 'Noah Becker',
    instructor: 'K. Ashford',
    course: flightEvaluationCourse,
    sessionTitle: 'Pre-solo consolidation',
    aircraft: 'EC-DMC',
    role: 'DUAL',
    route: flightEvaluationRoute,
    flightTimeDual: '01:12',
    flightTimeSolo: '00:00',
    landingsDual: 6,
    landingsSolo: 0,
    maneuvers: [
      { title: 'CCT07 - Circuit consolidation', score: '3' },
      { title: 'EMG04 - Emergency briefings', score: '3' },
    ],
    observations:
      'Pre-solo check: circuits, emergency briefings and the local area. Standard consistent across six landings; safe and ready for first solo.',
    scorePreparation: 4,
    scoreTechnique: 3,
    scoreInitiative: 3,
    scoreInterest: 4,
    scoreAssimilation: 4,
    finalScore: 3,
    finalNote: 'APTO, pasa a la siguiente fase',
  },
  {
    sessionId: '4305273',
    date: '13/06/2026',
    type: 'Skill test',
    signed: true,
    student: 'Noah Becker',
    instructor: 'K. Ashford',
    course: flightEvaluationCourse,
    sessionTitle: 'First solo',
    aircraft: 'EC-DMC',
    role: 'PIC',
    route: flightEvaluationRoute,
    flightTimeDual: '00:00',
    flightTimeSolo: '00:15',
    landingsDual: 0,
    landingsSolo: 1,
    maneuvers: [{ title: 'SOLO01 - First solo circuit', score: '3' }],
    observations:
      'First solo — one circuit on RWY 13 under supervision. Circuit flown accurately and to briefing; a confident, safe first solo.',
    scorePreparation: 4,
    scoreTechnique: 3,
    scoreInitiative: 4,
    scoreInterest: 4,
    scoreAssimilation: 4,
    finalScore: 4,
    finalNote: 'APTO, pasa a la siguiente fase',
  },
  {
    sessionId: '4305995',
    date: '11/07/2026',
    type: 'Instruction',
    signed: true,
    student: 'Noah Becker',
    instructor: 'K. Ashford',
    course: flightEvaluationCourse,
    sessionTitle: 'Post-solo circuit consolidation',
    aircraft: 'EC-DMC',
    role: 'DUAL',
    route: flightEvaluationRoute,
    flightTimeDual: '00:48',
    flightTimeSolo: '00:00',
    landingsDual: 5,
    landingsSolo: 0,
    maneuvers: [{ title: 'CCT08 - Post-solo consolidation', score: '3' }],
    observations:
      'Dual consolidation after first solo. Standard maintained; ready to begin solo circuit practice next.',
    scorePreparation: 3,
    scoreTechnique: 3,
    scoreInitiative: 3,
    scoreInterest: 4,
    scoreAssimilation: 3,
    finalScore: 3,
    finalNote: 'APTO, pasa a la siguiente fase',
  },
]

// Pending (unsigned) evaluations for the other students, so every persona
// has a realistic "missing signatures" list. Stand-in for the real
// report-authoring flow — see TODO-flight-evaluations.md. These are the
// most recent lessons in each student's LOGBOOK_BY_STUDENT (Alex 5, Priya
// 2, Noah 0); the earlier ones are signed in additionalFlightEvaluations.
function pendingEvaluation(
  student: string,
  sessionId: string,
  date: string,
  instructor: string,
  sessionTitle: string,
  aircraft: string,
  opts: {
    course?: string
    route?: string
    flightTimeDual?: string
    landingsDual?: number
  } = {},
): Omit<FlightEvaluation, '_id' | 'studentId'> {
  return {
    sessionId,
    date,
    type: 'Instruction',
    signed: false,
    student,
    instructor,
    course: opts.course ?? flightEvaluationCourse,
    sessionTitle,
    aircraft,
    role: 'DUAL',
    route: opts.route ?? flightEvaluationRoute,
    flightTimeDual: opts.flightTimeDual ?? '01:00',
    flightTimeSolo: '00:00',
    landingsDual: opts.landingsDual ?? 3,
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
  }
}

const pendingEvaluations: Omit<FlightEvaluation, '_id' | 'studentId'>[] = [
  pendingEvaluation(
    'Alex Moreau',
    '4102233',
    '07/07/2026',
    'K. Ashford',
    'IFR cross-country: LELL–LERS–LELL',
    'EC-JOB',
    {
      course: irFlightPhaseCourse,
      route: 'LELL - LERS - LELL',
      flightTimeDual: '02:06',
      landingsDual: 2,
    },
  ),
  pendingEvaluation(
    'Alex Moreau',
    '4108876',
    '21/07/2026',
    'J. Whitfield',
    'IFR cross-country: LELL–LEDA–LEVD–LELL',
    'EC-JTJ',
    {
      course: irFlightPhaseCourse,
      route: 'LELL - LEDA - LEVD - LELL',
      flightTimeDual: '02:18',
      landingsDual: 3,
    },
  ),
  pendingEvaluation(
    'Alex Moreau',
    '4115402',
    '11/08/2026',
    'J. Whitfield',
    'Approach consolidation',
    'EC-JPY',
    { course: irFlightPhaseCourse, flightTimeDual: '01:30', landingsDual: 3 },
  ),
  pendingEvaluation(
    'Alex Moreau',
    '4121999',
    '25/08/2026',
    'K. Ashford',
    'IR skill-test rehearsal',
    'EC-JOB',
    { course: irFlightPhaseCourse, flightTimeDual: '01:42', landingsDual: 2 },
  ),
  pendingEvaluation(
    'Alex Moreau',
    '4128514',
    '01/09/2026',
    'J. Whitfield',
    'Final IR skill-test preparation',
    'EC-JTJ',
    { course: irFlightPhaseCourse, flightTimeDual: '01:36', landingsDual: 2 },
  ),
  pendingEvaluation(
    'Priya Shah',
    '4104510',
    '22/08/2026',
    'K. Ashford',
    'Commercial manoeuvres',
    'EC-KOP',
    { course: cplFlightPhaseCourse, flightTimeDual: '01:30', landingsDual: 4 },
  ),
  pendingEvaluation(
    'Priya Shah',
    '4119088',
    '29/08/2026',
    'J. Whitfield',
    'Advanced take-offs and landings',
    'EC-KOQ',
    { course: cplFlightPhaseCourse, flightTimeDual: '01:12', landingsDual: 6 },
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
    info: 'PPL holder · IR student',
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
    info: 'PPL student',
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
    info: 'PPL holder · CPL student',
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
    info: 'PPL student',
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
    info: 'ATPL holder · CFI',
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
    info: 'CPL holder · Senior Flight Instructor',
  },
]

// Real per-student September bookings — distinct from the `bookings`/
// `calendarEvents` arrays above (all the one demo persona, resolved from
// `demoStudentName`) — these feed the scheduling modal's "already
// scheduled that day" list and buffer check
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

type InstructorTimeOffSeed = {
  instructorName: string
  date: string
  type: 'regular' | 'personal'
  status: 'approved' | 'pending' | 'denied'
  reason?: string
}

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
        type: 'regular',
        status: 'approved',
      })
    }
    for (const weekday of jamesWeekdays) {
      entries.push({
        instructorName: 'James Whitfield',
        date: isoAddDays(weekMonday, weekday - 1),
        type: 'regular',
        status: 'approved',
      })
    }
  }

  return entries
}

// Personal leave on top of the standing weekly days off — enough to show
// every state on the /me/availability page: the CFI's own leave is approved
// on request, another instructor's requests wait for the CFI's decision, and
// a batch of Kate's leave the CFI already signed off (nothing left to review).
const EXPLICIT_INSTRUCTOR_LEAVE: InstructorTimeOffSeed[] = [
  {
    instructorName: 'James Whitfield',
    date: '2026-09-24',
    type: 'personal',
    status: 'approved',
    reason: 'Medical renewal in Madrid',
  },
  {
    instructorName: 'Kate Ashford',
    date: '2026-09-18',
    type: 'personal',
    status: 'pending',
    reason: "Daughter's graduation",
  },
  {
    instructorName: 'Kate Ashford',
    date: '2026-10-02',
    type: 'personal',
    status: 'pending',
    reason: 'Family wedding',
  },
  {
    instructorName: 'Kate Ashford',
    date: '2026-09-08',
    type: 'personal',
    status: 'approved',
    reason: 'Dentist appointment',
  },
  {
    instructorName: 'Kate Ashford',
    date: '2026-09-11',
    type: 'personal',
    status: 'approved',
    reason: 'House move',
  },
  {
    instructorName: 'Kate Ashford',
    date: '2026-09-29',
    type: 'personal',
    status: 'approved',
    reason: 'Family visit',
  },
  {
    instructorName: 'Kate Ashford',
    date: '2026-10-19',
    type: 'personal',
    status: 'approved',
    reason: 'Type-rating refresher',
  },
]

// generateInstructorTimeOff also assigns regular weekly days off; drop any
// that collide with an explicit personal-leave date so an instructor is
// never shown two overlapping entries for the same day (the explicit one
// wins). Covers the whole window the agenda can browse to (3 months, see
// AGENDA_MONTHS_AHEAD in agenda.service.ts) plus slack.
const EXPLICIT_LEAVE_KEYS = new Set(
  EXPLICIT_INSTRUCTOR_LEAVE.map(
    (entry) => `${entry.instructorName}|${entry.date}`,
  ),
)
const INSTRUCTOR_TIME_OFF: InstructorTimeOffSeed[] = [
  ...generateInstructorTimeOff('2026-09-07', 17, 20260907).filter(
    (entry) =>
      !EXPLICIT_LEAVE_KEYS.has(`${entry.instructorName}|${entry.date}`),
  ),
  ...EXPLICIT_INSTRUCTOR_LEAVE,
]

// Reassigns a flight to the other instructor whenever the one it's booked
// with is off that date — generateInstructorTimeOff guarantees the two
// instructors are never both off on the same day, so a swap target always
// exists.
function reassignAwayFromInstructorTimeOff(
  flights: StudentFlightSeed[],
  timeOff: InstructorTimeOffSeed[],
): StudentFlightSeed[] {
  // Only approved time off moves a booking — a pending request hasn't
  // freed the instructor yet.
  const timeOffSet = new Set(
    timeOff
      .filter((entry) => entry.status === 'approved')
      .map((entry) => `${entry.instructorName}|${entry.date}`),
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
  aircraftIdByArcid: Record<string, string>,
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
    const aircraftId = toAircraftObjectId(
      flight.tail ? aircraftIdByArcid[flight.tail] : undefined,
    )

    bookings.push({
      type: flight.lessonType,
      date: toDisplayDate(flight.date),
      aircraftId,
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
      aircraftId,
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

// Jamie Torres's PPL course progress — the demo persona's; the other
// students' progress is in COURSE_PROGRESS_BY_STUDENT below, each keyed to
// the totals in that student's LOGBOOK_BY_STUDENT entries. Same invariant
// here: overallActualHours and the phase actualHours both sum to the 19:08
// flown across `logbookEntries` (all dual, 3:24 of it cross-country).
const courseProgress: Omit<CourseProgress, '_id' | 'studentId'> = {
  overallActualHours: '19:08',
  overallTargetHours: '45:00',
  overallPct: 43,
  vfrTotalHours: '19:08',
  ifrTotalHours: '0:00',
  mccTotalHours: '0:00',
  groups: [
    {
      key: 'currentLesson',
      rows: [
        {
          key: 'syllabus',
          values: {
            vfrDual: '18:00',
            vfrPic: '1:00',
            vfrXc: '3:00',
            acSe: '19:00',
          },
        },
        {
          key: 'actual',
          tone: 'positive',
          values: { vfrDual: '19:08', vfrXc: '3:24', acSe: '19:08' },
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
          values: { vfrDual: '19:08', vfrXc: '3:24', acSe: '19:08' },
        },
        {
          key: 'remaining',
          values: {
            vfrDual: '15:52',
            vfrPic: '10:00',
            vfrXc: '11:36',
            acSe: '25:52',
          },
        },
      ],
    },
  ],
  phases: [
    {
      number: 1,
      actualHours: '1:10',
      targetHours: '2:30',
      pct: 47,
      detail:
        'Basic handling, effects of controls, straight and level, climbing and descending.',
    },
    {
      number: 2,
      actualHours: '12:19',
      targetHours: '13:00',
      pct: 95,
      detail:
        'Circuit training, take-off and landing, stalling, spin awareness.',
    },
    {
      number: 3,
      actualHours: '3:24',
      targetHours: '9:00',
      pct: 38,
      detail: 'Navigation exercises, diversions, radio navigation aids.',
    },
    {
      number: 4,
      actualHours: '2:15',
      targetHours: '19:30',
      pct: 12,
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

// The remaining students' course progress, keyed by name. Progress tracks
// the student's CURRENT course, so the hours are the LOGBOOK_BY_STUDENT
// entries flown on that course:
//   Alex  — part-way through the IR course; all 13 logbook rows count.
//   Priya — early in the CPL course; only her 4 C182 CPL-phase rows count
//           (6:36). Her 7 earlier rows belong to the IR course she has
//           since completed, so they are deliberately not in this total.
//   Noah  — ab-initio PPL, just past first solo; all 14 rows count.
// Phase actualHours always sum to overallActualHours.
const COURSE_PROGRESS_BY_STUDENT: Record<
  string,
  Omit<CourseProgress, '_id' | 'studentId'>
> = {
  'Alex Moreau': {
    overallActualHours: '21:06',
    overallTargetHours: '40:00',
    overallPct: 53,
    vfrTotalHours: '0:00',
    ifrTotalHours: '21:06',
    mccTotalHours: '0:00',
    groups: [
      {
        key: 'currentLesson',
        rows: [
          {
            key: 'syllabus',
            values: { ifrDual: '22:00', ifrXc: '6:00', acSe: '22:00' },
          },
          {
            key: 'actual',
            tone: 'negative',
            values: { ifrDual: '21:06', ifrXc: '6:00', acSe: '21:06' },
          },
          {
            key: 'remaining',
            values: { ifrDual: '0:54', ifrXc: '0:00', acSe: '0:54' },
          },
        ],
      },
      {
        key: 'fullCourse',
        rows: [
          {
            key: 'syllabus',
            values: { ifrDual: '40:00', ifrXc: '10:00', acSe: '40:00' },
          },
          {
            key: 'actual',
            tone: 'negative',
            values: { ifrDual: '21:06', ifrXc: '6:00', acSe: '21:06' },
          },
          {
            key: 'remaining',
            values: { ifrDual: '18:54', ifrXc: '4:00', acSe: '18:54' },
          },
        ],
      },
    ],
    phases: [
      {
        number: 1,
        actualHours: '2:42',
        targetHours: '3:00',
        pct: 90,
        detail:
          'Basic attitude instrument flying, full and partial panel, unusual attitude recoveries.',
      },
      {
        number: 2,
        actualHours: '4:36',
        targetHours: '6:00',
        pct: 77,
        detail:
          'Radio navigation and holding: VOR, ADF and DME tracking, holding pattern entries.',
      },
      {
        number: 3,
        actualHours: '4:36',
        targetHours: '12:00',
        pct: 38,
        detail:
          'Instrument approaches: ILS, VOR/DME, NDB and partial-panel, including the missed approach.',
      },
      {
        number: 4,
        actualHours: '4:24',
        targetHours: '9:00',
        pct: 49,
        detail:
          'IFR cross-country: airways joining, en-route holds and procedural approaches at destination.',
      },
      {
        number: 5,
        actualHours: '4:48',
        targetHours: '10:00',
        pct: 48,
        detail:
          'Skill-test preparation: full IR profile — departure, airway, hold, two approaches, diversion.',
      },
    ],
  },
  'Priya Shah': {
    overallActualHours: '6:36',
    overallTargetHours: '25:00',
    overallPct: 26,
    vfrTotalHours: '6:36',
    ifrTotalHours: '0:00',
    mccTotalHours: '0:00',
    groups: [
      {
        key: 'currentLesson',
        rows: [
          {
            key: 'syllabus',
            values: {
              vfrDual: '5:00',
              vfrPic: '2:00',
              vfrXc: '2:00',
              acSe: '7:00',
            },
          },
          {
            key: 'actual',
            tone: 'positive',
            values: {
              vfrDual: '4:06',
              vfrPic: '2:30',
              vfrXc: '2:30',
              acSe: '6:36',
            },
          },
          {
            key: 'remaining',
            values: {
              vfrDual: '0:54',
              vfrPic: '0:00',
              vfrXc: '0:00',
              acSe: '0:24',
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
              vfrDual: '15:00',
              vfrPic: '8:00',
              vfrNight: '5:00',
              vfrXc: '5:00',
              acSe: '25:00',
            },
          },
          {
            key: 'actual',
            tone: 'negative',
            values: {
              vfrDual: '4:06',
              vfrPic: '2:30',
              vfrXc: '2:30',
              acSe: '6:36',
            },
          },
          {
            key: 'remaining',
            values: {
              vfrDual: '10:54',
              vfrPic: '5:30',
              vfrNight: '5:00',
              vfrXc: '2:30',
              acSe: '18:24',
            },
          },
        ],
      },
    ],
    phases: [
      {
        number: 1,
        actualHours: '1:24',
        targetHours: '3:00',
        pct: 47,
        detail:
          'Complex single-engine conversion: constant-speed propeller, cowl flaps and systems on the C182.',
      },
      {
        number: 2,
        actualHours: '1:30',
        targetHours: '5:00',
        pct: 30,
        detail:
          'Commercial manoeuvres: steep turns, chandelles, lazy eights, steep spiral and eights-on-pylons.',
      },
      {
        number: 3,
        actualHours: '1:12',
        targetHours: '4:00',
        pct: 30,
        detail:
          'Advanced take-offs and landings: short-field, soft-field, precision and the power-off 180.',
      },
      {
        number: 4,
        actualHours: '2:30',
        targetHours: '5:00',
        pct: 50,
        detail:
          'Cross-country as PIC, including the 300 NM qualifying flight to commercial navigation standards.',
      },
      {
        number: 5,
        actualHours: '0:00',
        targetHours: '5:00',
        pct: 0,
        detail:
          'Instrument-flying refresher and night take-offs and landings to CPL requirements.',
      },
      {
        number: 6,
        actualHours: '0:00',
        targetHours: '3:00',
        pct: 0,
        detail:
          'Skill-test preparation: full CPL profile of manoeuvres, circuits, navigation and instrument items.',
      },
    ],
  },
  'Noah Becker': {
    overallActualHours: '13:03',
    overallTargetHours: '45:00',
    overallPct: 29,
    vfrTotalHours: '13:03',
    ifrTotalHours: '0:00',
    mccTotalHours: '0:00',
    groups: [
      {
        key: 'currentLesson',
        rows: [
          {
            key: 'syllabus',
            values: { vfrDual: '12:00', vfrPic: '0:30', acSe: '12:30' },
          },
          {
            key: 'actual',
            tone: 'positive',
            values: { vfrDual: '12:06', vfrPic: '0:57', acSe: '13:03' },
          },
          {
            key: 'remaining',
            values: { vfrDual: '0:00', vfrPic: '0:00', acSe: '0:00' },
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
            values: { vfrDual: '12:06', vfrPic: '0:57', acSe: '13:03' },
          },
          {
            key: 'remaining',
            values: {
              vfrDual: '22:54',
              vfrPic: '9:03',
              vfrXc: '15:00',
              acSe: '31:57',
            },
          },
        ],
      },
    ],
    phases: [
      {
        number: 1,
        actualHours: '5:00',
        targetHours: '2:30',
        pct: 100,
        detail:
          'Basic handling, effects of controls, straight and level, climbing and descending, stalling.',
      },
      {
        number: 2,
        actualHours: '8:03',
        targetHours: '13:00',
        pct: 62,
        detail:
          'Circuit training, take-off and landing, circuit emergencies, first solo and consolidation.',
      },
      {
        number: 3,
        actualHours: '0:00',
        targetHours: '9:00',
        pct: 0,
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
  },
}

// Jamie's progress resolves to the demo persona; the rest resolve by name.
function buildCourseProgress(
  studentIdByName: Record<string, string>,
): Omit<CourseProgress, '_id'>[] {
  return [
    { ...courseProgress, studentId: studentIdByName[demoStudentName] },
    ...Object.entries(COURSE_PROGRESS_BY_STUDENT).map(([name, progress]) => ({
      ...progress,
      studentId: studentIdByName[name],
    })),
  ]
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
      type: entry.type,
      status: entry.status,
      ...(entry.reason ? { reason: entry.reason } : {}),
    })),
    'instructor time off entries',
  )

  const studentFlights = buildStudentFlights(
    studentIdByName,
    instructorIdByName,
    aircraftIdByArcid,
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
  await seedMany(
    courseProgressModel,
    buildCourseProgress(studentIdByName),
    'course progress records',
  )

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
      [
        ...flightEvaluations,
        ...additionalFlightEvaluations,
        ...pendingEvaluations,
      ],
      studentIdByName,
    ),
    'flight evaluations',
  )
  await seedMany(
    logbookEntryModel,
    buildLogbookEntries(studentIdByName),
    'logbook entries',
  )
  await seedMany(
    mailboxEmailModel,
    withDemoStudentId(mailboxEmails, studentIdByName),
    'mailbox emails',
  )
  await seedMany(
    bookingModel,
    [
      ...withResolvedIds(
        bookings,
        studentIdByName,
        instructorIdByName,
        aircraftIdByArcid,
      ),
      ...studentFlights.bookings,
    ],
    'bookings',
  )
  await seedMany(newsItemModel, newsItems, 'news items')

  await app.close()
}

void seed()

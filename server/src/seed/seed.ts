import { NestFactory } from '@nestjs/core'
import { getModelToken } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { AppModule } from '../app.module'
import { CalendarEvent } from '../agenda/schemas/calendar-event.schema'
import { Aircraft } from '../aircraft/schemas/aircraft.schema'
import { AvailabilityEntry } from '../availability/schemas/availability-entry.schema'
import { Booking } from '../bookings/schemas/booking.schema'
import { Certificate } from '../certificates/schemas/certificate.schema'
import { CourseProgress } from '../courses/schemas/course-progress.schema'
import { DocumentFolder } from '../documents/schemas/document-folder.schema'
import { EmergencyContact } from '../emergency-contact/schemas/emergency-contact.schema'
import { FlightEvaluation } from '../flight-evaluations/schemas/flight-evaluation.schema'
import { LogbookEntry } from '../logbook/schemas/logbook-entry.schema'
import { MailboxEmail } from '../mailbox/schemas/mailbox-email.schema'
import { NewsItem } from '../news/schemas/news-item.schema'
import { ScheduleBlock } from '../schedule/schemas/schedule-block.schema'

// Single demo student — no Users module / auth yet, see TODO-BE-setup.md.
const studentId = 'student-1'
const AESA = 'AESA — Agencia Estatal de Seguridad Aérea'
const academy = 'Flight Radar Academy'

const aircraft: Omit<Aircraft, '_id'>[] = [
  {
    arcid: 'EC-GV8',
    type: 'Aeroprakt A-22 LS',
    photoSrc: '/aircraft/aeroprakt-a-22-ls.webp',
  },
  {
    arcid: 'EC-OKE',
    type: 'Airbus Helicopters AS355',
    photoSrc: '/aircraft/airbus-helicopters-as355.webp',
  },
  { arcid: 'F-CEGG', type: 'Alexander Primary Glider' },
  {
    arcid: 'EC-FRB',
    type: 'Aviat Aircraft Inc Pitts S-2B',
    photoSrc: '/aircraft/aviat-aircraft-inc-pitts-s-2b.webp',
  },
  {
    arcid: 'EC-DKN',
    type: 'Cessna 152',
    photoSrc: '/aircraft/cessna-152.webp',
  },
  {
    arcid: 'EC-JTJ',
    type: 'Cessna 172R',
    photoSrc: '/aircraft/cessna-172r.webp',
  },
  {
    arcid: 'EC-JOB',
    type: 'Cessna 172S',
    photoSrc: '/aircraft/cessna-172s.webp',
  },
  {
    arcid: 'EC-KOP',
    type: 'Cessna 182T',
    photoSrc: '/aircraft/cessna-182t.webp',
  },
  {
    arcid: 'EC-CZZ',
    type: 'Cessna FR 172 J',
    photoSrc: '/aircraft/cessna-fr-172-j.webp',
  },
  {
    arcid: 'EC-HIK',
    type: 'Cessna 172N',
    photoSrc: '/aircraft/cessna-172n.webp',
  },
  {
    arcid: 'EC-KLM',
    type: 'Diamond DA40 NG',
    photoSrc: '/aircraft/diamond-da40-ng.webp',
  },
  {
    arcid: 'EC-MNO',
    type: 'Diamond DA42 Twin Star',
    photoSrc: '/aircraft/diamond-da42-twin-star.webp',
  },
  {
    arcid: 'EC-NOP',
    type: 'Piper PA-28-161 Warrior III',
    photoSrc: '/aircraft/piper-pa-28-161-warrior-iii.webp',
  },
  {
    arcid: 'EC-PQR',
    type: 'Piper PA-28R-201 Arrow III',
    photoSrc: '/aircraft/piper-pa-28r-201-arrow-iii.webp',
  },
  {
    arcid: 'EC-QRS',
    type: 'Piper PA-34-220T Seneca',
    photoSrc: '/aircraft/piper-pa-34-220t-seneca.webp',
  },
  {
    arcid: 'EC-RST',
    type: 'Robin DR400/140B',
    photoSrc: '/aircraft/robin-dr400-140b.webp',
  },
  {
    arcid: 'EC-STU',
    type: 'Robinson R22 Beta II',
    photoSrc: '/aircraft/robinson-r22-beta-ii.webp',
  },
  {
    arcid: 'EC-TUV',
    type: 'Robinson R44 Raven II',
    photoSrc: '/aircraft/robinson-r44-raven-ii.webp',
  },
  {
    arcid: 'EC-UVW',
    type: 'Tecnam P2002 Sierra',
    photoSrc: '/aircraft/tecnam-p2002-sierra.webp',
  },
  {
    arcid: 'EC-VWX',
    type: 'Tecnam P2006T',
    photoSrc: '/aircraft/tecnam-p2006t.webp',
  },
  {
    arcid: 'EC-WXY',
    type: 'Tecnam P2008 JC',
    photoSrc: '/aircraft/tecnam-p2008-jc.webp',
  },
  {
    arcid: 'EC-ABC',
    type: 'Tecnam P92 Eaglet',
    photoSrc: '/aircraft/tecnam-p92-eaglet.webp',
  },
  {
    arcid: 'EC-BCD',
    type: 'Zlin Z 242L',
    photoSrc: '/aircraft/zlin-z-242l.webp',
  },
  {
    arcid: 'EC-CDE',
    type: 'Cirrus SR20',
    photoSrc: '/aircraft/cirrus-sr20.webp',
  },
  {
    arcid: 'EC-DEF',
    type: 'Cirrus SR22',
    photoSrc: '/aircraft/cirrus-sr22.webp',
  },
  {
    arcid: 'EC-EFG',
    type: 'Beechcraft F33A Bonanza',
    photoSrc: '/aircraft/beechcraft-f33a-bonanza.webp',
  },
  {
    arcid: 'EC-FGH',
    type: 'Beechcraft A36 Bonanza',
    photoSrc: '/aircraft/beechcraft-a36-bonanza.webp',
  },
  {
    arcid: 'EC-GHI',
    type: 'Socata TB-10 Tobago',
    photoSrc: '/aircraft/socata-tb-10-tobago.webp',
  },
  {
    arcid: 'EC-HIJ',
    type: 'Socata TB-20 Trinidad',
    photoSrc: '/aircraft/socata-tb-20-trinidad.webp',
  },
  {
    arcid: 'EC-IJK',
    type: 'Grob G 103 Twin Astir',
    photoSrc: '/aircraft/grob-g-103-twin-astir.webp',
  },
  {
    arcid: 'EC-JKL',
    type: 'Schleicher ASK 21',
    photoSrc: '/aircraft/schleicher-ask-21.webp',
  },
  {
    arcid: 'EC-KLL',
    type: 'Schempp-Hirth Discus CS',
    photoSrc: '/aircraft/schempp-hirth-discus-cs.webp',
  },
  {
    arcid: 'EC-LMM',
    type: 'Rolladen-Schneider LS4',
    photoSrc: '/aircraft/rolladen-schneider-ls4.webp',
  },
  {
    arcid: 'EC-MNN',
    type: 'Robin DR400/180 Regent',
    photoSrc: '/aircraft/robin-dr400-180-regent.webp',
  },
  {
    arcid: 'EC-NOO',
    type: 'American Champion Decathlon',
    photoSrc: '/aircraft/american-champion-8kcab-decathlon.webp',
  },
  {
    arcid: 'EC-DMC',
    type: 'Cessna 152',
    photoSrc: '/aircraft/cessna-152.webp',
  },
  {
    arcid: 'EC-JPY',
    type: 'Cessna 172S',
    photoSrc: '/aircraft/cessna-172s.webp',
  },
  {
    arcid: 'EC-KOQ',
    type: 'Cessna 182T',
    photoSrc: '/aircraft/cessna-182t.webp',
  },
  {
    arcid: 'EC-DAE',
    type: 'Cessna FR 172 J',
    photoSrc: '/aircraft/cessna-fr-172-j.webp',
  },
  {
    arcid: 'EC-IJL',
    type: 'Cessna 172N',
    photoSrc: '/aircraft/cessna-172n.webp',
  },
  {
    arcid: 'EC-LMN',
    type: 'Diamond DA40 NG',
    photoSrc: '/aircraft/diamond-da40-ng.webp',
  },
  {
    arcid: 'EC-OPQ',
    type: 'Piper PA-28-161 Warrior III',
    photoSrc: '/aircraft/piper-pa-28-161-warrior-iii.webp',
  },
  {
    arcid: 'EC-XYZ',
    type: 'Tecnam P2008 JC',
    photoSrc: '/aircraft/tecnam-p2008-jc.webp',
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
]

const certificates: Omit<Certificate, '_id'>[] = [
  {
    name: 'Medical certificate class 2',
    category: 'Certificates',
    status: 'current',
    issued: '12/03/2025',
    expiration: '06/03/2027',
    documentNumber: 'MED2-2025-04821',
    issuingAuthority: AESA,
    holderName: 'Doe, John',
    studentId,
  },
  {
    name: 'Private Pilot Licence (PPL)',
    category: 'Licences',
    status: 'current',
    issued: '02/06/2024',
    expiration: '—',
    documentNumber: 'ES.FCL.PPL.00318',
    issuingAuthority: AESA,
    holderName: 'Doe, John',
    studentId,
  },
  {
    name: 'Radiotelephony Certificate',
    category: 'Certificates',
    status: 'current',
    issued: '18/09/2023',
    renewed: '18/09/2025',
    expiration: '18/09/2028',
    documentNumber: 'RTF-2023-00912',
    issuingAuthority: AESA,
    holderName: 'Doe, John',
    studentId,
  },
  {
    name: 'Medical certificate class 2',
    category: 'Certificates',
    status: 'archived',
    issued: '10/03/2023',
    expiration: '06/03/2025',
    documentNumber: 'MED2-2023-04821',
    issuingAuthority: AESA,
    holderName: 'Doe, John',
    studentId,
  },
]

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

const availabilityEntries: Omit<AvailabilityEntry, '_id'>[] = [
  {
    dateLabel: 'From 27/08/2026 to 30/08/2026',
    timeLabel: 'Between 18:00 and 21:00',
    recurrence: 'Everyday',
    studentId,
  },
  {
    dateLabel: 'From 17/08/2026 to 19/08/2026',
    timeLabel: 'All day',
    recurrence: 'On Monday, Tuesday, Wednesday',
    studentId,
  },
  {
    dateLabel: 'From 10/08/2026 to 16/08/2026',
    timeLabel: 'Between 12:00 and 15:00',
    recurrence: 'Everyday',
    studentId,
  },
  {
    dateLabel: 'From 03/08/2026 to 09/08/2026',
    timeLabel: 'Between 08:00 and 21:00',
    recurrence: 'Everyday',
    studentId,
  },
  {
    dateLabel: 'From 31/07/2026 to 02/08/2026',
    timeLabel: 'All day',
    recurrence: 'Everyday',
    studentId,
  },
]

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

const bookings: Omit<Booking, '_id'>[] = [
  {
    type: 'Instruction',
    date: '15/08/2026',
    tail: 'EC-ERV',
    person: 'J. Whitfield',
    time: '10:00 - 11:30',
    studentId,
  },
  {
    type: 'Instruction',
    date: '16/08/2026',
    tail: 'EC-ERV',
    person: 'K. Ashford',
    time: '15:00 - 17:00',
    studentId,
  },
  {
    type: 'Instruction',
    date: '17/08/2026',
    tail: 'EC-ERV',
    person: 'J. Whitfield',
    time: '09:00 - 10:30',
    studentId,
  },
  {
    type: 'Instruction',
    date: '18/08/2026',
    tail: 'EC-ERV',
    person: 'J. Whitfield',
    time: '13:00 - 14:30',
    studentId,
  },
]

// Flight evaluations double as the source of the "missing signatures"
// shown on the homepage: 3847780, 3956214 and 4041369 are unsigned, and
// 4041369 is also referenced by the 07/08/2026 booking in calendarEvents.
const flightEvaluationCourse = 'PPL Flight Phase (A_1_PPL(A)_v2_FLT)'
const flightEvaluationRoute = 'LELL - LELL'

const flightEvaluations: Omit<FlightEvaluation, '_id'>[] = [
  {
    sessionId: '3267346',
    date: '19/07/2025',
    type: 'Instruction',
    signed: true,
    student: 'John Doe',
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
      "First flight of John, we took some flight time and did all the paperwork together and read all the meteorology/NOTAMS, mass and balance... John now knows how to and where to check all the preflight documentation. Afterwards we did the flight plan together and we went to the aircraft. The student followed all the checklists step by step, he tried to do communications and he did well. We took off rwy 13 and went to the East to do and see how the basic primary flight controls work and understood them, we saw the relationship between power/altitude and pitch/airspeed. During the flight he was paying a lot of attention outside in order to that there weren't other aircraft close to us. As said on the post briefing, he needs to study the meteorology charts and meaning of codes and study the departure/take-off/emergency briefings.",
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
    student: 'John Doe',
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
    student: 'John Doe',
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
    student: 'John Doe',
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
      'First cross-country navigation exercise, LELL to LEVD and back.\n\nFlight planning was thorough and the fuel/time calculations were accurate. In the air, John held his headings well but was slow to notice track drift over the second leg — work on cross-checking the plog against ground features more frequently. Good radio work on both frequencies.',
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
    student: 'John Doe',
    instructor: 'R. Sinclair',
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
    student: 'John Doe',
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
    student: 'John Doe',
    instructor: 'R. Sinclair',
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
    student: 'John Doe',
    instructor: 'R. Sinclair',
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
      "In this second touch-and-go session, John arrived with all the documentation ready and prepared, showing a good disposition to continue building on his skills in the traffic circuit. The student demonstrates that he theoretically knows the legs of the circuit and its structure. However, during today's flight, severe difficulties in the approach and landing phases became evident, which require immediate attention:\n\nUnlike the previous session, during this flight John was unable to correctly maintain the approach path. When closing in on the runway, he presents serious difficulties maintaining the centerline, especially after cutting the power. At that critical moment, he fails to keep the aircraft parallel to the runway, heading directly towards it. On the first approach, this caused a hard impact that resulted in a bounce, forcing the instructor to immediately take control to execute a safety go-around.\n\nOn the second attempt, once the student was over the runway after cutting the power, he applied power in an uncontrolled manner and the aircraft veered sharply to the left. As a result, the instructor had to take over the controls once again to perform a second go-around. During the final approach, John was also unable to safely manage the path and parameters, so the instructor assumed control definitively to perform the final landing.\n\nIn conclusion, this session has made it clear that the student is at a stage where he needs more touch-and-go sessions aimed at assimilating the approach path, correcting aircraft tendencies after power reduction, and stabilizing the attitude before touching the ground. We will continue working intensively in the cockpit to consolidate this maneuver with full safety.",
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
    student: 'John Doe',
    instructor: 'R. Sinclair',
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
    student: 'John Doe',
    instructor: 'R. Sinclair',
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
      "It has been another takeoff and landing session with John, who demonstrated good preparation, a solid understanding of each leg of the traffic pattern, proper radio management, and good overall control of the aircraft's attitudes.\n\nHowever, his primary difficulties arise once on the final approach leg. Although John is progressively improving his airspeed management, he still struggles to maintain a precise aiming point on the runway, tending to lose his reference on the threshold. Additionally, he finds it challenging to maintain a stable glideslope, showing a tendency to fly either too high or too low without applying sufficient or timely corrections. Once over the runway, judging the flare height remains a challenge; he sometimes executes it too high or too abruptly, causing a balloon, floating down a significant amount of runway, and making it difficult to control a second smooth flare. These unstable approaches led to a few go-arounds today, as well as some bounced landings settling on all three wheels at once.\n\nIn conclusion, although he is gradually getting the concepts, we need to keep reinforcing takeoffs and landings in the upcoming sessions to fine-tune and consolidate his stability during the final phase of the approach. Let's keep working on it!",
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
    student: 'John Doe',
    instructor: 'M. Whitcombe',
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
    student: 'John Doe',
    instructor: 'R. Sinclair',
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
    student: 'John Doe',
    instructor: 'R. Sinclair',
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
    student: 'John Doe',
    instructor: 'Jane Smith',
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
      "Full circuit consolidation session ahead of the pre-solo check: normal, flapless and short-field landings, plus two practice forced landings from the circuit.\n\nJohn is now consistently stabilized by short final and handling the radio calls without prompting. One more session polishing the flare and he'll be ready for the pre-solo check.",
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
    date: '07/08/2026',
    type: 'Instruction',
    signed: false,
    student: 'John Doe',
    instructor: 'Jane Smith',
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

const newsItems: Omit<NewsItem, '_id'>[] = [
  {
    tag: 'operations',
    date: '02/08/2026',
    title: 'Sabadell tower frequency change effective now',
    summary:
      'The 8.33 kHz channel spacing update is live at LELL: TWR now runs on 120.805 MHz and GND on 121.605 MHz.',
  },
  {
    tag: 'fuel',
    date: '28/07/2026',
    title: 'New BP supply agreement airports',
    summary:
      'AVGAS 100LL is now available under the BP / Aeroclub agreement at A Coruña, Algeciras and Alicante-Elche.',
  },
  {
    tag: 'atc',
    date: '19/07/2026',
    title: 'ATIS-SIMA now live at Reus',
    summary:
      'Pilots can hear updated operational and weather information for LERS on 120.250 MHz, easing radio load on approach.',
  },
]

const documentFolders: Omit<DocumentFolder, '_id'>[] = [
  {
    name: 'EC-ERV',
    files: [
      { name: '11_CARGA Y CENTRADO C152 EC-ERV v.2.pdf', ext: 'PDF' },
      { name: '11_Carga y centrado C152 EC-ERV v1.0.xlsx', ext: 'XLSX' },
      { name: '12_WEIGHT AND BALANCE C152 EC-ERV v.2.pdf', ext: 'PDF' },
      { name: '12_Weight and balance C152 EC-ERV v1.0.xlsx', ext: 'XLSX' },
      { name: '21_CHECKLIST C152 v1.6 ESP EC-ERV A5.pdf', ext: 'PDF' },
      {
        name: '22_CHECKLIST EMERGENCIA C152 E v1.4 ESP EC-ERV A5.pdf',
        ext: 'PDF',
      },
      { name: '23_CHECKLIST C152 v1.6 ENG EC-ERV A5.pdf', ext: 'PDF' },
    ],
  },
  {
    name: 'EC-EXL',
    files: [
      { name: '11_CARGA Y CENTRADO v.2.pdf', ext: 'PDF' },
      { name: '11_Carga y centrado v1.0.xlsx', ext: 'XLSX' },
      { name: '21_CHECKLIST v1.6 ESP A5.pdf', ext: 'PDF' },
    ],
  },
  {
    name: 'EC-FED',
    files: [
      { name: '11_CARGA Y CENTRADO v.2.pdf', ext: 'PDF' },
      { name: '11_Carga y centrado v1.0.xlsx', ext: 'XLSX' },
      { name: '21_CHECKLIST v1.6 ESP A5.pdf', ext: 'PDF' },
    ],
  },
  {
    name: 'EC-DNX',
    files: [
      { name: '11_CARGA Y CENTRADO v.2.pdf', ext: 'PDF' },
      { name: '11_Carga y centrado v1.0.xlsx', ext: 'XLSX' },
    ],
  },
  {
    name: 'EC-FGI',
    files: [
      { name: '11_CARGA Y CENTRADO v.2.pdf', ext: 'PDF' },
      { name: '21_CHECKLIST v1.6 ESP A5.pdf', ext: 'PDF' },
      { name: '22_CHECKLIST EMERGENCIA v1.4 ESP A5.pdf', ext: 'PDF' },
    ],
  },
]

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

const emergencyContact: Omit<EmergencyContact, '_id'> = {
  name: 'Jane Doe',
  relation: 'Sister',
  phone: '+34 600 987 654',
  studentId,
}

const calendarEvents: Omit<CalendarEvent, '_id'>[] = [
  {
    type: 'unavailability',
    date: '2026-07-28',
    allDay: true,
    studentId,
  },
  {
    type: 'unavailability',
    date: '2026-07-29',
    allDay: true,
    studentId,
  },
  {
    type: 'unavailability',
    date: '2026-07-30',
    allDay: true,
    studentId,
  },
  {
    type: 'unavailability',
    date: '2026-07-31',
    allDay: true,
    studentId,
  },
  {
    type: 'unavailability',
    date: '2026-08-01',
    allDay: true,
    studentId,
  },
  {
    type: 'unavailability',
    date: '2026-08-02',
    allDay: true,
    studentId,
  },
  {
    type: 'unavailability',
    date: '2026-08-03',
    allDay: false,
    timeRange: '08:00 - 14:00',
    studentId,
  },
  {
    type: 'booking',
    date: '2026-08-04',
    time: '18:10 - 20:20',
    tailNumber: 'EC-EXL',
    pilotInCommand: 'Mike Murdoch [PIC]',
    flightLines: [
      'VTD01 - Precautionary landing. Reading maps of local area',
      'VTD02 - DM cross country flight',
    ],
    studentId,
  },
  {
    type: 'unavailability',
    date: '2026-08-05',
    allDay: false,
    timeRange: '09:00 - 13:00',
    studentId,
  },
  {
    type: 'booking',
    date: '2026-08-07',
    time: '13:10 - 15:20',
    tailNumber: 'EC-ERV',
    pilotInCommand: 'Jane Smith [PIC]',
    flightLines: ['VBD15 - Final check before solo flight'],
    studentId,
  },
  {
    type: 'booking',
    date: '2026-08-12',
    time: '09:00 - 12:30',
    tailNumber: 'EC-KLM',
    pilotInCommand: 'SAMPLE PLACEHOLDER [PIC]',
    flightLines: [
      'VTD04 - Navigation exercise over the coastline with diversion practice',
      'VTD05 - Steep turns and stall recovery review',
      'VTD06 - Radio navigation using VOR and ADF, followed by a full instrument approach briefing',
      'VTD07 - Circuit practice, short and soft field landings',
    ],
    cancelled: true,
    studentId,
  },
  {
    type: 'unavailability',
    date: '2026-08-19',
    allDay: false,
    timeRange: '07:00 - 10:00',
    studentId,
  },
  {
    type: 'booking',
    date: '2026-09-02',
    time: '10:00 - 11:15',
    tailNumber: 'EC-FED',
    pilotInCommand: 'Jane Smith [PIC]',
    flightLines: ['VBD03 - Circuit consolidation'],
    studentId,
  },
]

// Week-view blocks are derived from the same per-aircraft day template so
// picking any weekday in the week view always matches the day view. start/end
// for 'day' blocks are hours-of-day (9-21.5); 'week' blocks are day-index +
// hour fraction (0 = Monday 00:00, 7 = next Monday).
const HOURS_PER_DAY = 24
const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6]

type DayBlockTemplate = Pick<ScheduleBlock, 'label' | 'kind' | 'start' | 'end'>

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
      { label: 'Reserved 09:00–12:00', kind: 'reserved', start: 9, end: 12 },
      {
        label: 'Reserved 13:30–16:00',
        kind: 'reserved',
        start: 13.5,
        end: 16,
      },
      {
        label: 'Reserved 16:30–19:00',
        kind: 'reserved',
        start: 16.5,
        end: 19,
      },
    ]),
    ...buildAircraftScheduleBlocks(exl, [
      { label: 'Reserved 09:00–12:00', kind: 'reserved', start: 9, end: 12 },
      { label: 'Reserved', kind: 'reserved', start: 14.5, end: 16 },
      {
        label: 'Reserved 16:00–21:30',
        kind: 'reserved',
        start: 16,
        end: 21.5,
      },
    ]),
    ...buildAircraftScheduleBlocks(fed, [
      { label: 'Not available', kind: 'unavailable', start: 9, end: 14.5 },
      { label: 'Reserved', kind: 'reserved', start: 14.5, end: 16 },
      { label: 'Reserved', kind: 'reserved', start: 16.5, end: 18 },
      {
        label: 'Reserved 18:00–20:30',
        kind: 'reserved',
        start: 18,
        end: 20.5,
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
  await seedMany(calendarEventModel, calendarEvents, 'calendar events')

  let aircraftDocs
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

  await seedMany(
    availabilityEntryModel,
    availabilityEntries,
    'availability entries',
  )
  await seedMany(certificateModel, certificates, 'certificates')

  if (onlyIfEmpty && (await courseProgressModel.countDocuments()) > 0) {
    console.log('Skipped course progress (already has data)')
  } else {
    await courseProgressModel.deleteMany({})
    await courseProgressModel.insertOne(courseProgress)
    console.log('Seeded course progress')
  }

  await seedMany(documentFolderModel, documentFolders, 'document folders')

  if (onlyIfEmpty && (await emergencyContactModel.countDocuments()) > 0) {
    console.log('Skipped emergency contact (already has data)')
  } else {
    await emergencyContactModel.deleteMany({})
    await emergencyContactModel.insertOne(emergencyContact)
    console.log('Seeded emergency contact')
  }
  await seedMany(flightEvaluationModel, flightEvaluations, 'flight evaluations')
  await seedMany(logbookEntryModel, logbookEntries, 'logbook entries')
  await seedMany(mailboxEmailModel, mailboxEmails, 'mailbox emails')
  await seedMany(bookingModel, bookings, 'bookings')
  await seedMany(newsItemModel, newsItems, 'news items')

  await app.close()
}

void seed()

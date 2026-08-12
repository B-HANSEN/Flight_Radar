import { NestFactory } from '@nestjs/core'
import { getModelToken } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { AppModule } from '../app.module'
import { Aircraft } from '../aircraft/schemas/aircraft.schema'
import { Certificate } from '../certificates/schemas/certificate.schema'
import { MailboxEmail } from '../mailbox/schemas/mailbox-email.schema'

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

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule)
  const aircraftModel = app.get<Model<Aircraft>>(getModelToken(Aircraft.name))
  const certificateModel = app.get<Model<Certificate>>(
    getModelToken(Certificate.name),
  )
  const mailboxEmailModel = app.get<Model<MailboxEmail>>(
    getModelToken(MailboxEmail.name),
  )

  await aircraftModel.deleteMany({})
  await aircraftModel.insertMany(aircraft)
  console.log(`Seeded ${aircraft.length} aircraft`)

  await certificateModel.deleteMany({})
  await certificateModel.insertMany(certificates)
  console.log(`Seeded ${certificates.length} certificates`)

  await mailboxEmailModel.deleteMany({})
  await mailboxEmailModel.insertMany(mailboxEmails)
  console.log(`Seeded ${mailboxEmails.length} mailbox emails`)

  await app.close()
}

void seed()

import type { ScheduleAircraft, ScheduleRow } from './ScheduleBoard.types'

export const DUMMY_SCHEDULE_AIRCRAFT: ScheduleAircraft[] = [
  {
    id: 'ec-erv',
    arcid: 'EC-ERV',
    type: 'Cessna 152',
    photoSrc: '/aircraft/cessna-152.webp',
  },
  {
    id: 'ec-exl',
    arcid: 'EC-EXL',
    type: 'Cessna 152',
    photoSrc: '/aircraft/cessna-152.webp',
  },
  {
    id: 'ec-fed',
    arcid: 'EC-FED',
    type: 'Cessna 152',
    photoSrc: '/aircraft/cessna-152.webp',
  },
]

export const DUMMY_SCHEDULE_DAY_ROWS: ScheduleRow[] = [
  {
    aircraftId: 'ec-erv',
    blocks: [
      {
        id: 'erv-1',
        label: 'Reserved 09:00–12:00',
        kind: 'reserved',
        start: 9,
        end: 12,
      },
      {
        id: 'erv-2',
        label: 'Reserved 13:30–16:00',
        kind: 'reserved',
        start: 13.5,
        end: 16,
      },
      {
        id: 'erv-3',
        label: 'Reserved 16:30–19:00',
        kind: 'reserved',
        start: 16.5,
        end: 19,
      },
    ],
  },
  {
    aircraftId: 'ec-exl',
    blocks: [
      {
        id: 'exl-1',
        label: 'Reserved 09:00–12:00',
        kind: 'reserved',
        start: 9,
        end: 12,
      },
      {
        id: 'exl-2',
        label: 'Reserved',
        kind: 'reserved',
        start: 14.5,
        end: 16,
      },
      {
        id: 'exl-3',
        label: 'Reserved 16:00–21:30',
        kind: 'reserved',
        start: 16,
        end: 21.5,
      },
    ],
  },
  {
    aircraftId: 'ec-fed',
    blocks: [
      {
        id: 'fed-1',
        label: 'Not available',
        kind: 'unavailable',
        start: 9,
        end: 14.5,
      },
      {
        id: 'fed-2',
        label: 'Reserved',
        kind: 'reserved',
        start: 14.5,
        end: 16,
      },
      {
        id: 'fed-3',
        label: 'Reserved',
        kind: 'reserved',
        start: 16.5,
        end: 18,
      },
      {
        id: 'fed-4',
        label: 'Reserved 18:00–20:30',
        kind: 'reserved',
        start: 18,
        end: 20.5,
      },
    ],
  },
]

export const DUMMY_SCHEDULE_WEEK_ROWS: ScheduleRow[] = [
  {
    aircraftId: 'ec-erv',
    blocks: [
      {
        id: 'erv-w1',
        label: 'Scheduled maintenance — Rev. 50h',
        kind: 'maintenance',
        start: 1,
        end: 2.4,
      },
      { id: 'erv-w2', label: 'Reserved', kind: 'reserved', start: 5, end: 5.3 },
      { id: 'erv-w3', label: 'Reserved', kind: 'reserved', start: 6, end: 6.4 },
    ],
  },
  {
    aircraftId: 'ec-exl',
    blocks: [
      {
        id: 'exl-w1',
        label: 'Reserved',
        kind: 'reserved',
        start: 0.3,
        end: 0.6,
      },
      { id: 'exl-w2', label: 'Reserved', kind: 'reserved', start: 3, end: 3.4 },
      {
        id: 'exl-w3',
        label: 'Reserved',
        kind: 'reserved',
        start: 6.3,
        end: 6.6,
      },
    ],
  },
  {
    aircraftId: 'ec-fed',
    blocks: [
      {
        id: 'fed-w1',
        label: 'Scheduled maintenance — Fuel system',
        kind: 'maintenance',
        start: 0,
        end: 1.5,
      },
      {
        id: 'fed-w2',
        label: 'Scheduled maintenance',
        kind: 'maintenance',
        start: 1.5,
        end: 2.6,
      },
      { id: 'fed-w3', label: 'Reserved', kind: 'reserved', start: 3, end: 3.4 },
      {
        id: 'fed-w4',
        label: 'Not available',
        kind: 'unavailable',
        start: 6,
        end: 6.4,
      },
    ],
  },
]

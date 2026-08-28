import { DUMMY_INSTRUCTORS } from './RoleSwitcher.data'
import type { ScheduleAircraft } from './ScheduleBoard.types'
import type { ScheduleFlightTarget } from './ScheduleFlightModal.types'

export const DUMMY_SCHEDULE_FLIGHT_AIRCRAFT: ScheduleAircraft[] = [
  { id: 'ec-dkn', arcid: 'EC-DKN', type: 'Cessna 152' },
  { id: 'ec-erv', arcid: 'EC-ERV', type: 'Cessna 152' },
  { id: 'ec-jtj', arcid: 'EC-JTJ', type: 'Cessna 172' },
  { id: 'ec-job', arcid: 'EC-JOB', type: 'Cessna 172' },
  { id: 'ec-kop', arcid: 'EC-KOP', type: 'Cessna 182' },
]

export const DUMMY_SCHEDULE_FLIGHT_INSTRUCTORS = DUMMY_INSTRUCTORS

export const DUMMY_SCHEDULE_FLIGHT_TARGET: ScheduleFlightTarget = {
  studentId: 'student-1',
  studentName: 'Alex Moreau',
  slot: {
    id: 'slot-1',
    date: '2026-08-24',
    startTime: '09:00',
    endTime: '11:00',
  },
}

export type ScheduleAircraft = {
  id: string
  arcid: string
  type: string
  photoSrc?: string
}

export type ScheduleBlockKind =
  'reserved' | 'maintenance' | 'hold' | 'unavailable'

export type ScheduleBlock = {
  id: string
  label: string
  kind: ScheduleBlockKind
  start: number
  end: number
}

export type ScheduleBlockRecord = ScheduleBlock & {
  aircraftId: string
  // ISO date this block applies to. Absent = a recurring block shown on
  // every day/week (the demo maintenance/hold/unavailable data); present =
  // only shown on that one calendar date (a real booking).
  date?: string
}

export type ScheduleRow = {
  aircraftId: string
  blocks: ScheduleBlock[]
}

export type ScheduleBlockDetail = {
  aircraft: ScheduleAircraft
  block: ScheduleBlock
  timeLabel: string
}

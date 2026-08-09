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

export type ScheduleRow = {
  aircraftId: string
  blocks: ScheduleBlock[]
}

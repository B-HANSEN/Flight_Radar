export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

export const WEEKDAY_ORDER: Weekday[] = [
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
  'sun',
]

export type AvailabilityEntry = {
  id: string
  dateMode: 'on' | 'range'
  onDate?: string
  fromDate?: string
  toDate?: string
  timeMode: 'allDay' | 'between'
  startTime?: string
  endTime?: string
  recurrenceMode: 'everyday' | 'days'
  recurrenceDays?: Weekday[]
}

export type DateSelection =
  { mode: 'on'; date: string } | { mode: 'range'; from: string; to: string }

export type TimeSelection =
  { mode: 'allDay' } | { mode: 'between'; start: string; end: string }

export type RecurrenceSelection =
  { mode: 'everyday' } | { mode: 'days'; days: Weekday[] }

export type AvailabilityFormValues = {
  date: DateSelection
  time: TimeSelection
  recurrence: RecurrenceSelection
}

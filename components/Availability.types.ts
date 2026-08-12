export type AvailabilityEntry = {
  id: string
  dateLabel: string
  timeLabel: string
  recurrence: string
}

export type DateSelection =
  | { mode: 'all' }
  | { mode: 'on'; date: string }
  | { mode: 'range'; from: string; to: string }

export type TimeSelection =
  { mode: 'allDay' } | { mode: 'between'; start: string; end: string }

export type AvailabilityFormValues = {
  date: DateSelection
  time: TimeSelection
}

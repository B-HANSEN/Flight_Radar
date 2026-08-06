export type CalendarEventBase = {
  id: string
  date: string
}

export type UnavailabilityEvent = CalendarEventBase & {
  type: 'unavailability'
} & ({ allDay: true } | { allDay: false; timeRange: string })

export type BookingEvent = CalendarEventBase & {
  type: 'booking'
  time: string
  tailNumber: string
  pilotInCommand: string
  flightLines: string[]
  cancelled?: boolean
}

export type CalendarEvent = UnavailabilityEvent | BookingEvent

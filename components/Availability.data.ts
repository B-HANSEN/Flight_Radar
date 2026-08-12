import type { AvailabilityEntry } from './Availability.types'

export const DUMMY_AVAILABILITY_ENTRIES: AvailabilityEntry[] = [
  {
    id: 'avail-1',
    dateLabel: 'From 27/08/2026 to 30/08/2026',
    timeLabel: 'Between 18:00 and 21:00',
    recurrence: 'Everyday',
  },
  {
    id: 'avail-2',
    dateLabel: 'From 17/08/2026 to 19/08/2026',
    timeLabel: 'All day',
    recurrence: 'On Monday, Tuesday, Wednesday',
  },
  {
    id: 'avail-3',
    dateLabel: 'From 10/08/2026 to 16/08/2026',
    timeLabel: 'Between 12:00 and 15:00',
    recurrence: 'Everyday',
  },
  {
    id: 'avail-4',
    dateLabel: 'From 03/08/2026 to 09/08/2026',
    timeLabel: 'Between 08:00 and 21:00',
    recurrence: 'Everyday',
  },
  {
    id: 'avail-5',
    dateLabel: 'From 31/07/2026 to 02/08/2026',
    timeLabel: 'All day',
    recurrence: 'Everyday',
  },
]

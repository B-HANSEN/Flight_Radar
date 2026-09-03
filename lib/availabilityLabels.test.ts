import { describe, expect, it } from 'vitest'
import enMessages from '@/messages/en.json'
import deMessages from '@/messages/de.json'
import { availabilityLabels } from './availabilityLabels'
import type { AvailabilityLabelFields } from './availabilityLabels'

// Minimal ICU-ish translator over the Availability namespace: substitutes
// {placeholders} the same way next-intl would for these flat string messages.
function makeT(messages: Record<string, Record<string, string>>) {
  return (key: string, values?: Record<string, string>) =>
    (messages.Availability[key] ?? key).replace(
      /\{(\w+)\}/g,
      (_, name: string) => values?.[name] ?? '',
    )
}

const enT = makeT(enMessages as never)
const deT = makeT(deMessages as never)
const enWeekdays = enMessages.AvailabilityFormModal.weekdayNames
const deWeekdays = deMessages.AvailabilityFormModal.weekdayNames

const range: AvailabilityLabelFields = {
  dateMode: 'range',
  fromDate: '10/08/2026',
  toDate: '16/08/2026',
  timeMode: 'between',
  startTime: '12:00',
  endTime: '15:00',
  recurrenceMode: 'days',
  recurrenceDays: ['mon', 'wed'],
}

const single: AvailabilityLabelFields = {
  dateMode: 'on',
  onDate: '22/09/2026',
  timeMode: 'allDay',
  recurrenceMode: 'everyday',
}

describe('availabilityLabels', () => {
  it('formats a range / between / specific-days entry in English', () => {
    expect(availabilityLabels(range, enT, enWeekdays)).toEqual({
      dateLabel: 'From 10/08/2026 to 16/08/2026',
      timeLabel: 'Between 12:00 and 15:00',
      recurrenceLabel: 'On Monday, Wednesday',
    })
  })

  it('formats an on-date / all-day / everyday entry in English', () => {
    expect(availabilityLabels(single, enT, enWeekdays)).toEqual({
      dateLabel: 'On 22/09/2026',
      timeLabel: 'All day',
      recurrenceLabel: 'Everyday',
    })
  })

  it('follows the active locale rather than a persisted English string', () => {
    expect(availabilityLabels(range, deT, deWeekdays)).toEqual({
      dateLabel: 'Von 10/08/2026 bis 16/08/2026',
      timeLabel: 'Zwischen 12:00 und 15:00',
      recurrenceLabel: 'Am Montag, Mittwoch',
    })
  })
})

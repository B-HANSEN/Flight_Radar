import { WEEKDAY_ORDER } from '@/components/Availability.types'
import type { Weekday } from '@/components/Availability.types'

// The date/time/recurrence labels shown for an availability entry are derived
// here from its structured fields rather than persisted, so they follow the
// active locale (see messages/*/Availability). The server stores only the
// structured fields — see server/src/availability/schemas.

export type AvailabilityLabelFields = {
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

// Structural view of the `Availability` namespace translator returned by
// next-intl's useTranslations('Availability').
type Translate = (key: string, values?: Record<string, string>) => string

export function availabilityDateLabel(
  fields: AvailabilityLabelFields,
  t: Translate,
): string {
  return fields.dateMode === 'on'
    ? t('dateOn', { date: fields.onDate ?? '' })
    : t('dateRange', { from: fields.fromDate ?? '', to: fields.toDate ?? '' })
}

export function availabilityTimeLabel(
  fields: AvailabilityLabelFields,
  t: Translate,
): string {
  return fields.timeMode === 'allDay'
    ? t('timeAllDay')
    : t('timeBetween', {
        start: fields.startTime ?? '',
        end: fields.endTime ?? '',
      })
}

export function availabilityRecurrenceLabel(
  fields: AvailabilityLabelFields,
  t: Translate,
  weekdayNames: string[],
): string {
  if (fields.recurrenceMode === 'everyday') return t('recurrenceEveryday')
  return t('recurrenceDays', {
    days: (fields.recurrenceDays ?? [])
      .map((day) => weekdayNames[WEEKDAY_ORDER.indexOf(day)])
      .join(', '),
  })
}

export function availabilityLabels(
  fields: AvailabilityLabelFields,
  t: Translate,
  weekdayNames: string[],
) {
  return {
    dateLabel: availabilityDateLabel(fields, t),
    timeLabel: availabilityTimeLabel(fields, t),
    recurrenceLabel: availabilityRecurrenceLabel(fields, t, weekdayNames),
  }
}

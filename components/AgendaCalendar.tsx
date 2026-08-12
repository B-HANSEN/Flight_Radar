'use client'

import { useId, useMemo, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react'
import { focusRing } from '@/lib/styles'
import { useDragScroll } from '@/lib/useDragScroll'
import {
  addMonths,
  clampMonth,
  getMonthGridDates,
  toMonthIndex,
  type MonthKey,
} from '@/lib/monthGrid'
import BookingDetailModal from './BookingDetailModal'
import type { BookingEvent, CalendarEvent } from './AgendaCalendar.types'

type Props = {
  events?: CalendarEvent[]
  initialMonth?: MonthKey
  onRefresh?: () => void
}

const MAX_MONTHS_AHEAD = 3
const MAX_MONTHS_BEHIND = 3

function toISODate(date: Date): string {
  const year = date.getFullYear()
  const monthStr = String(date.getMonth() + 1).padStart(2, '0')
  const dayStr = String(date.getDate()).padStart(2, '0')
  return `${year}-${monthStr}-${dayStr}`
}

export default function AgendaCalendar({
  events = [],
  initialMonth,
  onRefresh,
}: Props) {
  const t = useTranslations('AgendaCalendar')
  const locale = useLocale()
  const monthLabelId = useId()
  const today = useMemo(() => new Date(), [])
  const currentMonth = { year: today.getFullYear(), month: today.getMonth() }
  const minMonth = addMonths(currentMonth, -MAX_MONTHS_BEHIND)
  const maxMonth = addMonths(currentMonth, MAX_MONTHS_AHEAD)
  const [month, setMonth] = useState<MonthKey>(() =>
    clampMonth(initialMonth ?? currentMonth, minMonth, maxMonth),
  )
  const [showCancelations, setShowCancelations] = useState(false)
  const [activeEvent, setActiveEvent] = useState<BookingEvent | null>(null)
  const { isDragging, dragHandlers } = useDragScroll<HTMLDivElement>()

  const isAtMin = toMonthIndex(month) === toMonthIndex(minMonth)
  const isAtMax = toMonthIndex(month) === toMonthIndex(maxMonth)
  const isAtCurrentMonth = toMonthIndex(month) === toMonthIndex(currentMonth)

  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: 'long',
        year: 'numeric',
      }).format(new Date(month.year, month.month, 1)),
    [locale, month],
  )

  const weekdayLabels = t.raw('weekdaysShort') as string[]

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    for (const event of events) {
      if (event.type === 'booking' && event.cancelled && !showCancelations) {
        continue
      }
      const list = map.get(event.date) ?? []
      list.push(event)
      map.set(event.date, list)
    }
    return map
  }, [events, showCancelations])

  const gridDates = useMemo(() => getMonthGridDates(month), [month])
  const todayISO = toISODate(today)

  return (
    <section
      aria-label={t('calendarLabel')}
      className='overflow-hidden rounded-xl border border-black-100 bg-white'
    >
      <div className='flex flex-wrap items-center gap-4 border-b border-black-100 px-5 py-4'>
        <button
          type='button'
          onClick={() => setMonth((current) => addMonths(current, -1))}
          disabled={isAtMin}
          aria-label={t('previousMonth')}
          className={`rounded-sm p-1 text-black-300 disabled:opacity-30 ${focusRing}`}
        >
          <ChevronLeft size={18} aria-hidden='true' />
        </button>

        <div
          id={monthLabelId}
          className='min-w-35 font-primary text-md font-bold text-black-300'
          aria-live='polite'
        >
          {monthLabel}
        </div>

        <button
          type='button'
          onClick={() => setMonth((current) => addMonths(current, 1))}
          disabled={isAtMax}
          aria-label={t('nextMonth')}
          className={`rounded-sm p-1 text-black-300 disabled:opacity-30 ${focusRing}`}
        >
          <ChevronRight size={18} aria-hidden='true' />
        </button>

        <button
          type='button'
          onClick={onRefresh}
          aria-label={t('refresh')}
          className={`rounded-sm p-1 text-black-200 ${focusRing}`}
        >
          <RefreshCw size={16} aria-hidden='true' />
        </button>

        <button
          type='button'
          onClick={() => setMonth(currentMonth)}
          disabled={isAtCurrentMonth}
          aria-label={t('today')}
          className={`rounded-sm p-1 text-black-200 disabled:opacity-30 ${focusRing}`}
        >
          <CalendarCheck size={16} aria-hidden='true' />
        </button>

        <label className='flex cursor-pointer items-center gap-2 py-1 font-secondary text-sm text-black-300'>
          <input
            type='checkbox'
            checked={showCancelations}
            onChange={(event) => setShowCancelations(event.target.checked)}
            className='size-3.5 cursor-pointer accent-blue-300'
          />
          {t('viewCancelations')}
        </label>
      </div>

      <div
        role='group'
        aria-labelledby={monthLabelId}
        tabIndex={0}
        className={`overflow-x-auto ${focusRing} ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
        {...dragHandlers}
      >
        <div className='min-w-175'>
          <div className='grid grid-cols-7'>
            {weekdayLabels.map((label) => (
              <div
                key={label}
                className='border-b border-black-100 bg-black-100/40 px-2 py-2 font-primary text-xs font-semibold tracking-[0.03em] text-black-300 uppercase'
              >
                {label}
              </div>
            ))}
          </div>

          <div className='grid grid-cols-7'>
            {gridDates.map((date) => {
              const iso = toISODate(date)
              const inMonth = date.getMonth() === month.month
              const isToday = iso === todayISO
              const dayEvents = eventsByDate.get(iso) ?? []

              return (
                <div
                  key={iso}
                  className='flex min-h-24 flex-col gap-0.75 border-r border-b border-black-100 pb-1.5 last:border-r-0'
                >
                  <div className='px-2.5 pt-2 pb-1'>
                    {isToday ? (
                      <span className='inline-flex size-5.5 items-center justify-center rounded-full bg-blue-300 font-secondary text-xs font-bold text-white'>
                        {date.getDate()}
                      </span>
                    ) : (
                      <span
                        className={`font-secondary text-sm ${inMonth ? 'text-black-300' : 'text-black-200'}`}
                      >
                        {date.getDate()}
                      </span>
                    )}
                  </div>

                  <div className='flex flex-col gap-0.75 px-1.5'>
                    {dayEvents.map((event) =>
                      event.type === 'unavailability' ? (
                        <div
                          key={event.id}
                          className='bg-black-100/50 px-2 py-1.25'
                        >
                          <div className='truncate font-secondary text-xs font-bold text-black-300'>
                            {event.allDay ? t('allDay') : event.timeRange}
                          </div>
                          <div className='truncate font-secondary text-xs text-black-300'>
                            {t('notAvailable')}
                          </div>
                        </div>
                      ) : (
                        <button
                          key={event.id}
                          type='button'
                          onClick={() => setActiveEvent(event)}
                          className={`rounded-sm bg-yellow-100 px-2 py-1.25 text-left ${focusRing}`}
                        >
                          <div className='flex items-baseline justify-between gap-1.5'>
                            <span className='truncate font-secondary text-xs font-bold text-black-300'>
                              {event.time}
                            </span>
                            <span className='shrink-0 font-secondary text-[11px] font-bold text-black-300'>
                              {event.tailNumber}
                            </span>
                          </div>
                          <div className='truncate font-secondary text-xs font-semibold text-blue-300 underline'>
                            {event.pilotInCommand}
                          </div>
                          {event.flightLines.map((line) => (
                            <div
                              key={line}
                              className='truncate font-secondary text-xs text-blue-300 underline'
                            >
                              {line}
                            </div>
                          ))}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <BookingDetailModal
        event={activeEvent}
        onClose={() => setActiveEvent(null)}
      />
    </section>
  )
}

'use client'

import { useId, useRef, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { focusRing } from '@/lib/styles'
import { getAvailabilityDateRange } from '@/lib/availabilityDateRange'
import { useFocusTrap } from '@/lib/useFocusTrap'
import {
  addMonths,
  clampMonth,
  getMonthGridDates,
  toMonthIndex,
  type MonthKey,
} from '@/lib/monthGrid'

type Props = {
  isOpen: boolean
  initialDate: string
  onCancel: () => void
  onConfirm: (date: string) => void
}

function parseDMY(value: string): Date | null {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return null
  const [, day, month, year] = match
  return new Date(Number(year), Number(month) - 1, Number(day))
}

function formatDMY(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}/${date.getFullYear()}`
}

function toMonthKey(date: Date): MonthKey {
  return { year: date.getFullYear(), month: date.getMonth() }
}

function clampDate(date: Date, min: Date, max: Date): Date {
  if (date < min) return min
  if (date > max) return max
  return date
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export default function DatePickerModal({
  isOpen,
  initialDate,
  onCancel,
  onConfirm,
}: Props) {
  const t = useTranslations('DatePickerModal')
  const locale = useLocale()
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const { min: minDate, max: maxDate } = getAvailabilityDateRange()
  const minMonth = toMonthKey(minDate)
  const maxMonth = toMonthKey(maxDate)
  const [selected, setSelected] = useState(() =>
    clampDate(parseDMY(initialDate) ?? new Date(), minDate, maxDate),
  )
  const [month, setMonth] = useState<MonthKey>(() =>
    clampMonth(toMonthKey(selected), minMonth, maxMonth),
  )

  useFocusTrap(dialogRef, isOpen, onCancel)

  if (!isOpen) return null

  const monthLabel = new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
  }).format(new Date(month.year, month.month, 1))
  const weekdayLabels = t.raw('weekdaysShort') as string[]
  const gridDates = getMonthGridDates(month)
  const dayLabelFormatter = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const isAtMinMonth = toMonthIndex(month) === toMonthIndex(minMonth)
  const isAtMaxMonth = toMonthIndex(month) === toMonthIndex(maxMonth)

  function handleConfirm() {
    onConfirm(formatDMY(selected))
  }

  return (
    <div
      className='fixed inset-0 z-60 flex items-center justify-center bg-black-300/50 p-4'
      onClick={onCancel}
    >
      <div
        ref={dialogRef}
        role='dialog'
        aria-modal='true'
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className={`w-80 max-w-full overflow-hidden rounded-xl bg-white shadow-xl ${focusRing}`}
      >
        <h2 id={titleId} className='sr-only'>
          {t('title')}
        </h2>

        <div className='flex items-center justify-between gap-2 border-b border-black-100 px-5 py-4'>
          <button
            type='button'
            onClick={() =>
              setMonth((current) =>
                clampMonth(addMonths(current, -1), minMonth, maxMonth),
              )
            }
            disabled={isAtMinMonth}
            aria-label={t('previousMonth')}
            className={`rounded-sm p-1 text-black-300 disabled:opacity-30 ${focusRing}`}
          >
            <ChevronLeft size={18} aria-hidden='true' />
          </button>
          <div className='font-primary text-md font-bold text-black-300'>
            {monthLabel}
          </div>
          <button
            type='button'
            onClick={() =>
              setMonth((current) =>
                clampMonth(addMonths(current, 1), minMonth, maxMonth),
              )
            }
            disabled={isAtMaxMonth}
            aria-label={t('nextMonth')}
            className={`rounded-sm p-1 text-black-300 disabled:opacity-30 ${focusRing}`}
          >
            <ChevronRight size={18} aria-hidden='true' />
          </button>
        </div>

        <div className='px-3 py-3'>
          <div className='grid grid-cols-7'>
            {weekdayLabels.map((label) => (
              <div
                key={label}
                className='py-1 text-center font-primary text-[11px] font-semibold tracking-wide text-black-200 uppercase'
              >
                {label}
              </div>
            ))}
          </div>
          <div className='grid grid-cols-7'>
            {gridDates.map((date) => {
              const inMonth = date.getMonth() === month.month
              const isSelected = isSameDay(date, selected)
              const outOfRange = date < minDate || date > maxDate
              return (
                <div key={date.toISOString()} className='p-0.5'>
                  <button
                    type='button'
                    onClick={() => setSelected(date)}
                    disabled={outOfRange}
                    aria-pressed={isSelected}
                    aria-label={dayLabelFormatter.format(date)}
                    className={`flex size-9 w-full items-center justify-center rounded-full font-secondary text-sm disabled:cursor-not-allowed disabled:opacity-30 ${focusRing} ${
                      isSelected
                        ? 'bg-blue-300 font-semibold text-white'
                        : inMonth
                          ? 'text-black-300'
                          : 'text-black-200'
                    }`}
                  >
                    {date.getDate()}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        <div className='flex justify-center gap-7 py-3 pb-5.5'>
          <button
            type='button'
            onClick={onCancel}
            className={`cursor-pointer rounded-sm font-primary text-sm font-bold tracking-wide text-blue-300 ${focusRing}`}
          >
            {t('cancel')}
          </button>
          <button
            type='button'
            onClick={handleConfirm}
            className={`cursor-pointer rounded-sm font-primary text-sm font-bold tracking-wide text-blue-300 ${focusRing}`}
          >
            {t('ok')}
          </button>
        </div>
      </div>
    </div>
  )
}

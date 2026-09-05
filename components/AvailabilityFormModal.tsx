'use client'

import { useId, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Calendar, Clock } from 'lucide-react'
import Modal from './Modal'
import TimePickerModal from './TimePickerModal'
import DatePickerModal from './DatePickerModal'
import {
  isValidAvailabilityDate,
  parseAvailabilityDate,
} from '@/lib/availabilityDateRange'
import { WEEKDAY_ORDER } from './Availability.types'
import type { AvailabilityFormValues, Weekday } from './Availability.types'

type Props = {
  isOpen: boolean
  onClose: () => void
  onSave: (values: AvailabilityFormValues) => void | Promise<void>
  initialValues?: AvailabilityFormValues
  title?: string
}

type DateMode = 'on' | 'range'
type TimeMode = 'allDay' | 'between'
type RecurrenceMode = 'everyday' | 'days'
type TimeTarget = 'start' | 'end' | null
type DateTarget = 'on' | 'from' | 'to' | null

const radioInputClassName = 'size-4 cursor-pointer accent-blue-200'
const dateInputBaseClassName =
  'w-28 rounded-sm border-0 border-b bg-transparent py-1.5 pr-7 pl-1 font-secondary text-sm text-black-300'
const dateFieldWrapperClassName = 'relative flex items-center'
const calendarButtonClassName =
  'absolute right-1 flex cursor-pointer items-center justify-center text-black-200'
const timeTriggerClassName =
  'flex cursor-pointer items-center gap-1.5 border-b border-black-200 px-2.5 py-1.5'
const legendClassName =
  'mb-3.5 block w-full border-b border-black-100 pb-2 font-secondary text-xs font-semibold text-black-200'
const optionsClassName = 'flex flex-col gap-3'

function weekdayButtonClassName(selected: boolean) {
  return `flex size-8 flex-none cursor-pointer items-center justify-center rounded-full font-secondary text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-30 ${
    selected ? 'bg-blue-300 text-white' : 'bg-black-100/60 text-black-300'
  }`
}

function dateInputClassName(isInvalid: boolean) {
  return `${dateInputBaseClassName} ${isInvalid ? 'border-red-200' : 'border-black-200'}`
}

// Date.prototype.getDay() returns 0 for Sunday through 6 for Saturday.
const WEEKDAYS_BY_DATE_GET_DAY_INDEX: Weekday[] = [
  'sun',
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
]

function weekdayOfDate(date: Date): Weekday {
  return WEEKDAYS_BY_DATE_GET_DAY_INDEX[date.getDay()]
}

type FormState = {
  dateMode: DateMode
  onDate: string
  fromDate: string
  toDate: string
  timeMode: TimeMode
  startTime: string
  endTime: string
  recurrenceMode: RecurrenceMode
  recurrenceDays: Weekday[]
}

function initialFormState(initialValues?: AvailabilityFormValues): FormState {
  const date = initialValues?.date
  const time = initialValues?.time
  const recurrence = initialValues?.recurrence

  return {
    dateMode: date?.mode ?? 'range',
    onDate: date?.mode === 'on' ? date.date : '',
    fromDate: date?.mode === 'range' ? date.from : '',
    toDate: date?.mode === 'range' ? date.to : '',
    timeMode: time?.mode ?? 'allDay',
    startTime: time?.mode === 'between' ? time.start : '08:00',
    endTime: time?.mode === 'between' ? time.end : '10:00',
    recurrenceMode: recurrence?.mode ?? 'everyday',
    recurrenceDays: recurrence?.mode === 'days' ? recurrence.days : [],
  }
}

// The days actually present in [from, to] (inclusive) — a range of 6+ days
// always spans every weekday at least once.
function weekdaysInRange(from: Date, to: Date): Set<Weekday> {
  const spanDays = Math.round(
    (to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000),
  )
  if (spanDays < 0) return new Set()
  if (spanDays >= 6) return new Set(WEEKDAY_ORDER)

  const allowed = new Set<Weekday>()
  const cursor = new Date(from)
  for (let i = 0; i <= spanDays; i++) {
    allowed.add(weekdayOfDate(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return allowed
}

export default function AvailabilityFormModal({
  isOpen,
  onClose,
  onSave,
  initialValues,
  title,
}: Props) {
  const t = useTranslations('AvailabilityFormModal')
  const formId = useId()

  const initial = initialFormState(initialValues)

  const [dateMode, setDateMode] = useState<DateMode>(initial.dateMode)
  const [onDate, setOnDate] = useState(initial.onDate)
  const [fromDate, setFromDate] = useState(initial.fromDate)
  const [toDate, setToDate] = useState(initial.toDate)
  const [timeMode, setTimeMode] = useState<TimeMode>(initial.timeMode)
  const [startTime, setStartTime] = useState(initial.startTime)
  const [endTime, setEndTime] = useState(initial.endTime)
  const [recurrenceMode, setRecurrenceMode] = useState<RecurrenceMode>(
    initial.recurrenceMode,
  )
  const [recurrenceDays, setRecurrenceDays] = useState<Weekday[]>(
    initial.recurrenceDays,
  )
  const [timePickerTarget, setTimePickerTarget] = useState<TimeTarget>(null)
  const [datePickerTarget, setDatePickerTarget] = useState<DateTarget>(null)

  function reset() {
    const initial = initialFormState(initialValues)
    setDateMode(initial.dateMode)
    setOnDate(initial.onDate)
    setFromDate(initial.fromDate)
    setToDate(initial.toDate)
    setTimeMode(initial.timeMode)
    setStartTime(initial.startTime)
    setEndTime(initial.endTime)
    setRecurrenceMode(initial.recurrenceMode)
    setRecurrenceDays(initial.recurrenceDays)
    setTimePickerTarget(null)
    setDatePickerTarget(null)
  }

  function toggleWeekday(day: Weekday) {
    setRecurrenceMode('days')
    setRecurrenceDays((current) =>
      current.includes(day)
        ? current.filter((selected) => selected !== day)
        : [...current, day],
    )
  }

  function handleClose() {
    reset()
    onClose()
  }

  async function handleSave() {
    const date =
      dateMode === 'on'
        ? ({ mode: 'on', date: onDate } as const)
        : ({ mode: 'range', from: fromDate, to: toDate } as const)

    const time: AvailabilityFormValues['time'] =
      timeMode === 'allDay'
        ? { mode: 'allDay' }
        : { mode: 'between', start: startTime, end: endTime }

    const orderedDays = WEEKDAY_ORDER.filter((day) =>
      effectiveRecurrenceDays.includes(day),
    )
    const recurrence: AvailabilityFormValues['recurrence'] =
      recurrenceMode === 'everyday' ||
      orderedDays.length === WEEKDAY_ORDER.length
        ? { mode: 'everyday' }
        : { mode: 'days', days: orderedDays }

    try {
      await onSave({ date, time, recurrence })
      reset()
    } catch {
      // The caller already surfaced an error to the user; keep the form
      // open with their input intact so they can retry.
    }
  }

  function handleTimeConfirm(time: string) {
    if (timePickerTarget === 'start') setStartTime(time)
    if (timePickerTarget === 'end') setEndTime(time)
    setTimePickerTarget(null)
  }

  function handleDateConfirm(date: string) {
    if (datePickerTarget === 'on') setOnDate(date)
    if (datePickerTarget === 'from') setFromDate(date)
    if (datePickerTarget === 'to') setToDate(date)
    setDatePickerTarget(null)
  }

  const weekdayLetters = t.raw('weekdayLetters') as string[]
  const weekdayNames = t.raw('weekdayNames') as string[]

  const isOnDateInvalid = onDate !== '' && !isValidAvailabilityDate(onDate)
  const isFromDateInvalid =
    fromDate !== '' && !isValidAvailabilityDate(fromDate)
  const isToDateInvalid = toDate !== '' && !isValidAvailabilityDate(toDate)
  const isTimeRangeInvalid = timeMode === 'between' && startTime >= endTime

  // null = dates aren't valid yet, so no weekday restriction can be computed.
  const allowedWeekdays =
    dateMode === 'on'
      ? (() => {
          const date = parseAvailabilityDate(onDate)
          return date ? new Set([weekdayOfDate(date)]) : null
        })()
      : (() => {
          const from = parseAvailabilityDate(fromDate)
          const to = parseAvailabilityDate(toDate)
          return from && to ? weekdaysInRange(from, to) : null
        })()

  const effectiveRecurrenceDays = allowedWeekdays
    ? recurrenceDays.filter((day) => allowedWeekdays.has(day))
    : recurrenceDays

  const isRecurrenceInvalid =
    recurrenceMode === 'days' && effectiveRecurrenceDays.length === 0

  const canSave =
    ((dateMode === 'on' && isValidAvailabilityDate(onDate)) ||
      (dateMode === 'range' &&
        isValidAvailabilityDate(fromDate) &&
        isValidAvailabilityDate(toDate))) &&
    !isTimeRangeInvalid &&
    !isRecurrenceInvalid

  const datePickerInitialValue =
    datePickerTarget === 'on'
      ? onDate
      : datePickerTarget === 'from'
        ? fromDate
        : toDate

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title ?? t('title')}
      closeLabel={t('close')}
      active={timePickerTarget === null && datePickerTarget === null}
    >
      <fieldset className='m-0 border-0 p-0'>
        <legend className={legendClassName}>{t('datesLegend')}</legend>
        <div className={optionsClassName}>
          <label className='flex cursor-pointer flex-col gap-1 font-secondary text-sm text-black-300'>
            <div className='flex items-center gap-3'>
              <input
                type='radio'
                name={`${formId}-date-mode`}
                className={radioInputClassName}
                checked={dateMode === 'on'}
                onChange={() => setDateMode('on')}
              />
              {t('on')}
              <div
                className={`${dateFieldWrapperClassName} ${dateMode === 'on' ? '' : 'opacity-50'}`}
                onFocus={() => setDateMode('on')}
              >
                <input
                  type='text'
                  placeholder='dd/mm/yyyy'
                  aria-label={t('onDateLabel')}
                  aria-invalid={isOnDateInvalid}
                  aria-describedby={
                    isOnDateInvalid ? `${formId}-on-date-error` : undefined
                  }
                  value={onDate}
                  onChange={(event) => setOnDate(event.target.value)}
                  className={dateInputClassName(isOnDateInvalid)}
                />
                <button
                  type='button'
                  onClick={() => {
                    setDateMode('on')
                    setDatePickerTarget('on')
                  }}
                  aria-label={t('openCalendarLabel', {
                    field: t('onDateLabel'),
                  })}
                  className={calendarButtonClassName}
                >
                  <Calendar size={16} aria-hidden='true' />
                </button>
              </div>
            </div>
            {isOnDateInvalid && (
              <p
                id={`${formId}-on-date-error`}
                role='alert'
                className='ml-7 font-secondary text-xs text-red-300'
              >
                {t('invalidDateError')}
              </p>
            )}
          </label>
          <label className='flex cursor-pointer flex-col gap-1 font-secondary text-sm text-black-300'>
            <div className='flex flex-wrap items-center gap-3'>
              <input
                type='radio'
                name={`${formId}-date-mode`}
                className={radioInputClassName}
                checked={dateMode === 'range'}
                onChange={() => setDateMode('range')}
              />
              {t('from')}
              <div
                className={`${dateFieldWrapperClassName} ${dateMode === 'range' ? '' : 'opacity-50'}`}
                onFocus={() => setDateMode('range')}
              >
                <input
                  type='text'
                  placeholder='dd/mm/yyyy'
                  aria-label={t('fromDateLabel')}
                  aria-invalid={isFromDateInvalid}
                  aria-describedby={
                    isFromDateInvalid ? `${formId}-from-date-error` : undefined
                  }
                  value={fromDate}
                  onChange={(event) => setFromDate(event.target.value)}
                  className={dateInputClassName(isFromDateInvalid)}
                />
                <button
                  type='button'
                  onClick={() => {
                    setDateMode('range')
                    setDatePickerTarget('from')
                  }}
                  aria-label={t('openCalendarLabel', {
                    field: t('fromDateLabel'),
                  })}
                  className={calendarButtonClassName}
                >
                  <Calendar size={16} aria-hidden='true' />
                </button>
              </div>
              {t('to')}
              <div
                className={`${dateFieldWrapperClassName} ${dateMode === 'range' ? '' : 'opacity-50'}`}
                onFocus={() => setDateMode('range')}
              >
                <input
                  type='text'
                  placeholder='dd/mm/yyyy'
                  aria-label={t('toDateLabel')}
                  aria-invalid={isToDateInvalid}
                  aria-describedby={
                    isToDateInvalid ? `${formId}-to-date-error` : undefined
                  }
                  value={toDate}
                  onChange={(event) => setToDate(event.target.value)}
                  className={dateInputClassName(isToDateInvalid)}
                />
                <button
                  type='button'
                  onClick={() => {
                    setDateMode('range')
                    setDatePickerTarget('to')
                  }}
                  aria-label={t('openCalendarLabel', {
                    field: t('toDateLabel'),
                  })}
                  className={calendarButtonClassName}
                >
                  <Calendar size={16} aria-hidden='true' />
                </button>
              </div>
            </div>
            {isFromDateInvalid && (
              <p
                id={`${formId}-from-date-error`}
                role='alert'
                className='ml-7 font-secondary text-xs text-red-300'
              >
                {t('invalidDateError')}
              </p>
            )}
            {isToDateInvalid && (
              <p
                id={`${formId}-to-date-error`}
                role='alert'
                className='ml-7 font-secondary text-xs text-red-300'
              >
                {t('invalidDateError')}
              </p>
            )}
          </label>
        </div>
      </fieldset>

      <fieldset className='m-0 mt-5.5 border-0 p-0'>
        <legend className={legendClassName}>{t('timesLegend')}</legend>
        <div className={optionsClassName}>
          <label className='flex cursor-pointer items-center gap-3 font-primary text-sm font-semibold text-black-300'>
            <input
              type='radio'
              name={`${formId}-time-mode`}
              className={radioInputClassName}
              checked={timeMode === 'allDay'}
              onChange={() => setTimeMode('allDay')}
            />
            {t('allDay')}
          </label>
          <label className='flex cursor-pointer flex-col gap-1 font-secondary text-sm text-black-300'>
            <div className='flex flex-wrap items-center gap-3'>
              <input
                type='radio'
                name={`${formId}-time-mode`}
                className={radioInputClassName}
                checked={timeMode === 'between'}
                onChange={() => setTimeMode('between')}
              />
              {t('between')}
              <button
                type='button'
                onFocus={() => setTimeMode('between')}
                onClick={() => {
                  setTimeMode('between')
                  setTimePickerTarget('start')
                }}
                aria-label={`${t('startTimeLabel')}: ${startTime}`}
                className={`${timeTriggerClassName} ${timeMode === 'between' ? '' : 'opacity-50'}`}
              >
                <span className='font-secondary text-sm text-black-300'>
                  {startTime}
                </span>
                <Clock
                  size={16}
                  className='text-black-200'
                  aria-hidden='true'
                />
              </button>
              {t('and')}
              <button
                type='button'
                onFocus={() => setTimeMode('between')}
                onClick={() => {
                  setTimeMode('between')
                  setTimePickerTarget('end')
                }}
                aria-label={`${t('endTimeLabel')}: ${endTime}`}
                aria-describedby={
                  isTimeRangeInvalid ? `${formId}-time-range-error` : undefined
                }
                className={`${timeTriggerClassName} ${
                  isTimeRangeInvalid
                    ? 'border-red-200'
                    : timeMode === 'between'
                      ? ''
                      : 'opacity-50'
                }`}
              >
                <span className='font-secondary text-sm text-black-300'>
                  {endTime}
                </span>
                <Clock
                  size={16}
                  className='text-black-200'
                  aria-hidden='true'
                />
              </button>
            </div>
            {isTimeRangeInvalid && (
              <p
                id={`${formId}-time-range-error`}
                role='alert'
                className='ml-7 font-secondary text-xs text-red-300'
              >
                {t('invalidTimeRangeError')}
              </p>
            )}
          </label>
        </div>
      </fieldset>

      <fieldset className='m-0 mt-5.5 border-0 p-0'>
        <legend className={legendClassName}>{t('recurrenceLegend')}</legend>
        <div className={optionsClassName}>
          <label className='flex cursor-pointer items-center gap-3 font-primary text-sm font-semibold text-black-300'>
            <input
              type='radio'
              name={`${formId}-recurrence-mode`}
              className={radioInputClassName}
              checked={recurrenceMode === 'everyday'}
              onChange={() => setRecurrenceMode('everyday')}
            />
            {t('everyday')}
          </label>
          <label className='flex cursor-pointer flex-col gap-1 font-secondary text-sm text-black-300'>
            <div className='flex items-center gap-3'>
              <input
                type='radio'
                name={`${formId}-recurrence-mode`}
                className={radioInputClassName}
                checked={recurrenceMode === 'days'}
                onChange={() => setRecurrenceMode('days')}
              />
              {t('theseDays')}
              <div
                className={`flex items-center gap-1.5 ${recurrenceMode === 'days' ? '' : 'opacity-50'}`}
              >
                {WEEKDAY_ORDER.map((day, index) => (
                  <button
                    key={day}
                    type='button'
                    onClick={() => toggleWeekday(day)}
                    disabled={
                      allowedWeekdays !== null && !allowedWeekdays.has(day)
                    }
                    aria-pressed={effectiveRecurrenceDays.includes(day)}
                    aria-label={weekdayNames[index]}
                    className={weekdayButtonClassName(
                      effectiveRecurrenceDays.includes(day),
                    )}
                  >
                    {weekdayLetters[index]}
                  </button>
                ))}
              </div>
            </div>
            {isRecurrenceInvalid && (
              <p
                role='alert'
                className='ml-7 font-secondary text-xs text-red-300'
              >
                {t('invalidRecurrenceError')}
              </p>
            )}
          </label>
        </div>
      </fieldset>

      <div className='mt-1.5 flex gap-2.5'>
        <button
          type='button'
          onClick={handleSave}
          disabled={!canSave}
          className='flex-1 cursor-pointer rounded-lg bg-blue-100 px-3 py-2.5 font-primary text-sm font-bold text-blue-300 disabled:cursor-not-allowed disabled:opacity-50'
        >
          {t('save')}
        </button>
        <button
          type='button'
          onClick={handleClose}
          className='flex-1 cursor-pointer rounded-lg bg-black-100/60 px-3 py-2.5 font-primary text-sm font-bold text-black-300'
        >
          {t('close')}
        </button>
      </div>

      <TimePickerModal
        key={`time-${timePickerTarget}`}
        isOpen={timePickerTarget !== null}
        initialTime={timePickerTarget === 'start' ? startTime : endTime}
        onCancel={() => setTimePickerTarget(null)}
        onConfirm={handleTimeConfirm}
      />

      <DatePickerModal
        key={`date-${datePickerTarget}`}
        isOpen={datePickerTarget !== null}
        initialDate={datePickerInitialValue}
        onCancel={() => setDatePickerTarget(null)}
        onConfirm={handleDateConfirm}
      />
    </Modal>
  )
}

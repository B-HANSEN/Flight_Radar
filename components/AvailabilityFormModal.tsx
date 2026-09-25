'use client'

import { useId, useReducer } from 'react'
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
  date: { mode: DateMode; on: string; from: string; to: string }
  time: { mode: TimeMode; start: string; end: string }
  recurrence: { mode: RecurrenceMode; days: Weekday[] }
  timePicker: TimeTarget
  datePicker: DateTarget
}

type FormAction =
  | { type: 'reset'; state: FormState }
  | { type: 'setDateMode'; mode: DateMode }
  | { type: 'setDate'; field: 'on' | 'from' | 'to'; value: string }
  | { type: 'openDatePicker'; target: 'on' | 'from' | 'to' }
  | { type: 'confirmDate'; value: string }
  | { type: 'closeDatePicker' }
  | { type: 'setTimeMode'; mode: TimeMode }
  | { type: 'openTimePicker'; target: 'start' | 'end' }
  | { type: 'confirmTime'; value: string }
  | { type: 'closeTimePicker' }
  | { type: 'setRecurrenceMode'; mode: RecurrenceMode }
  | { type: 'toggleWeekday'; day: Weekday }

function initialFormState(initialValues?: AvailabilityFormValues): FormState {
  const date = initialValues?.date
  const time = initialValues?.time
  const recurrence = initialValues?.recurrence

  return {
    date: {
      mode: date?.mode ?? 'range',
      on: date?.mode === 'on' ? date.date : '',
      from: date?.mode === 'range' ? date.from : '',
      to: date?.mode === 'range' ? date.to : '',
    },
    time: {
      mode: time?.mode ?? 'allDay',
      start: time?.mode === 'between' ? time.start : '08:00',
      end: time?.mode === 'between' ? time.end : '10:00',
    },
    recurrence: {
      mode: recurrence?.mode ?? 'everyday',
      days: recurrence?.mode === 'days' ? recurrence.days : [],
    },
    timePicker: null,
    datePicker: null,
  }
}

function toggle(days: Weekday[], day: Weekday): Weekday[] {
  return days.includes(day)
    ? days.filter((selected) => selected !== day)
    : [...days, day]
}

type DateAction = Extract<
  FormAction,
  {
    type:
      | 'setDateMode'
      | 'setDate'
      | 'openDatePicker'
      | 'confirmDate'
      | 'closeDatePicker'
  }
>
type TimeAction = Extract<
  FormAction,
  { type: 'setTimeMode' | 'openTimePicker' | 'confirmTime' | 'closeTimePicker' }
>
type RecurrenceAction = Extract<
  FormAction,
  { type: 'setRecurrenceMode' | 'toggleWeekday' }
>

// Opening a date's calendar also selects the radio option it belongs to.
function dateReducer(state: FormState, action: DateAction): FormState {
  const { date } = state
  switch (action.type) {
    case 'setDateMode':
      return { ...state, date: { ...date, mode: action.mode } }
    case 'setDate':
      return { ...state, date: { ...date, [action.field]: action.value } }
    case 'openDatePicker': {
      const mode = action.target === 'on' ? 'on' : 'range'
      return { ...state, date: { ...date, mode }, datePicker: action.target }
    }
    case 'confirmDate':
      if (state.datePicker === null) return state
      return {
        ...state,
        date: { ...date, [state.datePicker]: action.value },
        datePicker: null,
      }
    case 'closeDatePicker':
      return { ...state, datePicker: null }
  }
}

// Likewise, opening a time picker selects "between".
function timeReducer(state: FormState, action: TimeAction): FormState {
  const { time } = state
  switch (action.type) {
    case 'setTimeMode':
      return { ...state, time: { ...time, mode: action.mode } }
    case 'openTimePicker':
      return {
        ...state,
        time: { ...time, mode: 'between' },
        timePicker: action.target,
      }
    case 'confirmTime':
      if (state.timePicker === null) return state
      return {
        ...state,
        time: { ...time, [state.timePicker]: action.value },
        timePicker: null,
      }
    case 'closeTimePicker':
      return { ...state, timePicker: null }
  }
}

// Picking a weekday switches recurrence to "these days".
function recurrenceReducer(
  state: FormState,
  action: RecurrenceAction,
): FormState {
  const { recurrence } = state
  switch (action.type) {
    case 'setRecurrenceMode':
      return { ...state, recurrence: { ...recurrence, mode: action.mode } }
    case 'toggleWeekday':
      return {
        ...state,
        recurrence: { mode: 'days', days: toggle(recurrence.days, action.day) },
      }
  }
}

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'reset':
      return action.state
    case 'setDateMode':
    case 'setDate':
    case 'openDatePicker':
    case 'confirmDate':
    case 'closeDatePicker':
      return dateReducer(state, action)
    case 'setTimeMode':
    case 'openTimePicker':
    case 'confirmTime':
    case 'closeTimePicker':
      return timeReducer(state, action)
    case 'setRecurrenceMode':
    case 'toggleWeekday':
      return recurrenceReducer(state, action)
  }
}

// null = dates aren't valid yet, so no weekday restriction can be computed.
function allowedWeekdaysFor(date: FormState['date']): Set<Weekday> | null {
  if (date.mode === 'on') {
    const on = parseAvailabilityDate(date.on)
    return on ? new Set([weekdayOfDate(on)]) : null
  }
  const from = parseAvailabilityDate(date.from)
  const to = parseAvailabilityDate(date.to)
  return from && to ? weekdaysInRange(from, to) : null
}

function toFormValues(
  { date, time, recurrence }: FormState,
  effectiveDays: Weekday[],
): AvailabilityFormValues {
  const orderedDays = WEEKDAY_ORDER.filter((day) => effectiveDays.includes(day))
  return {
    date:
      date.mode === 'on'
        ? { mode: 'on', date: date.on }
        : { mode: 'range', from: date.from, to: date.to },
    time:
      time.mode === 'allDay'
        ? { mode: 'allDay' }
        : { mode: 'between', start: time.start, end: time.end },
    recurrence:
      recurrence.mode === 'everyday' ||
      orderedDays.length === WEEKDAY_ORDER.length
        ? { mode: 'everyday' }
        : { mode: 'days', days: orderedDays },
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
  const [state, dispatch] = useReducer(
    formReducer,
    initialValues,
    initialFormState,
  )
  const { date, time, recurrence, timePicker, datePicker } = state

  function reset() {
    dispatch({ type: 'reset', state: initialFormState(initialValues) })
  }

  function handleClose() {
    reset()
    onClose()
  }

  async function handleSave() {
    try {
      await onSave(toFormValues(state, effectiveRecurrenceDays))
      reset()
    } catch {
      // The caller already surfaced an error to the user; keep the form
      // open with their input intact so they can retry.
    }
  }

  const weekdayLetters = t.raw('weekdayLetters') as string[]
  const weekdayNames = t.raw('weekdayNames') as string[]

  const isOnDateInvalid = date.on !== '' && !isValidAvailabilityDate(date.on)
  const isFromDateInvalid =
    date.from !== '' && !isValidAvailabilityDate(date.from)
  const isToDateInvalid = date.to !== '' && !isValidAvailabilityDate(date.to)
  const isTimeRangeInvalid = time.mode === 'between' && time.start >= time.end

  const allowedWeekdays = allowedWeekdaysFor(date)
  const effectiveRecurrenceDays = allowedWeekdays
    ? recurrence.days.filter((day) => allowedWeekdays.has(day))
    : recurrence.days

  const isRecurrenceInvalid =
    recurrence.mode === 'days' && effectiveRecurrenceDays.length === 0

  const canSave =
    ((date.mode === 'on' && isValidAvailabilityDate(date.on)) ||
      (date.mode === 'range' &&
        isValidAvailabilityDate(date.from) &&
        isValidAvailabilityDate(date.to))) &&
    !isTimeRangeInvalid &&
    !isRecurrenceInvalid

  const datePickerInitialValue =
    datePicker === null ? date.to : date[datePicker]

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title ?? t('title')}
      closeLabel={t('close')}
      active={timePicker === null && datePicker === null}
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
                checked={date.mode === 'on'}
                onChange={() => dispatch({ type: 'setDateMode', mode: 'on' })}
              />
              {t('on')}
              <div
                className={`${dateFieldWrapperClassName} ${date.mode === 'on' ? '' : 'opacity-50'}`}
              >
                <input
                  type='text'
                  placeholder='dd/mm/yyyy'
                  aria-label={t('onDateLabel')}
                  aria-invalid={isOnDateInvalid}
                  aria-describedby={
                    isOnDateInvalid ? `${formId}-on-date-error` : undefined
                  }
                  value={date.on}
                  onChange={(event) =>
                    dispatch({
                      type: 'setDate',
                      field: 'on',
                      value: event.target.value,
                    })
                  }
                  onFocus={() => dispatch({ type: 'setDateMode', mode: 'on' })}
                  className={dateInputClassName(isOnDateInvalid)}
                />
                <button
                  type='button'
                  onClick={() =>
                    dispatch({ type: 'openDatePicker', target: 'on' })
                  }
                  onFocus={() => dispatch({ type: 'setDateMode', mode: 'on' })}
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
                checked={date.mode === 'range'}
                onChange={() =>
                  dispatch({ type: 'setDateMode', mode: 'range' })
                }
              />
              {t('from')}
              <div
                className={`${dateFieldWrapperClassName} ${date.mode === 'range' ? '' : 'opacity-50'}`}
              >
                <input
                  type='text'
                  placeholder='dd/mm/yyyy'
                  aria-label={t('fromDateLabel')}
                  aria-invalid={isFromDateInvalid}
                  aria-describedby={
                    isFromDateInvalid ? `${formId}-from-date-error` : undefined
                  }
                  value={date.from}
                  onChange={(event) =>
                    dispatch({
                      type: 'setDate',
                      field: 'from',
                      value: event.target.value,
                    })
                  }
                  onFocus={() =>
                    dispatch({ type: 'setDateMode', mode: 'range' })
                  }
                  className={dateInputClassName(isFromDateInvalid)}
                />
                <button
                  type='button'
                  onClick={() =>
                    dispatch({ type: 'openDatePicker', target: 'from' })
                  }
                  onFocus={() =>
                    dispatch({ type: 'setDateMode', mode: 'range' })
                  }
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
                className={`${dateFieldWrapperClassName} ${date.mode === 'range' ? '' : 'opacity-50'}`}
              >
                <input
                  type='text'
                  placeholder='dd/mm/yyyy'
                  aria-label={t('toDateLabel')}
                  aria-invalid={isToDateInvalid}
                  aria-describedby={
                    isToDateInvalid ? `${formId}-to-date-error` : undefined
                  }
                  value={date.to}
                  onChange={(event) =>
                    dispatch({
                      type: 'setDate',
                      field: 'to',
                      value: event.target.value,
                    })
                  }
                  onFocus={() =>
                    dispatch({ type: 'setDateMode', mode: 'range' })
                  }
                  className={dateInputClassName(isToDateInvalid)}
                />
                <button
                  type='button'
                  onClick={() =>
                    dispatch({ type: 'openDatePicker', target: 'to' })
                  }
                  onFocus={() =>
                    dispatch({ type: 'setDateMode', mode: 'range' })
                  }
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
              checked={time.mode === 'allDay'}
              onChange={() => dispatch({ type: 'setTimeMode', mode: 'allDay' })}
            />
            {t('allDay')}
          </label>
          <label className='flex cursor-pointer flex-col gap-1 font-secondary text-sm text-black-300'>
            <div className='flex flex-wrap items-center gap-3'>
              <input
                type='radio'
                name={`${formId}-time-mode`}
                className={radioInputClassName}
                checked={time.mode === 'between'}
                onChange={() =>
                  dispatch({ type: 'setTimeMode', mode: 'between' })
                }
              />
              {t('between')}
              <button
                type='button'
                onFocus={() =>
                  dispatch({ type: 'setTimeMode', mode: 'between' })
                }
                onClick={() =>
                  dispatch({ type: 'openTimePicker', target: 'start' })
                }
                aria-label={`${t('startTimeLabel')}: ${time.start}`}
                className={`${timeTriggerClassName} ${time.mode === 'between' ? '' : 'opacity-50'}`}
              >
                <span className='font-secondary text-sm text-black-300'>
                  {time.start}
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
                onFocus={() =>
                  dispatch({ type: 'setTimeMode', mode: 'between' })
                }
                onClick={() =>
                  dispatch({ type: 'openTimePicker', target: 'end' })
                }
                aria-label={`${t('endTimeLabel')}: ${time.end}`}
                aria-describedby={
                  isTimeRangeInvalid ? `${formId}-time-range-error` : undefined
                }
                className={`${timeTriggerClassName} ${
                  isTimeRangeInvalid
                    ? 'border-red-200'
                    : time.mode === 'between'
                      ? ''
                      : 'opacity-50'
                }`}
              >
                <span className='font-secondary text-sm text-black-300'>
                  {time.end}
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
              checked={recurrence.mode === 'everyday'}
              onChange={() =>
                dispatch({ type: 'setRecurrenceMode', mode: 'everyday' })
              }
            />
            {t('everyday')}
          </label>
          <label className='flex cursor-pointer flex-col gap-1 font-secondary text-sm text-black-300'>
            <div className='flex items-center gap-3'>
              <input
                type='radio'
                name={`${formId}-recurrence-mode`}
                className={radioInputClassName}
                checked={recurrence.mode === 'days'}
                onChange={() =>
                  dispatch({ type: 'setRecurrenceMode', mode: 'days' })
                }
              />
              {t('theseDays')}
              <div
                className={`flex items-center gap-1.5 ${recurrence.mode === 'days' ? '' : 'opacity-50'}`}
              >
                {WEEKDAY_ORDER.map((day, index) => (
                  <button
                    key={day}
                    type='button'
                    onClick={() => dispatch({ type: 'toggleWeekday', day })}
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
        key={`time-${timePicker}`}
        isOpen={timePicker !== null}
        initialTime={timePicker === 'start' ? time.start : time.end}
        onCancel={() => dispatch({ type: 'closeTimePicker' })}
        onConfirm={(value) => dispatch({ type: 'confirmTime', value })}
      />

      <DatePickerModal
        key={`date-${datePicker}`}
        isOpen={datePicker !== null}
        initialDate={datePickerInitialValue}
        onCancel={() => dispatch({ type: 'closeDatePicker' })}
        onConfirm={(value) => dispatch({ type: 'confirmDate', value })}
      />
    </Modal>
  )
}

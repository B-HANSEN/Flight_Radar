'use client'

import { useEffect, useId, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Clock } from 'lucide-react'
import Modal from './Modal'
import TimePickerModal from './TimePickerModal'
import { focusRing } from '@/lib/styles'
import { fetchApi } from '@/lib/api'
import type { ScheduleAircraft } from './ScheduleBoard.types'
import type {
  AircraftAvailability,
  ScheduleFlightConfirmInput,
  ScheduleFlightTarget,
} from './ScheduleFlightModal.types'

type Props = {
  target: ScheduleFlightTarget | null
  onClose: () => void
  onConfirm: (input: ScheduleFlightConfirmInput) => void | Promise<void>
  instructorName?: string
  aircraft: ScheduleAircraft[]
}

type TimeTarget = 'start' | 'end' | null

const LESSON_TYPE_KEYS = [
  ['Dual instruction', 'lessonTypeDual'],
  ['Solo supervised', 'lessonTypeSolo'],
  ['Checkride prep', 'lessonTypeCheckride'],
] as const

const timeTriggerClassName =
  'flex cursor-pointer items-center gap-1.5 rounded-lg border border-black-200 px-3 py-2'

const pillClassName = (active: boolean, disabled = false) =>
  `rounded-full border px-3.5 py-2 font-primary text-xs font-bold ${focusRing} ${
    disabled
      ? // Solid black-100/black-300 (not a translucent tint) to keep text
        // contrast at ~10:1 — the same pairing ScheduleBoard uses for its
        // 'reserved' blocks — rather than the ~2.6:1 a translucent grey-on-grey
        // tint would give.
        'cursor-not-allowed border-black-100 bg-black-100 text-black-300'
      : `cursor-pointer ${
          active
            ? 'border-black-300 bg-black-300 text-white'
            : 'border-black-100 bg-white text-black-200'
        }`
  }`

function uniqueAircraftTypes(aircraft: ScheduleAircraft[]): string[] {
  return Array.from(new Set(aircraft.map((ac) => ac.type)))
}

function formatDayLabel(isoDate: string, locale: string): string {
  const date = new Date(`${isoDate}T00:00:00`)
  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(
    date,
  )
  const day = new Intl.DateTimeFormat(locale, { day: 'numeric' }).format(date)
  const month = new Intl.DateTimeFormat(locale, { month: 'short' }).format(date)
  return `${weekday} ${day} ${month}`
}

export default function ScheduleFlightModal({
  target,
  onClose,
  onConfirm,
  instructorName,
  aircraft,
}: Props) {
  const t = useTranslations('ScheduleFlightModal')
  const locale = useLocale()
  const formId = useId()

  const [selectedAircraftType, setSelectedAircraftType] = useState('')
  const [selectedAircraftId, setSelectedAircraftId] = useState('')
  const [selectedLessonType, setSelectedLessonType] = useState('')
  const [comments, setComments] = useState('')
  const [startTime, setStartTime] = useState(target?.slot.startTime ?? '')
  const [endTime, setEndTime] = useState(target?.slot.endTime ?? '')
  const [timePickerTarget, setTimePickerTarget] = useState<TimeTarget>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fetchedBusyAircraft, setFetchedBusyAircraft] = useState<
    AircraftAvailability[]
  >([])

  const targetDate = target?.slot.date
  const isValidWindow = targetDate !== undefined && startTime < endTime
  // Stale results from an invalid (e.g. mid-edit) window are never shown,
  // without needing an effect to reset state back to empty.
  const busyAircraft = isValidWindow ? fetchedBusyAircraft : []

  // Refetch whenever the date or the (possibly narrowed) time window
  // changes, so busy tails stay accurate as the instructor adjusts the slot.
  useEffect(() => {
    if (!isValidWindow) return

    let cancelled = false
    const params = new URLSearchParams({
      date: targetDate,
      startTime,
      endTime,
    })

    fetchApi<AircraftAvailability[]>(`/schedule/availability?${params}`)
      .then((busy) => {
        if (!cancelled) setFetchedBusyAircraft(Array.isArray(busy) ? busy : [])
      })
      .catch(() => {
        if (!cancelled) setFetchedBusyAircraft([])
      })

    return () => {
      cancelled = true
    }
  }, [isValidWindow, targetDate, startTime, endTime])

  const aircraftTypes = uniqueAircraftTypes(aircraft)
  const tailsForSelectedType = aircraft.filter(
    (ac) => ac.type === selectedAircraftType,
  )
  const busyAircraftById = new Map(
    busyAircraft.map((busy) => [busy.aircraftId, busy]),
  )
  // A tail the instructor already picked can turn busy under them if they
  // then narrow the time window — treat it as unselected rather than
  // leaving a conflicting tail silently selected.
  const selectedAircraft = busyAircraftById.has(selectedAircraftId)
    ? undefined
    : aircraft.find((a) => a.id === selectedAircraftId)
  const selectedLessonTypeKey = LESSON_TYPE_KEYS.find(
    ([value]) => value === selectedLessonType,
  )?.[1]

  const dayLabel = target ? formatDayLabel(target.slot.date, locale) : ''

  const isTimeRangeInvalid =
    target !== null &&
    (startTime >= endTime ||
      startTime < target.slot.startTime ||
      endTime > target.slot.endTime)

  function selectAircraftType(type: string) {
    setSelectedAircraftType((current) => (current === type ? '' : type))
    setSelectedAircraftId('')
  }

  function toggleLessonType(type: string) {
    setSelectedLessonType((current) => (current === type ? '' : type))
  }

  function handleTimeConfirm(time: string) {
    if (timePickerTarget === 'start') setStartTime(time)
    if (timePickerTarget === 'end') setEndTime(time)
    setTimePickerTarget(null)
  }

  const canConfirm =
    !isSubmitting &&
    target !== null &&
    selectedAircraft !== undefined &&
    selectedLessonType !== '' &&
    !isTimeRangeInvalid

  const summary =
    target &&
    selectedAircraft &&
    selectedLessonType &&
    selectedLessonTypeKey &&
    !isTimeRangeInvalid
      ? t('summaryReady', {
          student: target.studentName,
          aircraft: selectedAircraft.arcid,
          lessonType: t(selectedLessonTypeKey),
          start: startTime,
          end: endTime,
        })
      : t('summaryPrompt')

  async function handleConfirm() {
    if (!canConfirm || !target || !selectedAircraft) return

    setIsSubmitting(true)
    try {
      await onConfirm({
        studentId: target.studentId,
        aircraftId: selectedAircraft.id,
        date: target.slot.date,
        startTime,
        endTime,
        lessonType: selectedLessonType,
        comments: comments.trim(),
      })
    } catch {
      // The caller already surfaced an error to the user; keep the modal
      // open with their selections intact so they can retry.
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={target !== null}
      onClose={onClose}
      title={t('title')}
      closeLabel={t('close')}
      maxWidthClassName='max-w-3xl'
      active={timePickerTarget === null}
    >
      {target && (
        <>
          <div className='mb-5 flex flex-wrap items-center justify-between gap-3'>
            {instructorName ? (
              <div className='font-secondary text-xs font-semibold tracking-wide text-black-200 uppercase'>
                {t('instructorLabel', { name: instructorName })}
              </div>
            ) : (
              <div />
            )}

            <div className='text-right'>
              <div className='font-primary text-sm font-bold text-black-300'>
                {target.studentName}
              </div>
              <div className='font-secondary text-xs text-black-200'>
                {dayLabel}
              </div>
            </div>
          </div>

          <fieldset className='m-0 mb-5 border-0 p-0'>
            <legend className='mb-2.5 block w-full font-secondary text-xs font-semibold text-black-200 uppercase'>
              {t('timeLegend')}
            </legend>
            <div className='flex flex-wrap items-center gap-3'>
              <button
                type='button'
                onClick={() => setTimePickerTarget('start')}
                aria-label={`${t('startTimeLabel')}: ${startTime}`}
                aria-describedby={
                  isTimeRangeInvalid ? `${formId}-time-range-error` : undefined
                }
                className={`${timeTriggerClassName} ${isTimeRangeInvalid ? 'border-red-200' : ''}`}
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
              <span className='font-secondary text-sm text-black-200'>–</span>
              <button
                type='button'
                onClick={() => setTimePickerTarget('end')}
                aria-label={`${t('endTimeLabel')}: ${endTime}`}
                aria-describedby={
                  isTimeRangeInvalid ? `${formId}-time-range-error` : undefined
                }
                className={`${timeTriggerClassName} ${isTimeRangeInvalid ? 'border-red-200' : ''}`}
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
            {isTimeRangeInvalid ? (
              <p
                id={`${formId}-time-range-error`}
                role='alert'
                className='mt-1.5 font-secondary text-xs text-red-300'
              >
                {t('invalidTimeRangeError')}
              </p>
            ) : (
              <p className='mt-1.5 font-secondary text-xs text-black-200'>
                {t('availableWindowHint', {
                  start: target.slot.startTime,
                  end: target.slot.endTime,
                })}
              </p>
            )}
          </fieldset>

          <fieldset className='m-0 mb-5 border-0 p-0'>
            <legend className='mb-2.5 block w-full font-secondary text-xs font-semibold text-black-200 uppercase'>
              {t('aircraftTypeLegend')}
            </legend>
            <div className='flex flex-wrap gap-2'>
              {aircraftTypes.map((type) => (
                <button
                  key={type}
                  type='button'
                  onClick={() => selectAircraftType(type)}
                  aria-pressed={selectedAircraftType === type}
                  className={pillClassName(selectedAircraftType === type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </fieldset>

          {selectedAircraftType && (
            <fieldset className='m-0 mb-5 border-0 p-0'>
              <legend className='mb-2.5 block w-full font-secondary text-xs font-semibold text-black-200 uppercase'>
                {t('tailNumberLegend')}
              </legend>
              <div className='flex flex-wrap gap-2'>
                {tailsForSelectedType.map((option) => {
                  const busy = busyAircraftById.get(option.id)
                  const isSelected = selectedAircraft?.id === option.id
                  const reasonId = `${formId}-tail-${option.id}-reason`
                  return (
                    <div key={option.id} className='contents'>
                      <button
                        type='button'
                        onClick={() => {
                          if (!busy) setSelectedAircraftId(option.id)
                        }}
                        aria-pressed={isSelected}
                        aria-disabled={busy !== undefined}
                        aria-describedby={busy ? reasonId : undefined}
                        title={
                          busy
                            ? t('tailUnavailableReason', { reason: busy.label })
                            : undefined
                        }
                        className={pillClassName(
                          isSelected,
                          busy !== undefined,
                        )}
                      >
                        {option.arcid}
                      </button>
                      {busy && (
                        // title alone isn't reliably exposed to assistive
                        // tech or touch users — this is the reason a screen
                        // reader actually announces on focus.
                        <span id={reasonId} className='sr-only'>
                          {t('tailUnavailableReason', { reason: busy.label })}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </fieldset>
          )}

          <fieldset className='m-0 mb-5 border-0 p-0'>
            <legend className='mb-2.5 block w-full font-secondary text-xs font-semibold text-black-200 uppercase'>
              {t('lessonTypeLegend')}
            </legend>
            <div className='flex flex-wrap gap-2'>
              {LESSON_TYPE_KEYS.map(([value, key]) => (
                <button
                  key={value}
                  type='button'
                  onClick={() => toggleLessonType(value)}
                  aria-pressed={selectedLessonType === value}
                  className={pillClassName(selectedLessonType === value)}
                >
                  {t(key)}
                </button>
              ))}
            </div>
          </fieldset>

          <div className='mb-5'>
            <label
              htmlFor={`${formId}-comments`}
              className='mb-2.5 block w-full font-secondary text-xs font-semibold text-black-200 uppercase'
            >
              {t('commentsLegend')}
            </label>
            <textarea
              id={`${formId}-comments`}
              value={comments}
              onChange={(event) => setComments(event.target.value)}
              placeholder={t('commentsPlaceholder')}
              className={`min-h-20 w-full resize-y rounded-lg border border-black-100 bg-white px-3.5 py-3 font-secondary text-sm text-black-300 ${focusRing}`}
            />
          </div>

          <div className='flex items-center justify-between gap-4 border-t border-black-100 pt-4.5'>
            <p className='font-secondary text-xs text-black-200'>{summary}</p>
            <button
              type='button'
              onClick={handleConfirm}
              disabled={!canConfirm}
              className='flex-none cursor-pointer rounded-lg bg-black-300 px-4.5 py-2.5 font-primary text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-black-100 disabled:text-black-200'
            >
              {isSubmitting ? t('confirming') : t('confirm')}
            </button>
          </div>

          <TimePickerModal
            key={`time-${timePickerTarget}`}
            isOpen={timePickerTarget !== null}
            initialTime={timePickerTarget === 'start' ? startTime : endTime}
            onCancel={() => setTimePickerTarget(null)}
            onConfirm={handleTimeConfirm}
          />
        </>
      )}
    </Modal>
  )
}

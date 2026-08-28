'use client'

import { useEffect, useId, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { CheckCircle2, Clock, Plane } from 'lucide-react'
import Modal from './Modal'
import TimePickerModal from './TimePickerModal'
import Toast from './Toast'
import { focusRing } from '@/lib/styles'
import { fetchApi } from '@/lib/api'
import type { ScheduleAircraft } from './ScheduleBoard.types'
import type { Instructor } from './RoleSwitcher.types'
import type {
  AircraftAvailability,
  ScheduledFlight,
  ScheduleFlightConfirmInput,
  ScheduleFlightTarget,
} from './ScheduleFlightModal.types'

// A student can't be dropped into a second lesson right after the first —
// mirrors the buffer BookingsService.create enforces server-side.
const STUDENT_BUFFER_MINUTES = 90

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

type Props = {
  target: ScheduleFlightTarget | null
  onClose: () => void
  onConfirm: (input: ScheduleFlightConfirmInput) => void | Promise<void>
  instructorName?: string
  currentInstructorId?: string
  instructors: Instructor[]
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
      ? 'cursor-not-allowed border-black-100 bg-black-100 text-black-300'
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
  currentInstructorId,
  instructors,
  aircraft,
}: Props) {
  const t = useTranslations('ScheduleFlightModal')
  const locale = useLocale()
  const formId = useId()

  const [selectedAircraftType, setSelectedAircraftType] = useState('')
  const [selectedAircraftId, setSelectedAircraftId] = useState('')
  const [selectedLessonType, setSelectedLessonType] = useState('')
  const [selectedInstructorId, setSelectedInstructorId] = useState(
    currentInstructorId ?? '',
  )
  const [instructorLockedNotice, setInstructorLockedNotice] = useState(false)
  const [comments, setComments] = useState('')
  const [startTime, setStartTime] = useState(target?.slot.startTime ?? '')
  const [endTime, setEndTime] = useState(target?.slot.endTime ?? '')
  const [timePickerTarget, setTimePickerTarget] = useState<TimeTarget>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fetchedBusyAircraft, setFetchedBusyAircraft] = useState<
    AircraftAvailability[]
  >([])
  const [existingFlights, setExistingFlights] = useState<ScheduledFlight[]>([])

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

  // The student's booked flights for the day don't depend on the time
  // window being picked, only on which student/date the modal targets —
  // unlike busy aircraft above, this doesn't need to refetch as the
  // instructor narrows the slot.
  useEffect(() => {
    // Nothing to fetch without a target — ScheduleFlightModal is remounted
    // (see its `key` in InstructorScheduleView) each time a new one is set,
    // so there's no stale list to clear here.
    if (!target) return

    let cancelled = false
    const params = new URLSearchParams({
      studentId: target.studentId,
      date: target.slot.date,
    })

    fetchApi<ScheduledFlight[]>(`/schedule/student-flights?${params}`)
      .then((flights) => {
        if (!cancelled)
          setExistingFlights(Array.isArray(flights) ? flights : [])
      })
      .catch(() => {
        if (!cancelled) setExistingFlights([])
      })

    return () => {
      cancelled = true
    }
  }, [target])

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
  const selectedInstructor = instructors.find(
    (i) => i.id === selectedInstructorId,
  )
  // The Chief Flight Instructor can assign either instructor to a lesson;
  // a Deputy can only ever assign themselves.
  const currentInstructor = instructors.find(
    (i) => i.id === currentInstructorId,
  )
  const canAssignOtherInstructor = currentInstructor?.isChief === true

  const dayLabel = target ? formatDayLabel(target.slot.date, locale) : ''

  const isTimeRangeInvalid =
    target !== null &&
    (startTime >= endTime ||
      startTime < target.slot.startTime ||
      endTime > target.slot.endTime)

  // Only checked once the window itself is well-formed — an invalid window
  // already blocks confirm and gets its own message.
  const overlappingFlight = !isTimeRangeInvalid
    ? existingFlights.find(
        (flight) => startTime < flight.endTime && flight.startTime < endTime,
      )
    : undefined
  const bufferConflictFlight =
    !isTimeRangeInvalid && !overlappingFlight
      ? existingFlights.find(
          (flight) =>
            toMinutes(startTime) <
              toMinutes(flight.endTime) + STUDENT_BUFFER_MINUTES &&
            toMinutes(flight.startTime) <
              toMinutes(endTime) + STUDENT_BUFFER_MINUTES,
        )
      : undefined
  const hasSchedulingConflict =
    isTimeRangeInvalid ||
    overlappingFlight !== undefined ||
    bufferConflictFlight !== undefined

  function selectAircraftType(type: string) {
    setSelectedAircraftType((current) => (current === type ? '' : type))
    setSelectedAircraftId('')
  }

  // Unlike aircraft type/lesson type, an instructor can't be deselected
  // back to none — a booking always needs one assigned.
  function selectInstructor(id: string) {
    if (!canAssignOtherInstructor) {
      if (id !== currentInstructorId) setInstructorLockedNotice(true)
      return
    }
    setSelectedInstructorId(id)
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
    selectedInstructor !== undefined &&
    !hasSchedulingConflict

  const summary =
    target &&
    selectedAircraft &&
    selectedLessonType &&
    selectedLessonTypeKey &&
    selectedInstructor &&
    !hasSchedulingConflict
      ? t('summaryReady', {
          student: target.studentName,
          aircraft: selectedAircraft.arcid,
          lessonType: t(selectedLessonTypeKey),
          start: startTime,
          end: endTime,
        })
      : t('summaryPrompt')

  async function handleConfirm() {
    if (!canConfirm || !target || !selectedAircraft || !selectedInstructor)
      return

    setIsSubmitting(true)
    try {
      await onConfirm({
        studentId: target.studentId,
        aircraftId: selectedAircraft.id,
        instructorId: selectedInstructor.id,
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
                  hasSchedulingConflict ? `${formId}-time-issue` : undefined
                }
                className={`${timeTriggerClassName} ${hasSchedulingConflict ? 'border-red-200' : ''}`}
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
                  hasSchedulingConflict ? `${formId}-time-issue` : undefined
                }
                className={`${timeTriggerClassName} ${hasSchedulingConflict ? 'border-red-200' : ''}`}
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
            {existingFlights.length > 0 && (
              <ul
                aria-label={t('existingFlightsLabel')}
                className='mt-3 flex flex-col gap-1.5'
              >
                {existingFlights.map((flight) => (
                  <li
                    key={flight.id}
                    className='flex items-center gap-2.5 rounded-lg bg-blue-100 px-3 py-2'
                  >
                    <Plane
                      size={13}
                      className='shrink-0 text-blue-300'
                      aria-hidden='true'
                    />
                    <span className='font-primary text-xs font-bold text-blue-300'>
                      {flight.startTime} – {flight.endTime}
                    </span>
                    <span className='font-secondary text-xs text-blue-300/70'>
                      {flight.label}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {existingFlights.length >= 2 && (
              <p className='mt-1.5 font-secondary text-xs text-yellow-300'>
                {t('tooManyFlightsWarning')}
              </p>
            )}
            {isTimeRangeInvalid ? (
              <p
                id={`${formId}-time-issue`}
                role='alert'
                className='mt-1.5 font-secondary text-xs text-red-300'
              >
                {t('invalidTimeRangeError')}
              </p>
            ) : overlappingFlight ? (
              <p
                id={`${formId}-time-issue`}
                role='alert'
                className='mt-1.5 font-secondary text-xs text-red-300'
              >
                {t('overlapNotice', {
                  start: overlappingFlight.startTime,
                  end: overlappingFlight.endTime,
                  label: overlappingFlight.label,
                })}
              </p>
            ) : bufferConflictFlight ? (
              <p
                id={`${formId}-time-issue`}
                role='alert'
                className='mt-1.5 font-secondary text-xs text-red-300'
              >
                {t('bufferNotice')}
              </p>
            ) : (
              <p className='mt-1.5 font-secondary text-xs text-black-200'>
                {t('availableWindowHint', {
                  start: target.slot.startTime,
                  end: target.slot.endTime,
                })}
              </p>
            )}
            {!hasSchedulingConflict && existingFlights.length > 0 && (
              <p className='mt-1.5 flex items-center gap-1.5 font-secondary text-xs text-green-300'>
                <CheckCircle2
                  size={14}
                  className='shrink-0'
                  aria-hidden='true'
                />
                {t('bufferClearNotice')}
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

          <fieldset className='m-0 mb-5 border-0 p-0'>
            <legend className='mb-2.5 block w-full font-secondary text-xs font-semibold text-black-200 uppercase'>
              {t('instructorAssignedLegend')}
            </legend>
            <div className='flex flex-wrap gap-2'>
              {instructors.map((option) => {
                const isSelected = selectedInstructorId === option.id
                const isLocked =
                  !canAssignOtherInstructor && option.id !== currentInstructorId
                const reasonId = `${formId}-instructor-${option.id}-reason`
                return (
                  <div key={option.id} className='contents'>
                    <button
                      type='button'
                      onClick={() => selectInstructor(option.id)}
                      aria-pressed={isSelected}
                      aria-disabled={isLocked}
                      aria-describedby={isLocked ? reasonId : undefined}
                      title={isLocked ? t('instructorLocked') : undefined}
                      className={pillClassName(isSelected, isLocked)}
                    >
                      {option.name}
                    </button>
                    {isLocked && (
                      <span id={reasonId} className='sr-only'>
                        {t('instructorLocked')}
                      </span>
                    )}
                  </div>
                )
              })}
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

          <Toast
            message={t('instructorLockedNotice')}
            open={instructorLockedNotice}
            onClose={() => setInstructorLockedNotice(false)}
            durationMs={5000}
            variant='error'
          />
        </>
      )}
    </Modal>
  )
}

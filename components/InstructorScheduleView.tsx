'use client'

import { useMemo, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import {
  addWeeks,
  formatWeekRangeLabel,
  startOfWeek,
  toISODate,
} from '@/lib/weekGrid'
import { fetchApi } from '@/lib/api'
import InstructorSchedulePanel from './InstructorSchedulePanel'
import ScheduleFlightModal from './ScheduleFlightModal'
import Toast from './Toast'
import type {
  InstructorScheduleSlot,
  InstructorScheduleStudent,
} from './InstructorSchedulePanel.types'
import type { RawStudentSchedule } from './InstructorScheduleView.types'
import type { Instructor } from './RoleSwitcher.types'
import type { ScheduleAircraft } from './ScheduleBoard.types'
import type {
  ScheduleFlightConfirmInput,
  ScheduleFlightTarget,
} from './ScheduleFlightModal.types'

type Props = {
  instructorName?: string
  currentInstructorId?: string
  instructors?: Instructor[]
  students?: RawStudentSchedule[]
  aircraft?: ScheduleAircraft[]
  referenceDate?: Date
}

type SchedulingRef = {
  studentId: string
  slotId: string
}

export default function InstructorScheduleView({
  instructorName,
  currentInstructorId,
  instructors = [],
  students = [],
  aircraft = [],
  referenceDate,
}: Props) {
  const t = useTranslations('InstructorScheduleView')
  const locale = useLocale()
  const today = useMemo(() => referenceDate ?? new Date(), [referenceDate])
  const currentWeekStart = useMemo(() => startOfWeek(today), [today])
  const [weekOffset, setWeekOffset] = useState(0)
  const [studentSchedules, setStudentSchedules] =
    useState<RawStudentSchedule[]>(students)
  const [scheduling, setScheduling] = useState<SchedulingRef | null>(null)
  const [toast, setToast] = useState<{
    message: string
    variant: 'success' | 'error'
  } | null>(null)

  const weekStart = useMemo(
    () => addWeeks(currentWeekStart, weekOffset),
    [currentWeekStart, weekOffset],
  )
  const weekEnd = useMemo(() => addWeeks(weekStart, 1), [weekStart])

  const weekLabel = useMemo(() => {
    const shortDate = new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
    }).format(weekStart)
    return t('weekOf', { date: shortDate })
  }, [locale, t, weekStart])

  const weekRangeLabel = useMemo(
    () => formatWeekRangeLabel(weekStart, locale),
    [locale, weekStart],
  )

  const displayStudents = useMemo<InstructorScheduleStudent[]>(() => {
    const weekStartIso = toISODate(weekStart)
    const weekEndIso = toISODate(weekEnd)

    return studentSchedules.map((student) => {
      const slots: InstructorScheduleSlot[] = student.slots
        .filter((slot) => slot.date >= weekStartIso && slot.date < weekEndIso)
        .map((slot) => {
          const slotDate = new Date(`${slot.date}T00:00:00`)
          const weekday = new Intl.DateTimeFormat(locale, {
            weekday: 'short',
          }).format(slotDate)
          const day = new Intl.DateTimeFormat(locale, {
            day: 'numeric',
          }).format(slotDate)
          return {
            id: slot.id,
            day: `${weekday} ${day}`,
            time: `${slot.startTime} - ${slot.endTime}`,
          }
        })

      return {
        id: student.id,
        name: student.name,
        course: student.course,
        slots,
      }
    })
  }, [locale, studentSchedules, weekEnd, weekStart])

  const schedulingTarget: ScheduleFlightTarget | null = useMemo(() => {
    if (!scheduling) return null
    const student = studentSchedules.find((s) => s.id === scheduling.studentId)
    const slot = student?.slots.find((s) => s.id === scheduling.slotId)
    return student && slot
      ? { studentId: student.id, studentName: student.name, slot }
      : null
  }, [scheduling, studentSchedules])

  async function handleConfirmBooking(input: ScheduleFlightConfirmInput) {
    try {
      await fetchApi('/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
        cache: 'no-store',
      })
    } catch (error) {
      setToast({ message: t('bookingError'), variant: 'error' })
      throw error
    }

    // The booking already succeeded at this point — a failed refresh isn't
    // a booking failure, so it doesn't get the error toast/retry treatment;
    // the panel just keeps showing pre-booking slots until the next reload.
    setScheduling(null)
    setToast({ message: t('bookingCreated'), variant: 'success' })
    try {
      const refreshed = await fetchApi<RawStudentSchedule[]>(
        '/students/schedule',
        { cache: 'no-store' },
      )
      setStudentSchedules(refreshed)
    } catch {
      // Ignored — see comment above.
    }
  }

  return (
    <>
      <InstructorSchedulePanel
        instructorName={instructorName}
        weekLabel={weekLabel}
        weekRangeLabel={weekRangeLabel}
        students={displayStudents}
        onPreviousWeek={() => setWeekOffset((value) => value - 1)}
        onNextWeek={() => setWeekOffset((value) => value + 1)}
        onSchedule={(studentId, slot) =>
          setScheduling({ studentId, slotId: slot.id })
        }
      />

      <ScheduleFlightModal
        key={
          schedulingTarget
            ? `${schedulingTarget.studentId}-${schedulingTarget.slot.id}`
            : 'none'
        }
        target={schedulingTarget}
        onClose={() => setScheduling(null)}
        onConfirm={handleConfirmBooking}
        instructorName={instructorName}
        currentInstructorId={currentInstructorId}
        instructors={instructors}
        aircraft={aircraft}
      />

      <Toast
        message={toast?.message ?? ''}
        open={toast !== null}
        onClose={() => setToast(null)}
        variant={toast?.variant ?? 'success'}
      />
    </>
  )
}

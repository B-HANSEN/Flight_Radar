'use client'

import { useMemo, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import {
  addWeeks,
  formatWeekRangeLabel,
  startOfWeek,
  toISODate,
} from '@/lib/weekGrid'
import InstructorSchedulePanel from './InstructorSchedulePanel'
import Toast from './Toast'
import type {
  InstructorScheduleSlot,
  InstructorScheduleStudent,
} from './InstructorSchedulePanel.types'
import type { RawStudentSchedule } from './InstructorScheduleView.types'

type Props = {
  instructorName?: string
  students?: RawStudentSchedule[]
  referenceDate?: Date
}

export default function InstructorScheduleView({
  instructorName,
  students = [],
  referenceDate,
}: Props) {
  const t = useTranslations('InstructorScheduleView')
  const locale = useLocale()
  const today = useMemo(() => referenceDate ?? new Date(), [referenceDate])
  const currentWeekStart = useMemo(() => startOfWeek(today), [today])
  const [weekOffset, setWeekOffset] = useState(0)
  const [isComingSoonToastOpen, setIsComingSoonToastOpen] = useState(false)

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

    return students.map((student) => {
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
  }, [locale, students, weekEnd, weekStart])

  return (
    <>
      <InstructorSchedulePanel
        instructorName={instructorName}
        weekLabel={weekLabel}
        weekRangeLabel={weekRangeLabel}
        students={displayStudents}
        onPreviousWeek={() => setWeekOffset((value) => value - 1)}
        onNextWeek={() => setWeekOffset((value) => value + 1)}
        onSchedule={() => setIsComingSoonToastOpen(true)}
      />
      <Toast
        variant='info'
        message={t('scheduleComingSoon')}
        open={isComingSoonToastOpen}
        onClose={() => setIsComingSoonToastOpen(false)}
      />
    </>
  )
}

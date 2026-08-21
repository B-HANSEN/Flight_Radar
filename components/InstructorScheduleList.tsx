'use client'

import { useId, useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from 'lucide-react'
import { focusRing } from '@/lib/styles'
import type {
  InstructorScheduleSlot,
  InstructorScheduleStudent,
} from './InstructorScheduleList.types'

type Props = {
  instructorName?: string
  weekLabel: string
  weekRangeLabel: string
  students?: InstructorScheduleStudent[]
  onPreviousWeek?: () => void
  onNextWeek?: () => void
  onSchedule?: (studentId: string, slot: InstructorScheduleSlot) => void
}

const AVATAR_COLORS = [
  'bg-blue-300',
  'bg-green-300',
  'bg-yellow-300',
  'bg-black-300',
]

function initialsOf(name: string) {
  return name
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function avatarColor(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) % AVATAR_COLORS.length
  }
  return AVATAR_COLORS[hash]
}

export default function InstructorScheduleList({
  instructorName,
  weekLabel,
  weekRangeLabel,
  students = [],
  onPreviousWeek,
  onNextWeek,
  onSchedule,
}: Props) {
  const t = useTranslations('InstructorScheduleList')
  const [openStudentIds, setOpenStudentIds] = useState<Set<string>>(new Set())
  const headingId = useId()

  function toggleStudent(id: string) {
    setOpenStudentIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <section
      aria-labelledby={headingId}
      className='rounded-xl border border-black-100 bg-white p-5'
    >
      <div className='mb-5 flex items-start justify-between gap-4'>
        <div>
          {instructorName && (
            <div className='mb-1.5 font-secondary text-xs font-semibold tracking-wide text-black-200 uppercase'>
              {t('instructorLabel', { name: instructorName })}
            </div>
          )}
          <h2
            id={headingId}
            className='font-primary text-xl font-bold text-black-300'
          >
            {t('title')}
          </h2>
        </div>

        <div className='flex flex-none items-center gap-2.5'>
          <button
            type='button'
            onClick={onPreviousWeek}
            aria-label={t('previousWeek')}
            className={`rounded-sm p-1 text-black-300 ${focusRing}`}
          >
            <ChevronLeft size={18} aria-hidden='true' />
          </button>
          <div className='text-right' aria-live='polite'>
            <div className='font-primary text-sm font-bold text-black-300'>
              {weekLabel}
            </div>
            <div className='font-secondary text-xs text-black-200'>
              {weekRangeLabel}
            </div>
          </div>
          <button
            type='button'
            onClick={onNextWeek}
            aria-label={t('nextWeek')}
            className={`rounded-sm p-1 text-black-300 ${focusRing}`}
          >
            <ChevronRight size={18} aria-hidden='true' />
          </button>
        </div>
      </div>

      {students.length === 0 ? (
        <p className='rounded-lg border border-dashed border-black-100 px-6 py-6 text-center font-secondary text-sm text-black-200'>
          {t('noStudents')}
        </p>
      ) : (
        <ul className='flex list-none flex-col gap-3'>
          {students.map((student) => {
            const isOpen = openStudentIds.has(student.id)
            const Chevron = isOpen ? ChevronUp : ChevronDown
            const panelId = `instructor-schedule-${student.id}-panel`

            return (
              <li
                key={student.id}
                className='overflow-hidden rounded-lg border border-black-100'
              >
                <button
                  type='button'
                  onClick={() => toggleStudent(student.id)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className={`flex w-full items-center justify-between gap-4 px-4.5 py-3.5 text-left ${focusRing}`}
                >
                  <span className='flex min-w-0 items-center gap-3'>
                    <span
                      className={`flex size-9 flex-none items-center justify-center rounded-full font-primary text-xs font-bold text-white ${avatarColor(student.id)}`}
                    >
                      {initialsOf(student.name)}
                    </span>
                    <span className='min-w-0'>
                      <span className='block truncate font-primary text-sm font-bold text-black-300'>
                        {student.name}
                      </span>
                      <span className='block truncate font-secondary text-xs text-black-200'>
                        {student.course}
                      </span>
                    </span>
                  </span>

                  <span className='flex flex-none items-center gap-2.5'>
                    <span className='rounded-full bg-green-100 px-2.5 py-1 font-primary text-xs font-bold text-green-300'>
                      {t('openSlots', { count: student.slots.length })}
                    </span>
                    <Chevron
                      size={16}
                      className='text-black-200'
                      aria-hidden='true'
                    />
                  </span>
                </button>

                <div
                  id={panelId}
                  hidden={!isOpen}
                  className='flex flex-col gap-2 border-t border-black-100 px-4.5 py-3.5'
                >
                  {student.slots.length === 0 ? (
                    <p className='font-secondary text-sm text-black-200'>
                      {t('noSlots')}
                    </p>
                  ) : (
                    student.slots.map((slot) => (
                      <div
                        key={slot.id}
                        className='flex items-center justify-between gap-3 rounded-lg border border-black-100 bg-black-100/10 px-3.5 py-2.5'
                      >
                        <span className='flex items-center gap-2.5'>
                          <Calendar
                            size={14}
                            className='flex-none text-black-200'
                            aria-hidden='true'
                          />
                          <span className='font-primary text-sm font-bold text-black-300'>
                            {slot.day}
                          </span>
                          <span className='font-secondary text-sm text-black-200'>
                            {slot.time}
                          </span>
                        </span>
                        <button
                          type='button'
                          onClick={() => onSchedule?.(student.id, slot)}
                          aria-label={t('scheduleLabel', {
                            name: student.name,
                            day: slot.day,
                            time: slot.time,
                          })}
                          className={`flex-none cursor-pointer rounded-lg bg-blue-300 px-3.5 py-1.5 font-primary text-xs font-bold text-white ${focusRing}`}
                        >
                          {t('scheduleButton')}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

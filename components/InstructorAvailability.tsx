'use client'

import { useRef, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Check, Info, Plus, Trash2, X } from 'lucide-react'
import { fetchApi } from '@/lib/api'
import { focusRing } from '@/lib/styles'
import {
  formatWeekRangeLabel,
  isoWeekNumber,
  startOfWeek,
  toISODate,
} from '@/lib/weekGrid'
import InstructorTimeOffFormModal from './InstructorTimeOffFormModal'
import Toast from './Toast'
import type {
  InstructorTimeOffEntry,
  InstructorTimeOffFormValues,
} from './InstructorAvailability.types'

type Props = {
  entries?: InstructorTimeOffEntry[]
  // The instructor these entries belong to — sent with a new request and
  // used to keep the CFI's own rows out of the review queue.
  instructorId: string
  isChief?: boolean
  // Every pending request in the school — only passed for the CFI, who
  // reviews the ones that aren't their own.
  reviewQueue?: InstructorTimeOffEntry[]
  // Instructor id -> display name, for the review list.
  instructorNames?: Record<string, string>
}

type WeekGroup = {
  key: string
  weekNumber: number
  rangeLabel: string
  entries: InstructorTimeOffEntry[]
}

const sectionHeadingClassName =
  'font-primary text-[11px] font-bold tracking-wide text-black-200 uppercase'
const cardClassName =
  'rounded-lg border border-black-200 px-3 py-2.5 flex flex-col gap-1'

function byDateAsc(a: InstructorTimeOffEntry, b: InstructorTimeOffEntry) {
  return a.date.localeCompare(b.date)
}

function statusPillClassName(status: InstructorTimeOffEntry['status']) {
  const tone =
    status === 'approved'
      ? 'bg-green-100 text-green-300'
      : status === 'denied'
        ? 'bg-red-100 text-red-300'
        : 'bg-yellow-100 text-black-300'
  return `flex-none rounded-full px-2 py-0.5 font-secondary text-[11px] font-semibold ${tone}`
}

// Buckets entries by ISO calendar week so it's obvious when two or more days
// off fall in the same week (the regular-day-off allowance is per week).
function groupByWeek(
  entries: InstructorTimeOffEntry[],
  locale: string,
): WeekGroup[] {
  const buckets = new Map<string, InstructorTimeOffEntry[]>()
  for (const entry of entries) {
    const weekStart = startOfWeek(new Date(`${entry.date}T00:00:00`))
    const key = toISODate(weekStart)
    const bucket = buckets.get(key)
    if (bucket) bucket.push(entry)
    else buckets.set(key, [entry])
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, weekEntries]) => {
      const weekStart = new Date(`${key}T00:00:00`)
      return {
        key,
        weekNumber: isoWeekNumber(weekStart),
        rangeLabel: formatWeekRangeLabel(weekStart, locale),
        entries: weekEntries.sort(byDateAsc),
      }
    })
}

export default function InstructorAvailability({
  entries: initialEntries = [],
  instructorId,
  isChief = false,
  reviewQueue: initialQueue = [],
  instructorNames = {},
}: Props) {
  const t = useTranslations('InstructorAvailability')
  const locale = useLocale()

  const [entries, setEntries] = useState<InstructorTimeOffEntry[]>(
    [...initialEntries].sort(byDateAsc),
  )
  const [queue, setQueue] = useState<InstructorTimeOffEntry[]>(
    initialQueue
      .filter(
        (entry) =>
          entry.status === 'pending' && entry.instructorId !== instructorId,
      )
      .sort(byDateAsc),
  )
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [toast, setToast] = useState<{
    message: string
    variant: 'success' | 'error'
  } | null>(null)
  const addButtonRef = useRef<HTMLButtonElement>(null)

  // Full date incl. weekday and year — used for the action labels, where the
  // week header isn't there to give context.
  function formatDate(iso: string): string {
    return new Intl.DateTimeFormat(locale, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(`${iso}T00:00:00`))
  }

  // Shorter form for a card that already sits under its week header.
  function formatDayInWeek(iso: string): string {
    return new Intl.DateTimeFormat(locale, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).format(new Date(`${iso}T00:00:00`))
  }

  async function handleRequest(values: InstructorTimeOffFormValues) {
    try {
      const created = await fetchApi<InstructorTimeOffEntry>(
        '/instructor-time-off',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            instructorId,
            date: values.date,
            type: values.type,
            ...(values.reason ? { reason: values.reason } : {}),
          }),
          cache: 'no-store',
        },
      )
      setEntries((current) => [...current, created].sort(byDateAsc))
      setIsModalOpen(false)
      setToast({
        message:
          created.status === 'pending'
            ? t('requestedPendingToast')
            : t('requestedApprovedToast'),
        variant: 'success',
      })
    } catch (error) {
      setToast({ message: t('errorToast'), variant: 'error' })
      throw error
    }
  }

  async function handleCancel(id: string) {
    try {
      await fetchApi(`/instructor-time-off/${id}`, {
        method: 'DELETE',
        cache: 'no-store',
      })
      setEntries((current) => current.filter((entry) => entry.id !== id))
      setToast({ message: t('cancelledToast'), variant: 'success' })
      addButtonRef.current?.focus()
    } catch {
      setToast({ message: t('errorToast'), variant: 'error' })
    }
  }

  async function handleReview(id: string, status: 'approved' | 'denied') {
    try {
      await fetchApi(`/instructor-time-off/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        cache: 'no-store',
      })
      setQueue((current) => current.filter((entry) => entry.id !== id))
      setToast({
        message: status === 'approved' ? t('approvedToast') : t('deniedToast'),
        variant: 'success',
      })
    } catch {
      setToast({ message: t('errorToast'), variant: 'error' })
    }
  }

  function weekHeader(group: WeekGroup, countLabel: string) {
    return (
      <div className='mb-2 flex items-baseline gap-2 border-b border-black-100 pb-1'>
        <span className='font-primary text-xs font-bold tracking-wide text-black-300 uppercase'>
          {t('weekLabel', { number: group.weekNumber })}
        </span>
        <span className='truncate font-secondary text-[11px] text-black-200'>
          {group.rangeLabel}
        </span>
        <span className='ml-auto flex-none rounded-full bg-black-100/70 px-2 py-0.5 font-secondary text-[11px] font-semibold text-black-300'>
          {countLabel}
        </span>
      </div>
    )
  }

  // Two calendar weeks side by side on wider viewports; within each week the
  // day cards stack, and only double up again when there's real room.
  const weekGridClassName = 'mt-2 grid gap-x-6 gap-y-4 md:grid-cols-2'
  const dayGridClassName = 'grid gap-2 2xl:grid-cols-2'

  const myWeeks = groupByWeek(entries, locale)
  const reviewWeeks = groupByWeek(queue, locale)

  return (
    <div className='flex flex-col gap-4'>
      <p className='flex items-start gap-2 rounded-lg bg-black-100/50 px-4 py-3 font-secondary text-xs text-black-300'>
        <Info
          size={15}
          className='mt-px flex-none text-black-200'
          aria-hidden='true'
        />
        {t('allowanceNote')}
      </p>

      <section className='rounded-xl border border-black-200 bg-white px-6 py-6'>
        <div className='flex items-center justify-between gap-3'>
          <h2 className={sectionHeadingClassName}>{t('myDaysOffHeading')}</h2>
          <button
            ref={addButtonRef}
            type='button'
            onClick={() => setIsModalOpen(true)}
            className={`flex flex-none items-center gap-1.5 rounded-lg bg-blue-200 px-3 py-1.5 font-primary text-xs font-bold text-white ${focusRing}`}
          >
            <Plus size={15} aria-hidden='true' />
            {t('requestLabel')}
          </button>
        </div>

        {entries.length === 0 ? (
          <p className='mt-3 rounded-lg border border-dashed border-black-100 px-6 py-6 text-center font-secondary text-sm text-black-200'>
            {t('noEntries')}
          </p>
        ) : (
          <div className={weekGridClassName}>
            {myWeeks.map((group) => (
              <div key={group.key} className='flex flex-col'>
                {weekHeader(
                  group,
                  t('weekDayCount', { count: group.entries.length }),
                )}
                <ul className={dayGridClassName}>
                  {group.entries.map((entry) => (
                    <li key={entry.id} className={cardClassName}>
                      <div className='flex items-center justify-between gap-2'>
                        <span className='font-secondary text-sm font-semibold text-black-300'>
                          {formatDayInWeek(entry.date)}
                        </span>
                        <span className={statusPillClassName(entry.status)}>
                          {t(`status.${entry.status}`)}
                        </span>
                      </div>
                      <div className='flex items-start justify-between gap-2'>
                        <span className='min-w-0 font-secondary text-xs text-black-200'>
                          {entry.type === 'personal'
                            ? t('typePersonal')
                            : t('typeRegular')}
                          {entry.reason && (
                            <span className='block text-black-200'>
                              {entry.reason}
                            </span>
                          )}
                        </span>
                        <button
                          type='button'
                          onClick={() => handleCancel(entry.id)}
                          aria-label={t('cancelLabel', {
                            date: formatDate(entry.date),
                          })}
                          className={`flex-none cursor-pointer rounded-sm p-1 text-black-200 hover:text-red-300 ${focusRing}`}
                        >
                          <Trash2 size={15} aria-hidden='true' />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      {isChief && queue.length > 0 && (
        <section className='rounded-xl border border-black-200 bg-white px-6 py-6'>
          <h2 className={sectionHeadingClassName}>{t('reviewHeading')}</h2>
          <div className={weekGridClassName}>
            {reviewWeeks.map((group) => (
              <div key={group.key} className='flex flex-col'>
                {weekHeader(
                  group,
                  t('weekRequestCount', { count: group.entries.length }),
                )}
                <ul className={dayGridClassName}>
                  {group.entries.map((entry) => {
                    const name =
                      instructorNames[entry.instructorId] ?? t('anInstructor')
                    return (
                      <li key={entry.id} className={cardClassName}>
                        <span className='font-secondary text-sm font-semibold text-black-300'>
                          {name}
                          <span className='font-normal text-black-200'>
                            {' · '}
                            {formatDayInWeek(entry.date)}
                          </span>
                        </span>
                        {entry.reason && (
                          <span className='font-secondary text-xs text-black-200'>
                            {entry.reason}
                          </span>
                        )}
                        <div className='mt-1 flex gap-2'>
                          <button
                            type='button'
                            onClick={() => handleReview(entry.id, 'approved')}
                            aria-label={t('approveLabel', {
                              name,
                              date: formatDate(entry.date),
                            })}
                            className={`flex items-center gap-1 rounded-lg bg-green-100 px-2.5 py-1 font-primary text-xs font-bold text-green-300 ${focusRing}`}
                          >
                            <Check size={14} aria-hidden='true' />
                            {t('approve')}
                          </button>
                          <button
                            type='button'
                            onClick={() => handleReview(entry.id, 'denied')}
                            aria-label={t('denyLabel', {
                              name,
                              date: formatDate(entry.date),
                            })}
                            className={`flex items-center gap-1 rounded-lg bg-black-100/60 px-2.5 py-1 font-primary text-xs font-bold text-black-300 ${focusRing}`}
                          >
                            <X size={14} aria-hidden='true' />
                            {t('deny')}
                          </button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      <InstructorTimeOffFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleRequest}
      />

      <Toast
        message={toast?.message ?? ''}
        open={toast !== null}
        onClose={() => setToast(null)}
        variant={toast?.variant ?? 'success'}
      />
    </div>
  )
}

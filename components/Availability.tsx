'use client'

import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { PenLine, Plus, Trash2 } from 'lucide-react'
import { fetchApi } from '@/lib/api'
import { focusRing } from '@/lib/styles'
import AvailabilityFormModal from './AvailabilityFormModal'
import Toast from './Toast'
import { WEEKDAY_ORDER } from './Availability.types'
import type {
  AvailabilityEntry,
  AvailabilityFormValues,
} from './Availability.types'

type Props = {
  entries?: AvailabilityEntry[]
  // The persona these entries belong to — sent with a newly created entry so
  // it lands on the right student. Omitted in Storybook / the demo persona.
  studentId?: string
}

const gridColumnsClassName =
  'grid grid-cols-[1.6fr_1.4fr_2fr_max-content] items-center gap-3'

function parseDMY(value: string): Date {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return new Date(0)
  const [, day, month, year] = match
  return new Date(Number(year), Number(month) - 1, Number(day))
}

function startDateOf(entry: AvailabilityEntry): Date {
  const raw = entry.dateMode === 'on' ? entry.onDate : entry.fromDate

  return raw ? parseDMY(raw) : new Date(0)
}

function sortByStartDate(entries: AvailabilityEntry[]): AvailabilityEntry[] {
  return [...entries].sort(
    (a, b) => startDateOf(b).getTime() - startDateOf(a).getTime(),
  )
}

function entryToFormValues(entry: AvailabilityEntry): AvailabilityFormValues {
  const date: AvailabilityFormValues['date'] =
    entry.dateMode === 'on'
      ? { mode: 'on', date: entry.onDate ?? '' }
      : {
          mode: 'range',
          from: entry.fromDate ?? '',
          to: entry.toDate ?? '',
        }

  const time: AvailabilityFormValues['time'] =
    entry.timeMode === 'allDay'
      ? { mode: 'allDay' }
      : {
          mode: 'between',
          start: entry.startTime ?? '',
          end: entry.endTime ?? '',
        }

  const recurrence: AvailabilityFormValues['recurrence'] =
    entry.recurrenceMode === 'days'
      ? { mode: 'days', days: entry.recurrenceDays ?? [] }
      : { mode: 'everyday' }

  return { date, time, recurrence }
}

function formValuesToApiFields(values: AvailabilityFormValues) {
  return {
    dateMode: values.date.mode,
    onDate: values.date.mode === 'on' ? values.date.date : undefined,
    fromDate: values.date.mode === 'range' ? values.date.from : undefined,
    toDate: values.date.mode === 'range' ? values.date.to : undefined,
    timeMode: values.time.mode,
    startTime: values.time.mode === 'between' ? values.time.start : undefined,
    endTime: values.time.mode === 'between' ? values.time.end : undefined,
    recurrenceMode: values.recurrence.mode,
    recurrenceDays:
      values.recurrence.mode === 'days' ? values.recurrence.days : undefined,
  }
}

export default function Availability({
  entries: initialEntries = [],
  studentId,
}: Props) {
  const t = useTranslations('Availability')
  const formT = useTranslations('AvailabilityFormModal')

  const [entries, setEntries] = useState<AvailabilityEntry[]>(initialEntries)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null)
  const [toast, setToast] = useState<{
    message: string
    variant: 'success' | 'error'
  } | null>(null)
  const addButtonRef = useRef<HTMLButtonElement>(null)

  const editingEntry =
    entries.find((entry) => entry.id === editingEntryId) ?? null
  const isFormOpen = isAddModalOpen || editingEntry !== null
  const weekdayNames = formT.raw('weekdayNames') as string[]

  function labelsFor(values: AvailabilityFormValues) {
    const dateLabel =
      values.date.mode === 'on'
        ? t('dateOn', { date: values.date.date })
        : t('dateRange', { from: values.date.from, to: values.date.to })

    const timeLabel =
      values.time.mode === 'allDay'
        ? t('timeAllDay')
        : t('timeBetween', {
            start: values.time.start,
            end: values.time.end,
          })

    const recurrenceLabel =
      values.recurrence.mode === 'everyday'
        ? t('recurrenceEveryday')
        : t('recurrenceDays', {
            days: values.recurrence.days
              .map((day) => weekdayNames[WEEKDAY_ORDER.indexOf(day)])
              .join(', '),
          })

    return { dateLabel, timeLabel, recurrenceLabel }
  }

  async function handleSave(values: AvailabilityFormValues) {
    const { dateLabel, timeLabel, recurrenceLabel } = labelsFor(values)
    const fields = formValuesToApiFields(values)

    try {
      if (editingEntry) {
        const updated = await fetchApi<AvailabilityEntry>(
          `/availability/${editingEntry.id}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              dateLabel,
              timeLabel,
              recurrence: recurrenceLabel,
              ...fields,
            }),
            cache: 'no-store',
          },
        )
        setEntries((current) =>
          current.map((entry) => (entry.id === updated.id ? updated : entry)),
        )
        setEditingEntryId(null)
        setToast({ message: t('updatedToast'), variant: 'success' })
        return
      }

      const created = await fetchApi<AvailabilityEntry>('/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateLabel,
          timeLabel,
          recurrence: recurrenceLabel,
          ...fields,
          ...(studentId ? { studentId } : {}),
        }),
        cache: 'no-store',
      })

      setEntries((current) => [created, ...current])
      setIsAddModalOpen(false)
      setToast({ message: t('createdToast'), variant: 'success' })
    } catch (error) {
      setToast({ message: t('errorToast'), variant: 'error' })
      throw error
    }
  }

  function handleCloseForm() {
    setIsAddModalOpen(false)
    setEditingEntryId(null)
  }

  async function handleDelete(id: string) {
    try {
      await fetchApi(`/availability/${id}`, {
        method: 'DELETE',
        cache: 'no-store',
      })
      setEntries((current) => current.filter((entry) => entry.id !== id))
      setToast({ message: t('deletedToast'), variant: 'success' })
      addButtonRef.current?.focus()
    } catch {
      setToast({ message: t('errorToast'), variant: 'error' })
    }
  }

  const sortedEntries = sortByStartDate(entries)

  return (
    <div className='relative rounded-xl border border-black-200 bg-white'>
      <div className='px-8 pt-8 pb-24'>
        {entries.length === 0 ? (
          <p className='rounded-lg border border-dashed border-black-100 px-6 py-6 text-center font-secondary text-sm text-black-200'>
            {t('noEntries')}
          </p>
        ) : (
          <div className='overflow-x-auto'>
            <div className='min-w-180'>
              <div
                className={`${gridColumnsClassName} border-b border-black-200 pb-3.5`}
              >
                <div className='font-primary text-[11px] font-bold tracking-wide text-black-200 uppercase'>
                  {t('datesHeading')}
                </div>
                <div className='font-primary text-[11px] font-bold tracking-wide text-black-200 uppercase'>
                  {t('timesHeading')}
                </div>
                <div className='font-primary text-[11px] font-bold tracking-wide text-black-200 uppercase'>
                  {t('recurrenceHeading')}
                </div>
                <div aria-hidden='true' />
              </div>

              {sortedEntries.map((entry) => (
                <div
                  key={entry.id}
                  className={`${gridColumnsClassName} border-b border-black-200 py-4`}
                >
                  <div className='font-secondary text-sm text-black-300'>
                    {entry.dateLabel}
                  </div>
                  <div className='font-secondary text-sm text-black-200'>
                    {entry.timeLabel}
                  </div>
                  <div className='font-secondary text-sm text-black-200'>
                    {entry.recurrence}
                  </div>
                  <div className='flex items-center gap-1'>
                    <button
                      type='button'
                      onClick={() => setEditingEntryId(entry.id)}
                      aria-label={t('editLabel', { date: entry.dateLabel })}
                      className={`flex-none cursor-pointer rounded-sm p-1 text-black-200 hover:text-blue-300 ${focusRing}`}
                    >
                      <PenLine size={16} aria-hidden='true' />
                    </button>
                    <button
                      type='button'
                      onClick={() => handleDelete(entry.id)}
                      aria-label={t('deleteLabel', { date: entry.dateLabel })}
                      className={`flex-none cursor-pointer rounded-sm p-1 text-black-200 hover:text-red-300 ${focusRing}`}
                    >
                      <Trash2 size={16} aria-hidden='true' />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        ref={addButtonRef}
        type='button'
        onClick={() => setIsAddModalOpen(true)}
        aria-label={t('addLabel')}
        className={`absolute right-8 bottom-8 flex size-13 cursor-pointer items-center justify-center rounded-full bg-blue-200 shadow-lg ${focusRing}`}
      >
        <Plus size={24} className='text-white' aria-hidden='true' />
      </button>

      <AvailabilityFormModal
        key={editingEntry?.id ?? 'add'}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSave={handleSave}
        initialValues={
          editingEntry ? entryToFormValues(editingEntry) : undefined
        }
        title={editingEntry ? formT('editTitle') : undefined}
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

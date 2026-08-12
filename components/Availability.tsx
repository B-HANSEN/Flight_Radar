'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Plus } from 'lucide-react'
import { focusRing } from '@/lib/styles'
import AvailabilityFormModal from './AvailabilityFormModal'
import type {
  AvailabilityEntry,
  AvailabilityFormValues,
} from './Availability.types'

type Props = {
  entries?: AvailabilityEntry[]
}

const gridColumnsClassName =
  'grid grid-cols-[1.6fr_1.4fr_2fr] items-center gap-3'

export default function Availability({ entries: initialEntries = [] }: Props) {
  const t = useTranslations('Availability')

  const [entries, setEntries] = useState<AvailabilityEntry[]>(initialEntries)
  const [isModalOpen, setIsModalOpen] = useState(false)

  function handleSave(values: AvailabilityFormValues) {
    const dateLabel =
      values.date.mode === 'all'
        ? t('dateAllTime')
        : values.date.mode === 'on'
          ? t('dateOn', { date: values.date.date })
          : t('dateRange', { from: values.date.from, to: values.date.to })

    const timeLabel =
      values.time.mode === 'allDay'
        ? t('timeAllDay')
        : t('timeBetween', {
            start: values.time.start,
            end: values.time.end,
          })

    const entry: AvailabilityEntry = {
      id: crypto.randomUUID(),
      dateLabel,
      timeLabel,
      recurrence: t('oneTime'),
    }

    setEntries((current) => [entry, ...current])
    setIsModalOpen(false)
  }

  return (
    <div className='relative rounded-xl border border-black-100 bg-white'>
      <div className='p-8'>
        {entries.length === 0 ? (
          <p className='rounded-lg border border-dashed border-black-100 px-6 py-6 text-center font-secondary text-sm text-black-200'>
            {t('noEntries')}
          </p>
        ) : (
          <div className='overflow-x-auto'>
            <div className='min-w-180'>
              <div
                className={`${gridColumnsClassName} border-b border-black-100 pb-3.5`}
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
              </div>

              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className={`${gridColumnsClassName} border-b border-black-100 py-4`}
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
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        type='button'
        onClick={() => setIsModalOpen(true)}
        aria-label={t('addLabel')}
        className={`absolute right-8 bottom-8 flex size-13 cursor-pointer items-center justify-center rounded-full bg-blue-200 shadow-lg ${focusRing}`}
      >
        <Plus size={24} className='text-white' aria-hidden='true' />
      </button>

      <AvailabilityFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  )
}

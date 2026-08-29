'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { addDays, startOfWeek, toISODate } from '@/lib/weekGrid'
import { focusRing } from '@/lib/styles'
import { useDragScroll } from '@/lib/useDragScroll'
import ScheduleBlockDetailModal from './ScheduleBlockDetailModal'
import Toast from './Toast'
import type {
  ScheduleAircraft,
  ScheduleBlock,
  ScheduleBlockDetail,
  ScheduleBlockRecord,
  ScheduleRow,
} from './ScheduleBoard.types'

type Props = {
  aircraft?: ScheduleAircraft[]
  dayBlocks?: ScheduleBlockRecord[]
  weekBlocks?: ScheduleBlockRecord[]
  initialDate?: Date
  onRefresh?: () => void
}

type ScheduleView = 'day' | 'week'

const DAY_START = 9
const DAY_END = 21
const HOUR_LABELS = Array.from(
  { length: DAY_END - DAY_START + 1 },
  (_, index) => `${String(DAY_START + index).padStart(2, '0')}:00`,
)
const FALLBACK_PHOTO_SRC = '/aircraft/aircraft-placeholder.webp'

const KIND_STYLES: Record<ScheduleBlock['kind'], string> = {
  reserved: 'bg-black-100 text-black-300',
  maintenance: 'bg-green-100 text-green-300',
  hold: 'bg-yellow-100 text-yellow-300',
  unavailable: 'bg-black-100/70 text-black-300',
}

function groupByAircraft(blocks: ScheduleBlockRecord[]): ScheduleRow[] {
  const rows: ScheduleRow[] = []
  const rowByAircraftId = new Map<string, ScheduleRow>()

  for (const record of blocks) {
    let row = rowByAircraftId.get(record.aircraftId)
    if (!row) {
      row = { aircraftId: record.aircraftId, blocks: [] }
      rowByAircraftId.set(record.aircraftId, row)
      rows.push(row)
    }
    row.blocks.push({
      id: record.id,
      label: record.label,
      kind: record.kind,
      start: record.start,
      end: record.end,
      studentName: record.studentName,
      instructorName: record.instructorName,
    })
  }

  return rows
}

function dayPct(hour: number) {
  return ((hour - DAY_START) / HOUR_LABELS.length) * 100
}

function weekPct(dayIndex: number) {
  return (dayIndex / 7) * 100
}

function blockStyle(block: ScheduleBlock, pct: (value: number) => number) {
  const left = pct(block.start)
  const width = pct(block.end) - pct(block.start)
  return { left: `${left}%`, width: `${width}%` }
}

function formatHour(hour: number): string {
  const totalMinutes = Math.round(hour * 60)
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function ScheduleGrid({
  aircraft,
  rows,
  labels,
  gridColsClassName,
  minWidthClassName,
  labelClassName,
  blockTextClassName,
  blockAlignClassName,
  pct,
  onBlockClick,
}: {
  aircraft: ScheduleAircraft[]
  rows: ScheduleRow[]
  labels: string[]
  gridColsClassName: string
  minWidthClassName: string
  labelClassName: string
  blockTextClassName: string
  blockAlignClassName: string
  pct: (value: number) => number
  onBlockClick: (aircraft: ScheduleAircraft, block: ScheduleBlock) => void
}) {
  return (
    <div className={minWidthClassName}>
      <div
        className={`grid h-9.5 border-b border-black-200 ${gridColsClassName}`}
      >
        {labels.map((label) => (
          <div key={label} className={labelClassName}>
            {label}
          </div>
        ))}
      </div>
      {aircraft.map((ac) => {
        const row = rows.find((r) => r.aircraftId === ac.id)
        return (
          <div
            key={ac.id}
            className={`relative grid h-18 border-b border-black-200 last:border-b-0 ${gridColsClassName}`}
          >
            {labels.map((label) => (
              <div key={label} className='border-l border-black-100/30' />
            ))}
            {(row?.blocks ?? []).map((block) => (
              <button
                key={block.id}
                type='button'
                onClick={() => onBlockClick(ac, block)}
                style={blockStyle(block, pct)}
                className={`absolute top-2.5 bottom-2.5 flex cursor-pointer items-center overflow-hidden rounded-lg px-1.5 font-secondary font-semibold transition hover:brightness-95 ${focusRing} ${blockTextClassName} ${blockAlignClassName} ${KIND_STYLES[block.kind]}`}
              >
                {block.label}
              </button>
            ))}
          </div>
        )
      })}
    </div>
  )
}

export default function ScheduleBoard({
  aircraft = [],
  dayBlocks = [],
  weekBlocks = [],
  initialDate,
  onRefresh,
}: Props) {
  const t = useTranslations('ScheduleBoard')
  const locale = useLocale()
  const [view, setView] = useState<ScheduleView>('day')
  const [referenceDate, setReferenceDate] = useState<Date>(
    () => initialDate ?? new Date(),
  )
  const { isDragging, dragHandlers } = useDragScroll<HTMLDivElement>()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedBlock, setSelectedBlock] =
    useState<ScheduleBlockDetail | null>(null)

  const weekStart = useMemo(() => startOfWeek(referenceDate), [referenceDate])
  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart])

  const activeDayIso = useMemo(() => toISODate(referenceDate), [referenceDate])
  const weekStartIso = useMemo(() => toISODate(weekStart), [weekStart])
  const weekEndIso = useMemo(() => toISODate(weekEnd), [weekEnd])

  // A block with no date is a recurring demo block (always shown); a dated
  // one is a real booking, only shown on the day/week it was booked for.
  const dayRows = useMemo(
    () =>
      groupByAircraft(
        dayBlocks.filter((block) => !block.date || block.date === activeDayIso),
      ),
    [dayBlocks, activeDayIso],
  )
  const weekRows = useMemo(
    () =>
      groupByAircraft(
        weekBlocks.filter(
          (block) =>
            !block.date ||
            (block.date >= weekStartIso && block.date <= weekEndIso),
        ),
      ),
    [weekBlocks, weekStartIso, weekEndIso],
  )

  const dayLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(referenceDate),
    [locale, referenceDate],
  )

  const weekLabel = useMemo(() => {
    const startMonth = new Intl.DateTimeFormat(locale, {
      month: 'short',
    }).format(weekStart)
    const endMonth = new Intl.DateTimeFormat(locale, {
      month: 'short',
    }).format(weekEnd)
    const startDay = String(weekStart.getDate()).padStart(2, '0')
    const endDay = String(weekEnd.getDate()).padStart(2, '0')
    const year = weekEnd.getFullYear()
    return startMonth === endMonth
      ? `${startDay} – ${endDay} ${endMonth} ${year}`
      : `${startDay} ${startMonth} – ${endDay} ${endMonth} ${year}`
  }, [locale, weekStart, weekEnd])

  const dayLabels = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const date = addDays(weekStart, index)
        const weekday = new Intl.DateTimeFormat(locale, {
          weekday: 'short',
        }).format(date)
        return `${weekday} ${String(date.getDate()).padStart(2, '0')}`
      }),
    [locale, weekStart],
  )

  function handleStep(delta: number) {
    setReferenceDate((current) =>
      addDays(current, view === 'day' ? delta : delta * 7),
    )
  }

  function handleRefresh() {
    setIsRefreshing(true)
    onRefresh?.()
  }

  function handleBlockClick(ac: ScheduleAircraft, block: ScheduleBlock) {
    const timeLabel =
      view === 'day'
        ? `${dayLabel} · ${formatHour(block.start)} – ${formatHour(block.end)}`
        : (() => {
            const dayIndex = Math.floor(block.start)
            const date = addDays(weekStart, dayIndex)
            const weekdayLabel = new Intl.DateTimeFormat(locale, {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            }).format(date)
            const startHour = (block.start - dayIndex) * 24
            const endHour = (block.end - dayIndex) * 24
            return `${weekdayLabel} · ${formatHour(startHour)} – ${formatHour(endHour)}`
          })()
    setSelectedBlock({ aircraft: ac, block, timeLabel })
  }

  return (
    <>
      <section
        aria-label={t('title')}
        className='overflow-hidden rounded-xl border border-black-200 bg-white'
      >
        <div className='flex flex-wrap items-center gap-4 border-b border-black-200 px-5 py-3.5'>
          <button
            type='button'
            onClick={() => handleStep(-1)}
            aria-label={t('previousRangeLabel')}
            className={`rounded-sm p-1 text-black-300 ${focusRing}`}
          >
            <ChevronLeft size={18} aria-hidden='true' />
          </button>
          <div
            aria-live='polite'
            className='min-w-42 font-primary text-sm font-bold whitespace-nowrap text-black-300'
          >
            {view === 'day' ? dayLabel : weekLabel}
          </div>
          <button
            type='button'
            onClick={() => handleStep(1)}
            aria-label={t('nextRangeLabel')}
            className={`rounded-sm p-1 text-black-300 ${focusRing}`}
          >
            <ChevronRight size={18} aria-hidden='true' />
          </button>

          <div className='ml-3 flex gap-1 rounded-lg bg-black-100/50 p-0.75'>
            <button
              type='button'
              onClick={() => setView('day')}
              aria-pressed={view === 'day'}
              className={`rounded-md px-3.5 py-1.5 font-primary text-sm font-semibold ${focusRing} ${view === 'day' ? 'bg-white text-blue-300' : 'text-black-300'}`}
            >
              {t('dayView')}
            </button>
            <button
              type='button'
              onClick={() => setView('week')}
              aria-pressed={view === 'week'}
              className={`rounded-md px-3.5 py-1.5 font-primary text-sm font-semibold ${focusRing} ${view === 'week' ? 'bg-white text-blue-300' : 'text-black-300'}`}
            >
              {t('weekView')}
            </button>
          </div>

          <button
            type='button'
            onClick={handleRefresh}
            aria-label={t('refreshLabel')}
            className={`ml-auto rounded-sm p-1 text-black-200 ${focusRing}`}
          >
            <RefreshCw size={16} aria-hidden='true' />
          </button>
        </div>

        {aircraft.length === 0 ? (
          <p className='px-5 py-12 text-center font-secondary text-sm text-black-200'>
            {t('noAircraft')}
          </p>
        ) : (
          <div className='grid grid-cols-[220px_1fr]'>
            <div className='border-r border-black-200'>
              <div className='flex h-9.5 items-center border-b border-black-200 px-4 font-primary text-xs font-bold tracking-wide text-black-200 uppercase'>
                {t('singleEngineGroup')}
              </div>
              {aircraft.map((ac) => (
                <div
                  key={ac.id}
                  className='flex h-18 items-center gap-2.5 border-b border-black-200 px-4 last:border-b-0'
                >
                  <div className='relative size-11 flex-none overflow-hidden rounded-lg bg-black-100/40'>
                    <Image
                      src={ac.photoSrc ?? FALLBACK_PHOTO_SRC}
                      alt={
                        ac.photoSrc
                          ? t('photoAlt', { type: ac.type, arcid: ac.arcid })
                          : ''
                      }
                      fill
                      sizes='44px'
                      className={
                        ac.photoSrc ? 'object-cover' : 'object-contain p-1.5'
                      }
                    />
                  </div>
                  <div>
                    <div className='font-primary text-sm font-bold text-black-300'>
                      {ac.arcid}
                    </div>
                    <div className='font-secondary text-[11px] text-black-200'>
                      {ac.type}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div
              role='group'
              aria-label={t('gridLabel')}
              tabIndex={0}
              className={`overflow-x-auto ${focusRing} ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
              {...dragHandlers}
            >
              {view === 'day' ? (
                <ScheduleGrid
                  aircraft={aircraft}
                  rows={dayRows}
                  labels={HOUR_LABELS}
                  gridColsClassName='grid-cols-[repeat(13,1fr)]'
                  minWidthClassName='min-w-225'
                  labelClassName='border-l border-black-100/60 pl-1 font-secondary text-[11px] font-semibold text-black-200'
                  blockTextClassName='text-xs'
                  blockAlignClassName='justify-center text-center'
                  pct={dayPct}
                  onBlockClick={handleBlockClick}
                />
              ) : (
                <ScheduleGrid
                  aircraft={aircraft}
                  rows={weekRows}
                  labels={dayLabels}
                  gridColsClassName='grid-cols-[repeat(7,1fr)]'
                  minWidthClassName='min-w-300'
                  labelClassName='border-l border-black-100/60 text-center font-primary text-xs font-bold text-black-200'
                  blockTextClassName='text-[11px]'
                  blockAlignClassName='justify-start text-left'
                  pct={weekPct}
                  onBlockClick={handleBlockClick}
                />
              )}
            </div>
          </div>
        )}
      </section>

      <Toast
        message={t('fetching')}
        open={isRefreshing}
        onClose={() => setIsRefreshing(false)}
      />

      <ScheduleBlockDetailModal
        detail={selectedBlock}
        onClose={() => setSelectedBlock(null)}
      />
    </>
  )
}

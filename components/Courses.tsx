'use client'

import { Fragment, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronDown, ChevronUp, TrendingDown, TrendingUp } from 'lucide-react'
import { focusRing } from '@/lib/styles'
import { useDragScroll } from '@/lib/useDragScroll'
import type {
  CourseHoursGroup,
  CourseHoursValues,
  CourseProgress,
} from './Courses.types'

type Props = {
  progress?: CourseProgress
}

const groupThClass =
  'border-r border-b border-black-200 bg-black-100/40 px-3 py-2 text-left font-primary text-[11px] font-bold tracking-wide text-black-300 uppercase last:border-r-0'
const leafThClass =
  'border-r border-b border-black-200 bg-black-100/40 px-3 py-1.5 text-left font-secondary text-[11px] font-semibold text-black-300 uppercase last:border-r-0'
const tdClass =
  'border-r border-b border-black-200 px-3 py-1.5 font-secondary text-sm whitespace-nowrap last:border-r-0'

const HOURS_COLUMNS: {
  key: keyof CourseHoursValues
  labelKey: string
}[] = [
  { key: 'vfrDual', labelKey: 'dual' },
  { key: 'vfrPic', labelKey: 'pic' },
  { key: 'vfrSpic', labelKey: 'spic' },
  { key: 'vfrPicus', labelKey: 'picus' },
  { key: 'vfrNight', labelKey: 'night' },
  { key: 'vfrXc', labelKey: 'xc' },
  { key: 'ifrDual', labelKey: 'dual' },
  { key: 'ifrPic', labelKey: 'pic' },
  { key: 'ifrSpic', labelKey: 'spic' },
  { key: 'ifrPicus', labelKey: 'picus' },
  { key: 'ifrNight', labelKey: 'night' },
  { key: 'ifrXc', labelKey: 'xc' },
  { key: 'mccPf', labelKey: 'pf' },
  { key: 'mccPm', labelKey: 'pm' },
  { key: 'acSe', labelKey: 'se' },
  { key: 'acMe', labelKey: 'me' },
  { key: 'acAb', labelKey: 'ab' },
  { key: 'acFstd', labelKey: 'fstd' },
]
const VFR_COLUMNS = HOURS_COLUMNS.slice(0, 6)
const IFR_COLUMNS = HOURS_COLUMNS.slice(6, 12)
const MCC_COLUMNS = HOURS_COLUMNS.slice(12, 14)
const AC_COLUMNS = HOURS_COLUMNS.slice(14, 18)

function ProgressBar({
  pct,
  barColor,
  label,
}: {
  pct: number
  barColor: string
  label: string
}) {
  return (
    <div
      role='progressbar'
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className='h-3.5 flex-1 overflow-hidden rounded-full border border-black-200 bg-black-100'
    >
      <div
        className={`h-full rounded-full ${barColor}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

function HoursTable({
  groups,
  vfrTotalHours,
  ifrTotalHours,
  mccTotalHours,
}: {
  groups: CourseHoursGroup[]
  vfrTotalHours: string
  ifrTotalHours: string
  mccTotalHours: string
}) {
  const t = useTranslations('Courses')
  const { isDragging, dragHandlers } = useDragScroll<HTMLDivElement>()

  return (
    <div
      role='group'
      aria-label={t('hoursTableCaption')}
      tabIndex={0}
      className={`mb-9 overflow-x-auto rounded-lg border border-black-200 ${focusRing} ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
      {...dragHandlers}
    >
      <table className='w-full min-w-275 border-collapse'>
        <caption className='sr-only'>{t('hoursTableCaption')}</caption>
        <thead>
          <tr>
            <th colSpan={2} className={`${groupThClass} bg-white`} />
            <th scope='colgroup' colSpan={6} className={groupThClass}>
              {t('vfr')} ({vfrTotalHours})
            </th>
            <th scope='colgroup' colSpan={6} className={groupThClass}>
              {t('ifr')} ({ifrTotalHours})
            </th>
            <th scope='colgroup' colSpan={2} className={groupThClass}>
              {t('mcc')} ({mccTotalHours})
            </th>
            <th scope='colgroup' colSpan={4} className={groupThClass}>
              {t('aircraftType')}
            </th>
          </tr>
          <tr>
            <th colSpan={2} className={`${leafThClass} bg-white`} />
            {[
              ...VFR_COLUMNS,
              ...IFR_COLUMNS,
              ...MCC_COLUMNS,
              ...AC_COLUMNS,
            ].map((col, index) => (
              <th
                key={`${col.key}-${index}`}
                scope='col'
                className={leafThClass}
              >
                {t(col.labelKey)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <Fragment key={group.key}>
              {group.rows.map((row, rowIndex) => (
                <tr key={`${group.key}-${row.key}`} className='bg-white'>
                  {rowIndex === 0 && (
                    <th
                      scope='rowgroup'
                      rowSpan={group.rows.length}
                      className={`${tdClass} bg-black-100/10 text-left align-top font-primary font-bold text-black-300`}
                    >
                      {t(`groups.${group.key}`)}
                    </th>
                  )}
                  <th
                    scope='row'
                    className={`${tdClass} font-secondary font-semibold text-black-200`}
                  >
                    <span className='inline-flex items-center gap-1'>
                      {row.tone === 'positive' && (
                        <TrendingUp
                          size={13}
                          className='text-green-300'
                          aria-hidden='true'
                        />
                      )}
                      {row.tone === 'negative' && (
                        <TrendingDown
                          size={13}
                          className='text-red-300'
                          aria-hidden='true'
                        />
                      )}
                      <span>{t(`rows.${row.key}`)}</span>
                      {row.tone && (
                        <span className='sr-only'>
                          {row.tone === 'positive'
                            ? t('aheadOfTarget')
                            : t('behindOfTarget')}
                        </span>
                      )}
                    </span>
                  </th>
                  {HOURS_COLUMNS.map((col) => {
                    const value = row.values[col.key]
                    const toneClass =
                      value && row.tone === 'positive'
                        ? 'font-bold text-green-300'
                        : value && row.tone === 'negative'
                          ? 'font-bold text-red-300'
                          : 'text-black-300'
                    return (
                      <td
                        key={`${group.key}-${row.key}-${col.key}`}
                        className={`${tdClass} ${toneClass}`}
                      >
                        {value ?? ''}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function Courses({ progress }: Props) {
  const t = useTranslations('Courses')
  const [openPhases, setOpenPhases] = useState<Set<number>>(new Set())

  function togglePhase(number: number) {
    setOpenPhases((current) => {
      const next = new Set(current)
      if (next.has(number)) next.delete(number)
      else next.add(number)
      return next
    })
  }

  if (!progress) return null

  return (
    <section
      aria-label={t('title')}
      className='rounded-xl border border-black-100 bg-white p-5'
    >
      <div className='mb-6 flex items-center gap-3.5'>
        <span className='flex-none font-primary text-sm font-bold text-black-300'>
          {t('overall')}
        </span>
        <ProgressBar
          pct={progress.overallPct}
          barColor='bg-blue-200'
          label={t('overall')}
        />
        <span className='flex-none font-secondary text-sm text-black-200'>
          {progress.overallActualHours} / {progress.overallTargetHours}
        </span>
        <span className='flex-none font-primary text-sm font-bold text-blue-300'>
          {progress.overallPct}%
        </span>
      </div>

      <HoursTable
        groups={progress.groups}
        vfrTotalHours={progress.vfrTotalHours}
        ifrTotalHours={progress.ifrTotalHours}
        mccTotalHours={progress.mccTotalHours}
      />

      <ul className='flex list-none flex-col gap-3.5'>
        {progress.phases.map((phase) => {
          const isOpen = openPhases.has(phase.number)
          const phaseBarColor =
            phase.pct === 100
              ? 'bg-green-200'
              : phase.pct === 0
                ? 'bg-black-100'
                : 'bg-blue-200'
          const phasePctColor =
            phase.pct === 100
              ? 'text-green-300'
              : phase.pct === 0
                ? 'text-black-200'
                : 'text-blue-300'
          const Chevron = isOpen ? ChevronUp : ChevronDown
          const panelId = `course-phase-${phase.number}-panel`

          return (
            <li
              key={phase.number}
              className='overflow-hidden rounded-lg border border-black-100'
            >
              <button
                type='button'
                onClick={() => togglePhase(phase.number)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className={`flex w-full items-center justify-between px-5 py-4 text-left ${focusRing}`}
              >
                <span className='font-primary text-base font-bold text-black-300'>
                  {t('phase', { number: phase.number })}
                </span>
                <Chevron
                  size={18}
                  className='flex-none text-black-200'
                  aria-hidden='true'
                />
              </button>

              <div className='flex items-center gap-3.5 px-5 pb-4.5'>
                <ProgressBar
                  pct={phase.pct}
                  barColor={phaseBarColor}
                  label={t('phase', { number: phase.number })}
                />
                <span className='flex-none font-secondary text-xs font-semibold text-black-200'>
                  {phase.actualHours} / {phase.targetHours}
                </span>
                <span
                  className={`min-w-9.5 flex-none text-right font-primary text-xs font-bold ${phasePctColor}`}
                >
                  {phase.pct}%
                </span>
              </div>

              <div
                id={panelId}
                hidden={!isOpen}
                className='border-t border-black-100 px-5 py-4 font-secondary text-sm text-black-200'
              >
                {phase.detail}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

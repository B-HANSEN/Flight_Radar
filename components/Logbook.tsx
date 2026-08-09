'use client'

import { useId, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronDown, ChevronRight, Download, RefreshCw } from 'lucide-react'
import { focusRing } from '@/lib/styles'
import { useDragScroll } from '@/lib/useDragScroll'
import type { LogbookEntry } from './Logbook.types'

type Props = {
  entries?: LogbookEntry[]
  pageSize?: number
  onDownload?: () => void
  onRefresh?: () => void
}

const groupThClass =
  'border-r border-b border-black-100 bg-black-100/40 px-3 py-2 text-left font-primary text-[11px] font-bold tracking-wide text-black-300 uppercase last:border-r-0'
const leafThClass =
  'border-r border-b border-black-100 bg-black-100/40 px-3 py-1.5 text-left font-secondary text-[11px] font-semibold text-black-300 uppercase last:border-r-0'
const tdClass =
  'border-r border-b border-black-100 px-3 py-2 font-secondary text-sm whitespace-nowrap text-black-300 last:border-r-0'

function parseHM(value?: string): number {
  if (!value) return 0
  const [hours, minutes] = value.split(':').map(Number)
  return hours * 60 + minutes
}

function formatHM(minutes: number): string {
  return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}`
}

function summarize(entries: LogbookEntry[]) {
  const totalMinutes = entries.reduce((sum, e) => sum + parseHM(e.total), 0)
  const seMinutes = entries.reduce((sum, e) => sum + parseHM(e.se), 0)
  const xcDualMinutes = entries.reduce((sum, e) => sum + parseHM(e.xcDual), 0)
  const nightMinutes = entries.reduce(
    (sum, e) => sum + (e.night ? parseHM(e.total) : 0),
    0,
  )
  const landingsDay = entries.reduce((sum, e) => sum + e.landingsDay, 0)
  const landingsNight = entries.reduce(
    (sum, e) => sum + (e.landingsNight ?? 0),
    0,
  )

  return {
    total: formatHM(totalMinutes),
    se: seMinutes ? formatHM(seMinutes) : '',
    xcDual: xcDualMinutes ? formatHM(xcDualMinutes) : '',
    night: nightMinutes ? formatHM(nightMinutes) : '',
    dual: formatHM(totalMinutes),
    landingsDay,
    landingsNight,
    landings: landingsDay + landingsNight,
  }
}

function EmDash() {
  return <span aria-hidden='true'>—</span>
}

function LogbookSummary({ entries }: { entries: LogbookEntry[] }) {
  const t = useTranslations('Logbook')
  const summary = useMemo(() => summarize(entries), [entries])
  const { isDragging, dragHandlers } = useDragScroll<HTMLDivElement>()

  return (
    <div
      role='group'
      aria-label={t('summaryCaption')}
      tabIndex={0}
      className={`mb-7 overflow-x-auto rounded-lg border border-black-100 ${focusRing} ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
      {...dragHandlers}
    >
      <table className='w-full border-collapse'>
        <caption className='sr-only'>{t('summaryCaption')}</caption>
        <thead>
          <tr>
            <th scope='col' rowSpan={2} className={groupThClass}>
              {t('totalFlightTime')}
            </th>
            <th scope='colgroup' colSpan={2} className={groupThClass}>
              {t('singlePilotTime')}
            </th>
            <th scope='colgroup' colSpan={2} className={groupThClass}>
              {t('crossCountry')}
            </th>
            <th scope='colgroup' colSpan={3} className={groupThClass}>
              {t('operationalCondition')}
            </th>
            <th scope='colgroup' colSpan={4} className={groupThClass}>
              {t('pilotFunction')}
            </th>
            <th scope='col' rowSpan={2} className={groupThClass}>
              {t('fstd')}
            </th>
            <th scope='colgroup' colSpan={2} className={groupThClass}>
              {t('landings')}
            </th>
          </tr>
          <tr>
            <th scope='col' className={leafThClass}>
              {t('se')}
            </th>
            <th scope='col' className={leafThClass}>
              {t('me')}
            </th>
            <th scope='col' className={leafThClass}>
              {t('pic')}
            </th>
            <th scope='col' className={leafThClass}>
              {t('dual')}
            </th>
            <th scope='col' className={leafThClass}>
              {t('night')}
            </th>
            <th scope='col' className={leafThClass}>
              {t('ift')}
            </th>
            <th scope='col' className={leafThClass}>
              {t('ifr')}
            </th>
            <th scope='col' className={leafThClass}>
              {t('pic')}
            </th>
            <th scope='col' className={leafThClass}>
              {t('spic')}
            </th>
            <th scope='col' className={leafThClass}>
              {t('dual')}
            </th>
            <th scope='col' className={leafThClass}>
              {t('instructor')}
            </th>
            <th scope='col' className={leafThClass}>
              {t('day')}
            </th>
            <th scope='col' className={leafThClass}>
              {t('night')}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className={`${tdClass} font-bold`}>{summary.total}</td>
            <td className={`${tdClass} ${summary.se ? 'font-bold' : ''}`}>
              {summary.se || <EmDash />}
            </td>
            <td className={tdClass}>
              <EmDash />
            </td>
            <td className={tdClass}>
              <EmDash />
            </td>
            <td className={`${tdClass} ${summary.xcDual ? 'font-bold' : ''}`}>
              {summary.xcDual || <EmDash />}
            </td>
            <td className={`${tdClass} ${summary.night ? 'font-bold' : ''}`}>
              {summary.night || <EmDash />}
            </td>
            <td className={tdClass}>
              <EmDash />
            </td>
            <td className={tdClass}>
              <EmDash />
            </td>
            <td className={tdClass}>
              <EmDash />
            </td>
            <td className={tdClass}>
              <EmDash />
            </td>
            <td className={`${tdClass} font-bold`}>{summary.dual}</td>
            <td className={tdClass}>
              <EmDash />
            </td>
            <td className={tdClass}>
              <EmDash />
            </td>
            <td className={`${tdClass} font-bold`}>{summary.landingsDay}</td>
            <td className={tdClass}>{summary.landingsNight}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function LogbookPage({
  pageNumber,
  entries,
  open,
  onToggle,
}: {
  pageNumber: number
  entries: LogbookEntry[]
  open: boolean
  onToggle: () => void
}) {
  const t = useTranslations('Logbook')
  const panelId = useId()
  const summary = useMemo(() => summarize(entries), [entries])
  const Chevron = open ? ChevronDown : ChevronRight
  const { isDragging, dragHandlers } = useDragScroll<HTMLDivElement>()

  return (
    <div className='mb-4 overflow-hidden rounded-lg border border-black-100'>
      <button
        type='button'
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className={`flex w-full items-center gap-2.5 bg-black-100/40 px-4 py-3 text-left ${focusRing}`}
      >
        <Chevron
          size={16}
          className='flex-none text-black-200'
          aria-hidden='true'
        />
        <span className='font-primary text-sm font-bold text-black-300'>
          {t('page', { number: pageNumber })}
        </span>
        <span className='font-secondary text-sm text-black-300'>
          &middot; {t('flightCount', { count: entries.length })}
        </span>
      </button>

      <div id={panelId} hidden={!open}>
        <div
          role='group'
          aria-label={t('pageCaption', { number: pageNumber })}
          tabIndex={0}
          className={`overflow-x-auto ${focusRing} ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
          {...dragHandlers}
        >
          <table className='w-full min-w-350 border-collapse'>
            <caption className='sr-only'>
              {t('pageCaption', { number: pageNumber })}
            </caption>
            <thead>
              <tr>
                <th scope='col' rowSpan={2} className={groupThClass}>
                  {t('date')}
                </th>
                <th scope='colgroup' colSpan={2} className={groupThClass}>
                  {t('departure')}
                </th>
                <th scope='colgroup' colSpan={2} className={groupThClass}>
                  {t('arrival')}
                </th>
                <th scope='colgroup' colSpan={2} className={groupThClass}>
                  {t('aircraft')}
                </th>
                <th scope='colgroup' colSpan={2} className={groupThClass}>
                  {t('singlePilotTime')}
                </th>
                <th scope='colgroup' colSpan={2} className={groupThClass}>
                  {t('crossCountry')}
                </th>
                <th scope='col' rowSpan={2} className={groupThClass}>
                  {t('totalFlightTime')}
                </th>
                <th scope='col' rowSpan={2} className={groupThClass}>
                  {t('namePic')}
                </th>
                <th scope='colgroup' colSpan={2} className={groupThClass}>
                  {t('landings')}
                </th>
                <th scope='col' rowSpan={2} className={groupThClass}>
                  {t('remarks')}
                </th>
              </tr>
              <tr>
                <th scope='col' className={leafThClass}>
                  {t('place')}
                </th>
                <th scope='col' className={leafThClass}>
                  {t('time')}
                </th>
                <th scope='col' className={leafThClass}>
                  {t('place')}
                </th>
                <th scope='col' className={leafThClass}>
                  {t('time')}
                </th>
                <th scope='col' className={leafThClass}>
                  {t('makeModel')}
                </th>
                <th scope='col' className={leafThClass}>
                  {t('registration')}
                </th>
                <th scope='col' className={leafThClass}>
                  {t('se')}
                </th>
                <th scope='col' className={leafThClass}>
                  {t('me')}
                </th>
                <th scope='col' className={leafThClass}>
                  {t('pic')}
                </th>
                <th scope='col' className={leafThClass}>
                  {t('dual')}
                </th>
                <th scope='col' className={leafThClass}>
                  {t('day')}
                </th>
                <th scope='col' className={leafThClass}>
                  {t('night')}
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <tr
                  key={entry.id}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-black-100/10'}
                >
                  <td className={tdClass}>{entry.date}</td>
                  <td className={tdClass}>{entry.depPlace}</td>
                  <td className={tdClass}>{entry.depTime}</td>
                  <td className={tdClass}>{entry.arrPlace}</td>
                  <td className={tdClass}>{entry.arrTime}</td>
                  <td className={tdClass}>{entry.model}</td>
                  <td className={`${tdClass} font-bold`}>{entry.reg}</td>
                  <td className={tdClass}>{entry.se || <EmDash />}</td>
                  <td className={tdClass}>
                    <EmDash />
                  </td>
                  <td className={tdClass}>
                    <EmDash />
                  </td>
                  <td className={tdClass}>{entry.xcDual || <EmDash />}</td>
                  <td className={`${tdClass} font-bold`}>{entry.total}</td>
                  <td className={`${tdClass} font-semibold text-blue-300`}>
                    {entry.pic}
                  </td>
                  <td className={tdClass}>{entry.landingsDay}</td>
                  <td className={tdClass}>
                    {entry.landingsNight || <EmDash />}
                  </td>
                  <td className={`${tdClass} whitespace-normal text-black-200`}>
                    {entry.remarks || <EmDash />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className='flex flex-wrap items-center gap-6 border-t border-black-100 bg-black-100/10 px-4 py-3'>
          <span className='font-primary text-[11px] font-bold tracking-wide text-black-200 uppercase'>
            {t('blockTotal')}
          </span>
          <span className='font-secondary text-sm text-black-200'>
            {t('flightTime')}{' '}
            <b className='font-bold text-black-300'>{summary.total}</b>
          </span>
          {summary.se && (
            <span className='font-secondary text-sm text-black-200'>
              {t('se')} <b className='font-bold text-black-300'>{summary.se}</b>
            </span>
          )}
          {summary.xcDual && (
            <span className='font-secondary text-sm text-black-200'>
              {t('dual')}{' '}
              <b className='font-bold text-black-300'>{summary.xcDual}</b>
            </span>
          )}
          <span className='font-secondary text-sm text-black-200'>
            {t('landings')}{' '}
            <b className='font-bold text-black-300'>{summary.landings}</b>
          </span>
        </div>
      </div>
    </div>
  )
}

export default function Logbook({
  entries = [],
  pageSize = 10,
  onDownload,
  onRefresh,
}: Props) {
  const t = useTranslations('Logbook')
  const [reverseOrder, setReverseOrder] = useState(false)
  const [closedPages, setClosedPages] = useState<Set<number>>(new Set())

  const orderedEntries = useMemo(
    () => (reverseOrder ? [...entries].reverse() : entries),
    [entries, reverseOrder],
  )

  const pages = useMemo(() => {
    const chunkSize = Math.max(1, pageSize)
    const chunks: LogbookEntry[][] = []
    for (let i = 0; i < orderedEntries.length; i += chunkSize) {
      chunks.push(orderedEntries.slice(i, i + chunkSize))
    }
    return chunks
  }, [orderedEntries, pageSize])

  function togglePage(pageNumber: number) {
    setClosedPages((current) => {
      const next = new Set(current)
      if (next.has(pageNumber)) next.delete(pageNumber)
      else next.add(pageNumber)
      return next
    })
  }

  return (
    <section
      aria-label={t('title')}
      className='rounded-xl border border-black-100 bg-white p-5'
    >
      <div className='mb-6 flex flex-wrap items-center gap-5'>
        <button
          type='button'
          onClick={onDownload}
          className={`flex items-center gap-1.5 rounded-lg border border-black-100 px-3.5 py-2 font-secondary text-sm font-semibold text-black-300 ${focusRing}`}
        >
          <Download size={15} aria-hidden='true' />
          {t('download')}
        </button>
        <button
          type='button'
          onClick={onRefresh}
          className={`flex items-center gap-1.5 rounded-lg border border-black-100 px-3.5 py-2 font-secondary text-sm font-semibold text-black-300 ${focusRing}`}
        >
          <RefreshCw size={15} aria-hidden='true' />
          {t('refresh')}
        </button>
        <label className='flex items-center gap-2 font-secondary text-sm text-black-300'>
          <input
            type='checkbox'
            checked={reverseOrder}
            onChange={(event) => setReverseOrder(event.target.checked)}
            className='size-3.5 accent-blue-300'
          />
          {t('reverseOrder')}
        </label>
      </div>

      <LogbookSummary entries={entries} />

      {pages.length === 0 ? (
        <p className='rounded-lg border border-dashed border-black-100 px-6 py-6 text-center font-secondary text-sm text-black-200'>
          {t('noFlights')}
        </p>
      ) : (
        pages.map((pageEntries, index) => {
          const pageNumber = index + 1
          return (
            <LogbookPage
              key={pageNumber}
              pageNumber={pageNumber}
              entries={pageEntries}
              open={!closedPages.has(pageNumber)}
              onToggle={() => togglePage(pageNumber)}
            />
          )
        })
      )}
    </section>
  )
}

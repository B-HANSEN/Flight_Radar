'use client'

import { useState } from 'react'
import {
  Clock,
  ExternalLink,
  GraduationCap,
  PenLine,
  Plane,
  User,
} from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { AIRFIELD_NAMES } from '@/lib/airfields'
import { fetchApi } from '@/lib/api'
import { NEWS_TAG_STYLES } from '@/lib/newsTags'
import { focusRing } from '@/lib/styles'
import { useDragScroll } from '@/lib/useDragScroll'
import FlightEvaluationModal from './FlightEvaluationModal'
import type { Booking, NewsItem, WeatherReport } from './Homepage.types'
import type { FlightEvaluation } from './Signatures.types'

type Props = {
  name: string
  weather?: WeatherReport[]
  bookings?: Booking[]
  signatures?: FlightEvaluation[]
  // Instructor view: the signatures card shows an "under development" note
  // instead of a sign-off list.
  signaturesUnderDevelopment?: boolean
  news?: NewsItem[]
}

const AVIATION_WEATHER_SOURCE_URL = 'https://aviationweather.gov'
const AVIATION_WEATHER_SOURCE_LABEL = 'aviationweather.gov'
const MADRID_TIME_ZONE = 'Europe/Madrid'

function formatMadridTime(observedAt: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: MADRID_TIME_ZONE,
  }).format(new Date(observedAt))
}

// Stations observe independently, so this picks the oldest report — the
// most conservative reading of "how fresh is this weather" for the group.
function oldestObservedAt(stations: WeatherReport[]) {
  return stations.reduce(
    (oldest, station) =>
      station.observedAt < oldest ? station.observedAt : oldest,
    stations[0].observedAt,
  )
}

function WeatherBriefing({ stations }: { stations: WeatherReport[] }) {
  const t = useTranslations('Homepage')
  const locale = useLocale()
  const { isDragging, dragHandlers } = useDragScroll<HTMLDivElement>()

  return (
    <section>
      {stations.length === 0 ? (
        <p className='rounded-xl border border-dashed border-black-100 px-5 py-6 text-center font-secondary text-sm text-black-200'>
          {t('weather.empty')}
        </p>
      ) : (
        <div className='overflow-hidden rounded-xl border border-black-200 bg-white'>
          <div
            role='table'
            aria-label={t('weather.label')}
            tabIndex={0}
            className={`grid grid-cols-[max-content_max-content_1fr] items-baseline gap-x-2 overflow-x-auto px-5.5 py-4.5 ${focusRing} ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
            {...dragHandlers}
          >
            {stations.map((station, index) => (
              <div key={station.code} role='row' className='contents'>
                <span
                  role='cell'
                  className={`font-secondary text-sm font-semibold whitespace-nowrap text-black-200 ${index > 0 ? 'mt-2' : ''}`}
                >
                  {AIRFIELD_NAMES[station.code] ?? ''}
                </span>
                <span
                  role='cell'
                  className={`font-mono text-sm font-bold whitespace-nowrap text-black-300 ${index > 0 ? 'mt-2' : ''}`}
                >
                  {station.code}
                </span>
                <span
                  role='cell'
                  className={`font-mono text-sm font-semibold whitespace-nowrap text-black-300 ${index > 0 ? 'mt-2' : ''}`}
                >
                  {station.metar}
                </span>
                <span aria-hidden='true' />
                <span aria-hidden='true' />
                <span
                  role='cell'
                  className='wrap-break-word font-mono text-sm text-black-200'
                >
                  {station.taf}
                </span>
              </div>
            ))}
          </div>
          <div className='flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-black-100 bg-black-100/40 px-5.5 py-3'>
            <span className='flex items-center gap-1.5 font-secondary text-xs text-black-300'>
              <Clock size={13} aria-hidden='true' />
              {t('weather.updated', {
                date: formatMadridTime(oldestObservedAt(stations), locale),
              })}
            </span>
            <a
              href={AVIATION_WEATHER_SOURCE_URL}
              target='_blank'
              rel='noopener noreferrer'
              className={`flex items-center gap-1 rounded-sm font-secondary text-xs font-semibold text-blue-300 hover:underline ${focusRing}`}
            >
              {t('weather.source')} {AVIATION_WEATHER_SOURCE_LABEL}
              <ExternalLink size={11} aria-hidden='true' />
            </a>
          </div>
        </div>
      )}
    </section>
  )
}

function BookingsCard({ bookings }: { bookings: Booking[] }) {
  const t = useTranslations('Homepage')
  const { isDragging, dragHandlers } = useDragScroll<HTMLDivElement>('y')

  return (
    <section
      aria-labelledby='homepage-bookings-heading'
      className='overflow-hidden rounded-xl border border-black-200 bg-white'
    >
      <h2
        id='homepage-bookings-heading'
        className='border-b border-black-200 px-5 py-4 font-primary text-base font-bold text-black-300'
      >
        {t('bookings.title')}
      </h2>
      {bookings.length === 0 ? (
        <p className='px-5 py-6 text-center font-secondary text-sm text-black-200'>
          {t('bookings.empty')}
        </p>
      ) : (
        <div
          role='group'
          aria-labelledby='homepage-bookings-heading'
          tabIndex={0}
          className={`max-h-44.25 overflow-y-auto ${focusRing} ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
          {...dragHandlers}
        >
          <ul className='flex list-none flex-col'>
            {bookings.map((booking) => (
              <li
                key={booking.id}
                className='flex flex-col gap-1.5 border-b border-black-200 px-5 py-4 last:border-b-0 even:bg-black-100/50'
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <span
                      aria-hidden='true'
                      className='size-2 flex-none rounded-full bg-yellow-200'
                    />
                    <span className='font-primary text-sm font-bold text-black-300'>
                      {booking.type}
                    </span>
                  </div>
                  <span className='font-secondary text-xs font-semibold text-black-200'>
                    {booking.date}
                  </span>
                </div>
                <div className='flex items-center gap-4 pl-4'>
                  <span className='flex items-center gap-1.5 font-secondary text-xs text-blue-300'>
                    {booking.type === 'Theory' ? (
                      <>
                        <GraduationCap
                          size={14}
                          className='text-black-200'
                          aria-hidden='true'
                        />
                        {booking.comments}
                      </>
                    ) : (
                      <>
                        <Plane
                          size={14}
                          className='text-black-200'
                          aria-hidden='true'
                        />
                        {booking.tail}
                      </>
                    )}
                  </span>
                  <span className='flex items-center gap-1.5 font-secondary text-xs text-blue-300'>
                    <User
                      size={14}
                      className='text-black-200'
                      aria-hidden='true'
                    />
                    {booking.person}
                  </span>
                  <span className='ml-auto font-secondary text-xs font-semibold text-black-300'>
                    {booking.time}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

function SignaturesCard({
  signatures,
  underDevelopment = false,
  onSelect,
}: {
  signatures: FlightEvaluation[]
  underDevelopment?: boolean
  onSelect: (flight: FlightEvaluation) => void
}) {
  const t = useTranslations('Homepage')
  const { isDragging, dragHandlers } = useDragScroll<HTMLDivElement>('y')

  return (
    <section
      aria-labelledby='homepage-signatures-heading'
      className='overflow-hidden rounded-xl border border-black-200 bg-white'
    >
      <h2
        id='homepage-signatures-heading'
        className='border-b border-black-200 px-5 py-4 font-primary text-base font-bold text-black-300'
      >
        {t('signatures.title')}
      </h2>
      {underDevelopment ? (
        // Instructors don't sign off evaluations — the report-authoring
        // flow that belongs here isn't built yet.
        <p className='px-5 py-6 text-center font-secondary text-sm text-black-200'>
          {t('signatures.underDevelopment')}
        </p>
      ) : signatures.length === 0 ? (
        <p className='px-5 py-6 text-center font-secondary text-sm text-black-200'>
          {t('signatures.empty')}
        </p>
      ) : (
        <div
          role='group'
          aria-labelledby='homepage-signatures-heading'
          tabIndex={0}
          className={`max-h-44.25 overflow-y-auto ${focusRing} ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
          {...dragHandlers}
        >
          <ul className='flex list-none flex-col'>
            {signatures.map((signature) => {
              const label = t('signatures.flightLabel', {
                id: signature.sessionId,
              })
              return (
                <li
                  key={signature.id}
                  className='flex items-center justify-between gap-4 border-b border-black-200 px-5 py-3.5 last:border-b-0 even:bg-black-100/50'
                >
                  <div className='flex items-center gap-4'>
                    <span className='font-secondary text-xs font-semibold text-black-200'>
                      {signature.date}
                    </span>
                    <span className='font-secondary text-sm text-black-300'>
                      {label}
                    </span>
                  </div>
                  <button
                    type='button'
                    onClick={() => onSelect(signature)}
                    aria-label={t('signatures.signLabel', { label })}
                    className={`flex-none cursor-pointer rounded-sm p-1 text-black-200 ${focusRing}`}
                  >
                    <PenLine size={16} aria-hidden='true' />
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </section>
  )
}

function NewsGrid({ news }: { news: NewsItem[] }) {
  const t = useTranslations('Homepage')

  return (
    <section aria-labelledby='homepage-news-heading'>
      <div className='mb-4 flex items-baseline justify-between'>
        <h2
          id='homepage-news-heading'
          className='font-primary text-xl font-bold text-black-300'
        >
          {t('news.title')}
        </h2>
        <Link
          href='/news'
          className={`rounded-sm font-secondary text-xs font-semibold text-blue-300 hover:underline ${focusRing}`}
        >
          {t('news.viewAll')}
        </Link>
      </div>
      <ul className='grid list-none grid-cols-1 gap-5 md:grid-cols-3'>
        {news.map((item) => {
          const style = NEWS_TAG_STYLES[item.tag]
          return (
            <li
              key={item.id}
              className='flex flex-col overflow-hidden rounded-xl border border-black-100 bg-white'
            >
              <span aria-hidden='true' className={`h-1 ${style.accent}`} />
              <div className='flex flex-1 flex-col gap-2.5 p-5'>
                <div className='flex items-center justify-between'>
                  <span
                    className={`font-primary text-[11px] font-bold tracking-wide uppercase ${style.text}`}
                  >
                    {t(`news.tags.${item.tag}`)}
                  </span>
                  <span className='font-secondary text-xs text-black-200'>
                    {item.date}
                  </span>
                </div>
                <p className='font-primary text-base font-bold text-black-300'>
                  {item.title}
                </p>
                <p className='flex-1 font-secondary text-sm text-black-200'>
                  {item.summary}
                </p>
                <Link
                  href={`/news#${item.id}`}
                  aria-label={t('news.readMoreLabel', { title: item.title })}
                  className={`mt-1 rounded-sm font-secondary text-xs font-semibold text-blue-300 hover:underline ${focusRing}`}
                >
                  {t('news.readMore')}
                </Link>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default function Homepage({
  name,
  weather = [],
  bookings = [],
  signatures: initialSignatures = [],
  signaturesUnderDevelopment = false,
  news = [],
}: Props) {
  const t = useTranslations('Homepage')
  const [signatures, setSignatures] = useState(initialSignatures)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selectedFlight =
    signatures.find((flight) => flight.id === selectedId) ?? null

  async function handleSign(flight: FlightEvaluation) {
    await fetchApi(`/flight-evaluations/${flight.id}/sign`, {
      method: 'PATCH',
      cache: 'no-store',
    })
    setSignatures((current) => current.filter((item) => item.id !== flight.id))
    setSelectedId(null)
  }

  return (
    <div className='flex flex-col gap-6 py-9'>
      <h1 className='font-primary text-2xl font-bold tracking-[-0.01em] text-black-300'>
        {t('greeting', { name })}
      </h1>
      <WeatherBriefing stations={weather} />
      <div className='grid grid-cols-1 gap-5 lg:grid-cols-2'>
        <BookingsCard bookings={bookings} />
        <SignaturesCard
          signatures={signatures}
          underDevelopment={signaturesUnderDevelopment}
          onSelect={(flight) => setSelectedId(flight.id)}
        />
      </div>
      <NewsGrid news={news} />

      <FlightEvaluationModal
        flight={selectedFlight}
        onClose={() => setSelectedId(null)}
        onSign={handleSign}
      />
    </div>
  )
}

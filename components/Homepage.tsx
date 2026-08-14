'use client'

import { useState } from 'react'
import { PenLine, Plane, User } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { fetchApi } from '@/lib/api'
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
  news?: NewsItem[]
}

const NEWS_TAG_STYLES: Record<
  NewsItem['tag'],
  { accent: string; text: string }
> = {
  operations: { accent: 'bg-blue-200', text: 'text-blue-300' },
  fuel: { accent: 'bg-green-200', text: 'text-green-300' },
  atc: { accent: 'bg-yellow-200', text: 'text-yellow-300' },
}

function WeatherBriefing({ stations }: { stations: WeatherReport[] }) {
  const t = useTranslations('Homepage')
  const { isDragging, dragHandlers } = useDragScroll<HTMLDivElement>()

  return (
    <section>
      {stations.length === 0 ? (
        <p className='rounded-xl border border-dashed border-black-100 px-5 py-6 text-center font-secondary text-sm text-black-200'>
          {t('weather.empty')}
        </p>
      ) : (
        <div
          role='group'
          aria-label={t('weather.label')}
          tabIndex={0}
          className={`overflow-x-auto rounded-xl border border-black-100 bg-white px-5.5 py-4.5 ${focusRing} ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
          {...dragHandlers}
        >
          <ul className='flex list-none flex-col gap-2'>
            {stations.map((station) => (
              <li key={station.code} className='whitespace-nowrap'>
                <p className='font-mono text-sm font-semibold text-black-300'>
                  <span className='font-bold'>{station.code}</span>{' '}
                  {station.metar}
                </p>
                <p className='pl-11 font-mono text-sm text-black-200'>
                  {station.taf}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

function BookingsCard({ bookings }: { bookings: Booking[] }) {
  const t = useTranslations('Homepage')

  return (
    <section
      aria-labelledby='homepage-bookings-heading'
      className='overflow-hidden rounded-xl border border-black-100 bg-white'
    >
      <h2
        id='homepage-bookings-heading'
        className='border-b border-black-100 px-5 py-4 font-primary text-base font-bold text-black-300'
      >
        {t('bookings.title')}
      </h2>
      {bookings.length === 0 ? (
        <p className='px-5 py-6 text-center font-secondary text-sm text-black-200'>
          {t('bookings.empty')}
        </p>
      ) : (
        <ul className='flex list-none flex-col'>
          {bookings.map((booking) => (
            <li
              key={booking.id}
              className='flex flex-col gap-1.5 border-b border-black-100 px-5 py-4 last:border-b-0'
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
                  <Plane
                    size={14}
                    className='text-black-200'
                    aria-hidden='true'
                  />
                  {booking.tail}
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
      )}
    </section>
  )
}

function SignaturesCard({
  signatures,
  onSelect,
}: {
  signatures: FlightEvaluation[]
  onSelect: (flight: FlightEvaluation) => void
}) {
  const t = useTranslations('Homepage')

  return (
    <section
      aria-labelledby='homepage-signatures-heading'
      className='overflow-hidden rounded-xl border border-black-100 bg-white'
    >
      <h2
        id='homepage-signatures-heading'
        className='border-b border-black-100 px-5 py-4 font-primary text-base font-bold text-black-300'
      >
        {t('signatures.title')}
      </h2>
      {signatures.length === 0 ? (
        <p className='px-5 py-6 text-center font-secondary text-sm text-black-200'>
          {t('signatures.empty')}
        </p>
      ) : (
        <ul className='flex list-none flex-col'>
          {signatures.map((signature) => {
            const label = t('signatures.flightLabel', {
              id: signature.sessionId,
            })
            return (
              <li
                key={signature.id}
                className='flex items-center justify-between gap-4 border-b border-black-100 px-5 py-3.5 last:border-b-0'
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
                  href='/news'
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

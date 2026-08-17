import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import Homepage from '@/components/Homepage'
import JsonLd from '@/components/JsonLd'
import type {
  Booking,
  NewsItem,
  WeatherReport,
} from '@/components/Homepage.types'
import type { FlightEvaluation } from '@/components/Signatures.types'
import { fetchApi } from '@/lib/api'
import { buildPageMetadata } from '@/lib/metadata'
import { buildWebPageSchema } from '@/lib/structuredData'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Homepage.meta' })

  return buildPageMetadata({
    locale,
    href: '/',
    title: t('title'),
    description: t('description'),
    isHomeSegment: true,
  })
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'Homepage.meta' })

  const [weather, bookings, flightEvaluations, news] = await Promise.all([
    fetchApi<WeatherReport[]>('/weather'),
    fetchApi<Booking[]>('/bookings'),
    fetchApi<FlightEvaluation[]>('/flight-evaluations'),
    fetchApi<NewsItem[]>('/news'),
  ])
  const signatures = flightEvaluations.filter((flight) => !flight.signed)

  return (
    <div className='ml-[calc(50%-50vw)] w-screen px-8 sm:px-12'>
      <JsonLd
        data={buildWebPageSchema({
          locale,
          href: '/',
          title: t('title'),
          description: t('description'),
        })}
      />
      <div className='mx-auto max-w-350'>
        <Homepage
          name='John Doe'
          weather={weather}
          bookings={bookings}
          signatures={signatures}
          news={news}
        />
      </div>
    </div>
  )
}

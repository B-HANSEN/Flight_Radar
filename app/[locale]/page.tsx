import { setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import Homepage from '@/components/Homepage'
import type {
  Booking,
  MissingSignature,
  NewsItem,
  WeatherReport,
} from '@/components/Homepage.types'
import { fetchApi } from '@/lib/api'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const [weather, bookings, signatures, news] = await Promise.all([
    fetchApi<WeatherReport[]>('/weather'),
    fetchApi<Booking[]>('/bookings'),
    fetchApi<MissingSignature[]>('/missing-signatures'),
    fetchApi<NewsItem[]>('/news'),
  ])

  return (
    <div className='ml-[calc(50%-50vw)] w-screen px-8 sm:px-12'>
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

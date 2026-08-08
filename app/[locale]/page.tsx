import { setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import Homepage from '@/components/Homepage'
import {
  DUMMY_BOOKINGS,
  DUMMY_NEWS,
  DUMMY_SIGNATURES,
  DUMMY_WEATHER,
} from '@/components/Homepage.data'

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

  return (
    <div className='ml-[calc(50%-50vw)] w-screen px-8 sm:px-12'>
      <div className='mx-auto max-w-350'>
        <Homepage
          name='John Doe'
          weather={DUMMY_WEATHER}
          bookings={DUMMY_BOOKINGS}
          signatures={DUMMY_SIGNATURES}
          news={DUMMY_NEWS}
        />
      </div>
    </div>
  )
}

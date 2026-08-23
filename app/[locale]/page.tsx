import type { Metadata } from 'next'
import { cookies } from 'next/headers'
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
import type { Instructor, Student } from '@/components/RoleSwitcher.types'
import { fetchApi } from '@/lib/api'
import { buildPageMetadata } from '@/lib/metadata'
import { buildWebPageSchema } from '@/lib/structuredData'
import {
  CURRENT_ROLE_COOKIE,
  instructorIdFromRoleValue,
  isInstructorRoleValue,
} from '@/lib/currentRole'

const LATEST_NEWS_COUNT = 3

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

  const roleCookie = (await cookies()).get(CURRENT_ROLE_COOKIE)?.value
  const isInstructorView = isInstructorRoleValue(roleCookie)

  const [weather, bookings, flightEvaluations, news, name] = await Promise.all([
    fetchApi<WeatherReport[]>('/weather'),
    fetchApi<Booking[]>('/bookings'),
    fetchApi<FlightEvaluation[]>('/flight-evaluations'),
    fetchApi<NewsItem[]>('/news'),
    isInstructorView
      ? fetchApi<Instructor[]>('/instructors').then((instructors) => {
          const instructorId = instructorIdFromRoleValue(roleCookie)
          return (
            instructors.find((i) => i.id === instructorId) ?? instructors[0]
          ).name
        })
      : fetchApi<Student[]>('/students').then((students) => {
          // No cookie yet defaults to the site's default demo persona,
          // matching NavBar's own fallback.
          return (
            students.find((s) => s.id === roleCookie) ??
            students.find((s) => s.name === 'Jamie Torres') ??
            students[0]
          ).name
        }),
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
          name={name}
          weather={weather}
          bookings={bookings}
          signatures={signatures}
          news={news.slice(0, LATEST_NEWS_COUNT)}
        />
      </div>
    </div>
  )
}

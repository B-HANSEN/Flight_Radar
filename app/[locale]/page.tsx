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
const SCHOOL_TIME_ZONE = 'Europe/Madrid'

// Bookings carry a DD/MM/YYYY display date; turn it into a YYYY-MM-DD
// string so day comparisons are plain lexicographic.
function toIsoDay(displayDate: string): string {
  const [day, month, year] = displayDate.split('/')
  return `${year}-${month}-${day}`
}

// Today in the school's timezone, as YYYY-MM-DD, so a lesson later today
// still counts as upcoming. 'en-CA' isn't a user-facing locale here — it's
// just the shortest way to get ISO-style output, since Canada's default
// date format happens to be YYYY-MM-DD.
function schoolToday(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: SCHOOL_TIME_ZONE,
  }).format(new Date())
}

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

  // Resolve the current persona first — their id scopes the bookings card
  // below to just their own (a student's lessons, or the lessons assigned
  // to an instructor).
  const persona: { name: string; studentId?: string; instructorId?: string } =
    isInstructorView
      ? await fetchApi<Instructor[]>('/instructors').then((instructors) => {
          const instructorId = instructorIdFromRoleValue(roleCookie)
          const instructor =
            instructors.find((i) => i.id === instructorId) ?? instructors[0]
          return { name: instructor.name, instructorId: instructor.id }
        })
      : await fetchApi<Student[]>('/students').then((students) => {
          // No cookie yet defaults to the site's default demo persona,
          // matching NavBar's own fallback.
          const student =
            students.find((s) => s.id === roleCookie) ??
            students.find((s) => s.name === 'Jamie Torres') ??
            students[0]
          return { name: student.name, studentId: student.id }
        })

  const bookingsScope = persona.studentId
    ? `?studentId=${persona.studentId}`
    : persona.instructorId
      ? `?instructorId=${persona.instructorId}`
      : ''
  // Signatures stay student-scoped only — an evaluation has no assigned
  // instructor, so an instructor still sees the whole pending list.
  const signaturesScope = persona.studentId
    ? `?studentId=${persona.studentId}`
    : ''

  const [weather, bookings, flightEvaluations, news] = await Promise.all([
    fetchApi<WeatherReport[]>('/weather'),
    fetchApi<Booking[]>(`/bookings${bookingsScope}`),
    fetchApi<FlightEvaluation[]>(`/flight-evaluations${signaturesScope}`),
    fetchApi<NewsItem[]>('/news'),
  ])

  const signatures = flightEvaluations.filter((flight) => !flight.signed)
  const today = schoolToday()
  const upcomingBookings = bookings
    .filter((booking) => toIsoDay(booking.date) >= today)
    .sort((a, b) => toIsoDay(a.date).localeCompare(toIsoDay(b.date)))

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
          name={persona.name}
          weather={weather}
          bookings={upcomingBookings}
          signatures={signatures}
          news={news.slice(0, LATEST_NEWS_COUNT)}
        />
      </div>
    </div>
  )
}

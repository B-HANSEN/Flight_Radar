import { cookies } from 'next/headers'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import {
  CURRENT_ROLE_COOKIE,
  instructorIdFromRoleValue,
  isInstructorRoleValue,
} from '@/lib/currentRole'
import AgendaCalendar from '@/components/AgendaCalendar'
import type { CalendarEvent } from '@/components/AgendaCalendar.types'
import type { Instructor, Student } from '@/components/RoleSwitcher.types'
import { fetchApi } from '@/lib/api'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function AgendaPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('AgendaPage')

  // Scope the agenda to whoever is currently being previewed — a student
  // sees their own bookings + derived unavailability, an instructor sees
  // every booking assigned to them across all their students.
  const roleCookie = (await cookies()).get(CURRENT_ROLE_COOKIE)?.value
  const isInstructorView = isInstructorRoleValue(roleCookie)

  const scope = isInstructorView
    ? await fetchApi<Instructor[]>('/instructors').then((instructors) => {
        const instructorId = instructorIdFromRoleValue(roleCookie)
        const instructor =
          instructors.find((i) => i.id === instructorId) ?? instructors[0]
        return `?instructorId=${instructor.id}`
      })
    : await fetchApi<Student[]>('/students').then((students) => {
        const student =
          students.find((s) => s.id === roleCookie) ??
          students.find((s) => s.name === 'Jamie Torres') ??
          students[0]
        return `?studentId=${student.id}`
      })

  const events = await fetchApi<CalendarEvent[]>(`/agenda${scope}`)
  // When this data was pulled — the fetch above is no-store, so a Refresh
  // (router.refresh()) re-runs this component and this updates.
  const updatedAt = new Date().toISOString()

  return (
    <>
      <h1 className='sr-only'>{t('title')}</h1>
      <AgendaCalendar
        events={events}
        updatedAt={updatedAt}
        perspective={isInstructorView ? 'instructor' : 'student'}
      />
    </>
  )
}

import { cookies } from 'next/headers'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { redirect } from '@/i18n/navigation'
import { CURRENT_ROLE_COOKIE, isInstructorRoleValue } from '@/lib/currentRole'
import Availability from '@/components/Availability'
import type { AvailabilityEntry } from '@/components/Availability.types'
import type { Student } from '@/components/RoleSwitcher.types'
import { fetchApi } from '@/lib/api'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function AvailabilityPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  // Instructor availability is assumed for now (no instructor-side
  // availability model yet) — an instructor has nothing to manage here.
  const roleCookie = (await cookies()).get(CURRENT_ROLE_COOKIE)?.value
  if (isInstructorRoleValue(roleCookie)) {
    redirect({ href: '/me/agenda', locale })
  }

  const t = await getTranslations('AvailabilityPage')

  // Same persona resolution as the rest of /me — the cookie value is the
  // student's own id, falling back to the default demo persona.
  const students = await fetchApi<Student[]>('/students')
  const student =
    students.find((s) => s.id === roleCookie) ??
    students.find((s) => s.name === 'Jamie Torres') ??
    students[0]

  const entries = await fetchApi<AvailabilityEntry[]>(
    `/availability?studentId=${student.id}`,
  )

  return (
    <>
      <h1 className='sr-only'>{t('title')}</h1>
      <Availability entries={entries} studentId={student.id} />
    </>
  )
}

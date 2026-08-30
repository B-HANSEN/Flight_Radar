import { cookies } from 'next/headers'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import Signatures from '@/components/Signatures'
import type { FlightEvaluation } from '@/components/Signatures.types'
import type { Student } from '@/components/RoleSwitcher.types'
import { fetchApi } from '@/lib/api'
import { CURRENT_ROLE_COOKIE, isInstructorRoleValue } from '@/lib/currentRole'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function SignaturesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('SignaturesPage')

  const roleCookie = (await cookies()).get(CURRENT_ROLE_COOKIE)?.value

  // Instructors author the evaluation, students sign it off — the
  // report-authoring flow that would live here isn't built yet.
  if (isInstructorRoleValue(roleCookie)) {
    return (
      <>
        <h1 className='sr-only'>{t('title')}</h1>
        <p className='rounded-xl border border-dashed border-black-100 px-6 py-12 text-center font-secondary text-sm text-black-200'>
          {t('underDevelopment')}
        </p>
      </>
    )
  }

  const students = await fetchApi<Student[]>('/students')
  // No cookie yet defaults to the site's default demo persona, matching
  // NavBar's own fallback.
  const student =
    students.find((s) => s.id === roleCookie) ??
    students.find((s) => s.name === 'Jamie Torres') ??
    students[0]
  const flights = await fetchApi<FlightEvaluation[]>(
    `/flight-evaluations?studentId=${student.id}`,
  )

  return (
    <>
      <h1 className='sr-only'>{t('title')}</h1>
      {/* Remount on persona switch — Signatures copies flights into local
          state on mount, so without this it keeps the previous student's
          list after a RoleSwitcher refresh. */}
      <Signatures key={student.id} flights={flights} />
    </>
  )
}

import { cookies } from 'next/headers'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import Logbook from '@/components/Logbook'
import type { LogbookEntry } from '@/components/Logbook.types'
import type { Student } from '@/components/RoleSwitcher.types'
import { fetchApi } from '@/lib/api'
import { CURRENT_ROLE_COOKIE, isInstructorRoleValue } from '@/lib/currentRole'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LogbookPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('LogbookPage')

  const roleCookie = (await cookies()).get(CURRENT_ROLE_COOKIE)?.value

  // The logbook is a student's own flight record; an instructor's personal
  // logbook view isn't built yet (same stance as /me/signatures).
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
  const entries = await fetchApi<LogbookEntry[]>(
    `/logbook?studentId=${student.id}`,
  )

  return (
    <>
      <h1 className='sr-only'>{t('title')}</h1>
      {/* Remount on persona switch so the per-page collapse state and
          sort-order toggle reset — otherwise page 2's "collapsed" would
          carry over to a different student's page 2 after a refresh. */}
      <Logbook key={student.id} entries={entries} />
    </>
  )
}

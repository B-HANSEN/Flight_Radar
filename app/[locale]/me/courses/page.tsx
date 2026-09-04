import { cookies } from 'next/headers'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import Courses from '@/components/Courses'
import type { CourseProgress } from '@/components/Courses.types'
import type { Student } from '@/components/RoleSwitcher.types'
import { fetchApi } from '@/lib/api'
import { CURRENT_ROLE_COOKIE, isInstructorRoleValue } from '@/lib/currentRole'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function CoursesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('CoursesPage')

  const roleCookie = (await cookies()).get(CURRENT_ROLE_COOKIE)?.value

  // Course progress tracks a student through their training course; an
  // instructor has none (same stance as /me/signatures and /me/logbook).
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
  const progress = await fetchApi<CourseProgress>(
    `/courses?studentId=${student.id}`,
  )

  return (
    <>
      <h1 className='sr-only'>{t('title')}</h1>
      <Courses key={student.id} progress={progress} />
    </>
  )
}

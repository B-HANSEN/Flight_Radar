import { cookies } from 'next/headers'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import CertificateList from '@/components/CertificateList'
import type { Certificate } from '@/components/CertificateList.types'
import { fetchApi } from '@/lib/api'
import {
  CURRENT_ROLE_COOKIE,
  instructorIdFromRoleValue,
  isInstructorRoleValue,
} from '@/lib/currentRole'
import type { Instructor, Student } from '@/components/RoleSwitcher.types'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function CertificatesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('CertificatesPage')

  const roleCookie = (await cookies()).get(CURRENT_ROLE_COOKIE)?.value
  let personId: string

  if (isInstructorRoleValue(roleCookie)) {
    const instructors = await fetchApi<Instructor[]>('/instructors')
    const instructorId = instructorIdFromRoleValue(roleCookie)
    const instructor =
      instructors.find((i) => i.id === instructorId) ?? instructors[0]
    personId = instructor.id
  } else {
    const students = await fetchApi<Student[]>('/students')
    // No cookie yet defaults to the site's default demo persona, matching
    // NavBar's own fallback.
    const student =
      students.find((s) => s.id === roleCookie) ??
      students.find((s) => s.name === 'Jamie Torres') ??
      students[0]
    personId = student.id
  }

  const certificates = await fetchApi<Certificate[]>(
    `/certificates?personId=${personId}`,
  )

  return (
    <>
      <h1 className='sr-only'>{t('title')}</h1>
      <CertificateList certificates={certificates} />
    </>
  )
}

import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import {
  CURRENT_ROLE_COOKIE,
  instructorIdFromRoleValue,
  isInstructorRoleValue,
} from '@/lib/currentRole'
import ProfileCardContainer from '@/components/ProfileCardContainer'
import TabBar from '@/components/TabBar'
import { fetchApi } from '@/lib/api'
import type { EmergencyContact } from '@/components/ProfileCard'
import type { Instructor, Student } from '@/components/RoleSwitcher.types'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

// Every /me route is a signed-in student's private data — keep it out of
// search results regardless of what each nested page's own metadata says.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function MeLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('MePage.profileCard')

  const roleCookie = (await cookies()).get(CURRENT_ROLE_COOKIE)?.value
  const isInstructorView = isInstructorRoleValue(roleCookie)

  let profile: {
    personId: string
    name: string
    avatarSrc?: string
    email: string
    phone: string
    birthday: string
    info: string
    role: string
  }

  if (isInstructorView) {
    const instructors = await fetchApi<Instructor[]>('/instructors')
    const instructorId = instructorIdFromRoleValue(roleCookie)
    const instructor =
      instructors.find((i) => i.id === instructorId) ?? instructors[0]

    profile = {
      personId: instructor.id,
      name: instructor.name,
      avatarSrc: instructor.photoSrc,
      email: instructor.email,
      phone: instructor.phone,
      birthday: instructor.birthday,
      info: instructor.info,
      role: t('instructorRoleValue'),
    }
  } else {
    const students = await fetchApi<Student[]>('/students')
    // No cookie yet defaults to the site's default demo persona, matching
    // NavBar's own fallback.
    const student =
      students.find((s) => s.id === roleCookie) ??
      students.find((s) => s.name === 'Jamie Torres') ??
      students[0]

    profile = {
      personId: student.id,
      name: student.name,
      avatarSrc: student.photoSrc,
      email: student.email,
      phone: student.phone,
      birthday: student.birthday,
      info: student.info,
      role: t('studentRoleValue'),
    }
  }

  const emergencyContact = await fetchApi<EmergencyContact>(
    `/emergency-contact?personId=${profile.personId}`,
  )

  return (
    <div className='ml-[calc(50%-50vw)] w-screen px-8 sm:px-12 2xl:px-20'>
      <div className='flex flex-col gap-6 lg:flex-row lg:items-start 2xl:mx-auto 2xl:max-w-[1800px]'>
        <div className='lg:min-w-0 lg:flex-1'>
          <TabBar />
          <div className='mt-6'>{children}</div>
        </div>
        <div className='lg:w-122 lg:flex-none 2xl:w-lg'>
          {/* key forces a remount when the previewed person changes —
              emergencyContact is copied into local state on mount, so
              without this it'd keep showing the previous person's contact
              until a hard reload even though the server refetched it. */}
          <ProfileCardContainer
            key={profile.personId}
            {...profile}
            emergencyContact={emergencyContact}
          />
        </div>
      </div>
    </div>
  )
}

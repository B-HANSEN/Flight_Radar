import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { CURRENT_ROLE_COOKIE, isInstructorRoleValue } from '@/lib/currentRole'
import ProfileCardContainer from '@/components/ProfileCardContainer'
import TabBar from '@/components/TabBar'
import { fetchApi } from '@/lib/api'
import type { EmergencyContact } from '@/components/ProfileCard'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

// Every /me route is a signed-in student's private data — keep it out of
// search results regardless of what each nested page's own metadata says.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

const PLACEHOLDER_PROFILE = {
  name: 'Torres, Jamie',
  avatarSrc: '/me/jamie-torres.webp',
  email: 'jamie.torres@example.com',
  phone: '+34 600 123 456',
  birthday: '14 March 1994',
  info: 'PPL online · Q1 2025',
  role: 'Student',
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
  const emergencyContact =
    await fetchApi<EmergencyContact>('/emergency-contact')
  const roleCookie = (await cookies()).get(CURRENT_ROLE_COOKIE)?.value
  const isInstructorView = isInstructorRoleValue(roleCookie)

  return (
    <div className='ml-[calc(50%-50vw)] w-screen px-8 sm:px-12 2xl:px-20'>
      <div className='flex flex-col gap-6 lg:flex-row lg:items-start 2xl:mx-auto 2xl:max-w-[1800px]'>
        <div className='lg:min-w-0 lg:flex-1'>
          <TabBar hideAvailability={isInstructorView} />
          <div className='mt-6'>{children}</div>
        </div>
        <div className='lg:w-122 lg:flex-none 2xl:w-lg'>
          <ProfileCardContainer
            {...PLACEHOLDER_PROFILE}
            emergencyContact={emergencyContact}
          />
        </div>
      </div>
    </div>
  )
}

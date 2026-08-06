import { setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import ProfileCard from '@/components/ProfileCard'
import TabBar from '@/components/TabBar'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

const PLACEHOLDER_PROFILE = {
  name: 'Doe, John',
  avatarSrc: '/me/john-doe.webp',
  email: 'john.doe@example.com',
  phone: '+34 600 123 456',
  birthday: '14 March 1994',
  info: 'PPL online · Q1 2025',
  role: 'Student',
  emergencyContact: {
    name: 'Jane Doe',
    relation: 'Sister',
    phone: '+34 600 987 654',
  },
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

  return (
    <div className='ml-[calc(50%-50vw)] w-screen px-8 sm:px-12 2xl:px-20'>
      <div className='flex flex-col gap-6 lg:flex-row lg:items-start 2xl:mx-auto 2xl:max-w-[1800px]'>
        <div className='lg:min-w-0 lg:flex-1'>
          <TabBar />
          <div className='mt-6'>{children}</div>
        </div>
        <div className='lg:w-lg lg:flex-none'>
          <ProfileCard {...PLACEHOLDER_PROFILE} />
        </div>
      </div>
    </div>
  )
}

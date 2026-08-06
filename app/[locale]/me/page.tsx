import { setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import ProfileCard from '@/components/ProfileCard'

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

export default async function MePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <div className='ml-[calc(50%-50vw)] w-screen pl-8 sm:pl-12'>
      <ProfileCard {...PLACEHOLDER_PROFILE} />
    </div>
  )
}

import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import Availability from '@/components/Availability'
import { DUMMY_AVAILABILITY_ENTRIES } from '@/components/Availability.data'

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
  const t = await getTranslations('AvailabilityPage')

  return (
    <>
      <h1 className='sr-only'>{t('title')}</h1>
      <Availability entries={DUMMY_AVAILABILITY_ENTRIES} />
    </>
  )
}

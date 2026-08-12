import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import PageHeading from '@/components/PageHeading'
import AircraftDirectory from '@/components/AircraftDirectory'
import type { Aircraft } from '@/components/AircraftDirectory.types'
import { fetchApi } from '@/lib/api'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function AircraftPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('AircraftPage')
  const aircraft = await fetchApi<Aircraft[]>('/aircraft', {
    next: { revalidate: 3600 },
  })

  return (
    <div className='ml-[calc(50%-50vw)] w-screen px-8 sm:px-12'>
      <div className='mx-auto max-w-300'>
        <PageHeading title={t('title')} />
        <AircraftDirectory aircraft={aircraft} />
      </div>
    </div>
  )
}

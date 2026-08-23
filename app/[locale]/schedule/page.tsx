import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import PageHeading from '@/components/PageHeading'
import JsonLd from '@/components/JsonLd'
import ScheduleBoard from '@/components/ScheduleBoard'
import { buildPageMetadata } from '@/lib/metadata'
import { buildWebPageSchema } from '@/lib/structuredData'
import type {
  ScheduleAircraft,
  ScheduleBlockRecord,
} from '@/components/ScheduleBoard.types'
import { fetchApi } from '@/lib/api'

type ScheduleBlockApiRecord = ScheduleBlockRecord & { period: 'day' | 'week' }

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'SchedulePage' })

  return buildPageMetadata({
    locale,
    href: '/schedule',
    title: t('title'),
    description: t('meta.description'),
  })
}

export default async function SchedulePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('SchedulePage')

  const [allAircraft, blocks] = await Promise.all([
    fetchApi<ScheduleAircraft[]>('/aircraft'),
    fetchApi<ScheduleBlockApiRecord[]>('/schedule'),
  ])

  const scheduledAircraftIds = new Set(blocks.map((block) => block.aircraftId))
  const aircraft = allAircraft.filter((a) => scheduledAircraftIds.has(a.id))

  return (
    <div className='ml-[calc(50%-50vw)] w-screen px-8 sm:px-12'>
      <JsonLd
        data={buildWebPageSchema({
          locale,
          href: '/schedule',
          title: t('title'),
          description: t('meta.description'),
        })}
      />
      <div className='mx-auto max-w-300'>
        <PageHeading title={t('title')} />
        <ScheduleBoard
          aircraft={aircraft}
          dayBlocks={blocks.filter((block) => block.period === 'day')}
          weekBlocks={blocks.filter((block) => block.period === 'week')}
        />
      </div>
    </div>
  )
}

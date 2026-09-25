import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
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

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = await getTranslations('SchedulePage')

  return buildPageMetadata({
    locale,
    href: '/schedule',
    title: t('title'),
    description: t('meta.description'),
  })
}

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const locale = await getLocale()
  const t = await getTranslations('SchedulePage')

  const { aircraft: aircraftParam } = await searchParams
  // Deep link from the aircraft directory: /schedule?aircraft=<arcid>.
  const focusArcid =
    typeof aircraftParam === 'string' ? aircraftParam : undefined

  const [allAircraft, blocks] = await Promise.all([
    fetchApi<ScheduleAircraft[]>('/aircraft'),
    fetchApi<ScheduleBlockApiRecord[]>('/schedule'),
  ])

  const scheduledAircraftIds = new Set(blocks.map((block) => block.aircraftId))
  // Show aircraft that have blocks, plus a directory-linked one even when it
  // has nothing scheduled — so the link always lands on a real (empty) row.
  const aircraft = allAircraft.filter(
    (a) => scheduledAircraftIds.has(a.id) || a.arcid === focusArcid,
  )
  // The page renders per request (no-store fetches above), so this is when
  // the data on screen was pulled; a Refresh re-runs this component.
  const updatedAt = new Date().toISOString()

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
          updatedAt={updatedAt}
          focusArcid={focusArcid}
        />
      </div>
    </div>
  )
}

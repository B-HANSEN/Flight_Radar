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
  ScheduleBlock,
  ScheduleRow,
} from '@/components/ScheduleBoard.types'
import { fetchApi } from '@/lib/api'

type ScheduleBlockRecord = ScheduleBlock & {
  aircraftId: string
  period: 'day' | 'week'
}

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

function toRows(blocks: ScheduleBlockRecord[], period: 'day' | 'week') {
  const rows: ScheduleRow[] = []
  const rowByAircraftId = new Map<string, ScheduleRow>()

  for (const { aircraftId, period: blockPeriod, ...block } of blocks) {
    if (blockPeriod !== period) continue

    let row = rowByAircraftId.get(aircraftId)
    if (!row) {
      row = { aircraftId, blocks: [] }
      rowByAircraftId.set(aircraftId, row)
      rows.push(row)
    }
    row.blocks.push(block)
  }

  return rows
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
    fetchApi<ScheduleBlockRecord[]>('/schedule'),
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
          dayRows={toRows(blocks, 'day')}
          weekRows={toRows(blocks, 'week')}
        />
      </div>
    </div>
  )
}

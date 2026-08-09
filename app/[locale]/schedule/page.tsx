import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import PageHeading from '@/components/PageHeading'
import ScheduleBoard from '@/components/ScheduleBoard'
import {
  DUMMY_SCHEDULE_AIRCRAFT,
  DUMMY_SCHEDULE_DAY_ROWS,
  DUMMY_SCHEDULE_WEEK_ROWS,
} from '@/components/ScheduleBoard.data'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function SchedulePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('SchedulePage')

  return (
    <div className='ml-[calc(50%-50vw)] w-screen px-8 sm:px-12'>
      <div className='mx-auto max-w-300'>
        <PageHeading title={t('title')} />
        <ScheduleBoard
          aircraft={DUMMY_SCHEDULE_AIRCRAFT}
          dayRows={DUMMY_SCHEDULE_DAY_ROWS}
          weekRows={DUMMY_SCHEDULE_WEEK_ROWS}
        />
      </div>
    </div>
  )
}

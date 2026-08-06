import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import PageHeading from '@/components/PageHeading'
import AgendaCalendar from '@/components/AgendaCalendar'
import { DUMMY_AGENDA_EVENTS } from '@/components/AgendaCalendar.data'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function MeAgendaPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('MeAgendaPage')

  return (
    <>
      <PageHeading title={t('title')} />
      <AgendaCalendar events={DUMMY_AGENDA_EVENTS} />
    </>
  )
}

import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import AgendaCalendar from '@/components/AgendaCalendar'
import { DUMMY_AGENDA_EVENTS } from '@/components/AgendaCalendar.data'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function AgendaPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('AgendaPage')

  return (
    <>
      <h1 className='sr-only'>{t('title')}</h1>
      <AgendaCalendar events={DUMMY_AGENDA_EVENTS} />
    </>
  )
}

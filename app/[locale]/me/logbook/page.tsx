import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import Logbook from '@/components/Logbook'
import { DUMMY_LOGBOOK_ENTRIES } from '@/components/Logbook.data'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LogbookPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('LogbookPage')

  return (
    <>
      <h1 className='sr-only'>{t('title')}</h1>
      <Logbook entries={DUMMY_LOGBOOK_ENTRIES} />
    </>
  )
}

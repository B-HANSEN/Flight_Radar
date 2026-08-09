import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import DocumentsBrowser from '@/components/DocumentsBrowser'
import { DUMMY_DOCUMENT_FOLDERS } from '@/components/DocumentsBrowser.data'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function MeDocumentsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('MeDocumentsPage')

  return (
    <>
      <h1 className='sr-only'>{t('title')}</h1>
      <DocumentsBrowser folders={DUMMY_DOCUMENT_FOLDERS} />
    </>
  )
}

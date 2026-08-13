import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import DocumentsBrowser from '@/components/DocumentsBrowser'
import type { DocumentFolder } from '@/components/DocumentsBrowser.types'
import { fetchApi } from '@/lib/api'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function DocumentsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('DocumentsPage')
  const folders = await fetchApi<DocumentFolder[]>('/documents')

  return (
    <>
      <h1 className='sr-only'>{t('title')}</h1>
      <DocumentsBrowser folders={folders} />
    </>
  )
}

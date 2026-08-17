import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import DocumentsBrowser from '@/components/DocumentsBrowser'
import JsonLd from '@/components/JsonLd'
import type { DocumentFolder } from '@/components/DocumentsBrowser.types'
import { fetchApi } from '@/lib/api'
import { buildPageMetadata } from '@/lib/metadata'
import { buildWebPageSchema } from '@/lib/structuredData'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'DocumentsPage' })

  return buildPageMetadata({
    locale,
    href: '/documents',
    title: t('title'),
    description: t('meta.description'),
  })
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
      <JsonLd
        data={buildWebPageSchema({
          locale,
          href: '/documents',
          title: t('title'),
          description: t('meta.description'),
        })}
      />
      <h1 className='sr-only'>{t('title')}</h1>
      <DocumentsBrowser folders={folders} />
    </>
  )
}

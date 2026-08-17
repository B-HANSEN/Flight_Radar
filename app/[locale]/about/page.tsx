import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import PageHeading from '@/components/PageHeading'
import JsonLd from '@/components/JsonLd'
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
  const t = await getTranslations({ locale, namespace: 'AboutPage' })

  return buildPageMetadata({
    locale,
    href: '/about',
    title: t('title'),
    description: t('body'),
  })
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('AboutPage')

  return (
    <>
      <JsonLd
        data={buildWebPageSchema({
          locale,
          href: '/about',
          title: t('title'),
          description: t('body'),
        })}
      />
      <PageHeading title={t('title')} description={t('body')} />
    </>
  )
}

import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import PageHeading from '@/components/PageHeading'
import JsonLd from '@/components/JsonLd'
import { buildPageMetadata } from '@/lib/metadata'
import { buildWebPageSchema } from '@/lib/structuredData'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = await getTranslations('AboutPage')

  return buildPageMetadata({
    locale,
    href: '/about',
    title: t('title'),
    description: t('body'),
  })
}

export default async function AboutPage() {
  const locale = await getLocale()
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

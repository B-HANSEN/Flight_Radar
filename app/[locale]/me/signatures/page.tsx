import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import PageHeading from '@/components/PageHeading'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function SignaturesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('SignaturesPage')

  return <PageHeading title={t('title')} description={t('body')} />
}

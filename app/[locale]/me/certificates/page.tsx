import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import CertificateList from '@/components/CertificateList'
import { DUMMY_CERTIFICATES } from '@/components/CertificateList.data'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function MeCertificatesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('MeCertificatesPage')

  return (
    <>
      <h1 className='sr-only'>{t('title')}</h1>
      <CertificateList certificates={DUMMY_CERTIFICATES} />
    </>
  )
}

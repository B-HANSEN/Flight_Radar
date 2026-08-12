import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import CertificateList from '@/components/CertificateList'
import type { Certificate } from '@/components/CertificateList.types'
import { fetchApi } from '@/lib/api'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function CertificatesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('CertificatesPage')
  const certificates = await fetchApi<Certificate[]>('/certificates')

  return (
    <>
      <h1 className='sr-only'>{t('title')}</h1>
      <CertificateList certificates={certificates} />
    </>
  )
}

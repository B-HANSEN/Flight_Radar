import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import Signatures from '@/components/Signatures'
import type { FlightEvaluation } from '@/components/Signatures.types'
import { fetchApi } from '@/lib/api'

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
  const flights = await fetchApi<FlightEvaluation[]>('/flight-evaluations')

  return (
    <>
      <h1 className='sr-only'>{t('title')}</h1>
      <Signatures flights={flights} />
    </>
  )
}

import { setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { redirect } from '@/i18n/navigation'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function MePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  redirect({ href: '/me/agenda', locale })
}

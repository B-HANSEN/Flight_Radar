import { getLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { redirect } from '@/i18n/navigation'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function MePage() {
  const locale = await getLocale()
  redirect({ href: '/me/agenda', locale })
}

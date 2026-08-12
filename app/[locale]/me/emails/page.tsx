import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import Mailbox from '@/components/Mailbox'
import type { MailboxEmail } from '@/components/Mailbox.types'
import { fetchApi } from '@/lib/api'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function EmailsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('EmailsPage')
  const emails = await fetchApi<MailboxEmail[]>('/mailbox')

  return (
    <>
      <h1 className='sr-only'>{t('title')}</h1>
      <Mailbox emails={emails} />
    </>
  )
}

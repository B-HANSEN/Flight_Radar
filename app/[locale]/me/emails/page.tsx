import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import Mailbox from '@/components/Mailbox'
import { DUMMY_MAILBOX_EMAILS } from '@/components/Mailbox.data'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function MeEmailsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('MeEmailsPage')

  return (
    <>
      <h1 className='sr-only'>{t('title')}</h1>
      <Mailbox emails={DUMMY_MAILBOX_EMAILS} />
    </>
  )
}

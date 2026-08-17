import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import PageHeading from '@/components/PageHeading'
import { buildPageMetadata } from '@/lib/metadata'
import BulletinReminderCard from '@/components/BulletinReminderCard'
import BulletinProcedureCard from '@/components/BulletinProcedureCard'
import BulletinReferenceCard from '@/components/BulletinReferenceCard'
import BulletinMaintenanceCard from '@/components/BulletinMaintenanceCard'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'NewsPage' })

  return buildPageMetadata({
    locale,
    href: '/news',
    title: t('title'),
    description: t('body'),
  })
}

export default async function NewsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('NewsPage')

  return (
    <>
      <PageHeading title={t('title')} description={t('body')} />
      <div className='flex flex-col gap-10'>
        <BulletinReminderCard />
        <hr className='border-t border-black-200' />
        <BulletinProcedureCard />
        <hr className='border-t border-black-200' />
        <BulletinReferenceCard />
        <hr className='border-t border-black-200' />
        <BulletinMaintenanceCard />
      </div>
    </>
  )
}

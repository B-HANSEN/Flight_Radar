import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import PageHeading from '@/components/PageHeading'
import BulletinReminderCard from '@/components/BulletinReminderCard'
import BulletinProcedureCard from '@/components/BulletinProcedureCard'
import BulletinReferenceCard from '@/components/BulletinReferenceCard'
import BulletinMaintenanceCard from '@/components/BulletinMaintenanceCard'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
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

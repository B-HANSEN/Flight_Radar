import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import PageHeading from '@/components/PageHeading'
import JsonLd from '@/components/JsonLd'
import NewsFeed from '@/components/NewsFeed'
import type { NewsItem } from '@/components/Homepage.types'
import { fetchApi } from '@/lib/api'
import { buildPageMetadata } from '@/lib/metadata'
import { buildWebPageSchema } from '@/lib/structuredData'
import BulletinReminderCard from '@/components/BulletinReminderCard'
import BulletinProcedureCard from '@/components/BulletinProcedureCard'
import BulletinReferenceCard from '@/components/BulletinReferenceCard'
import BulletinMaintenanceCard from '@/components/BulletinMaintenanceCard'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = await getTranslations('NewsPage')

  return buildPageMetadata({
    locale,
    href: '/news',
    title: t('title'),
    description: t('body'),
  })
}

export default async function NewsPage() {
  const locale = await getLocale()
  const t = await getTranslations('NewsPage')
  const news = await fetchApi<NewsItem[]>('/news')

  return (
    <div className='ml-[calc(50%-50vw)] w-screen px-8 sm:px-12'>
      <JsonLd
        data={buildWebPageSchema({
          locale,
          href: '/news',
          title: t('title'),
          description: t('body'),
        })}
      />
      <div className='mx-auto max-w-300'>
        <PageHeading title={t('title')} description={t('body')} />
        <div className='grid grid-cols-1 gap-12 xl:grid-cols-2 xl:gap-10'>
          <NewsFeed news={news} />
          <section
            aria-labelledby='news-bulletins-heading'
            className='flex flex-col gap-8 border-t border-black-200 pt-10 xl:border-t-0 xl:pt-0'
          >
            <h2
              id='news-bulletins-heading'
              className='font-primary text-xl font-bold text-black-300'
            >
              {t('bulletinsTitle')}
            </h2>
            <BulletinReminderCard headingLevel={3} />
            <BulletinProcedureCard headingLevel={3} />
            <BulletinReferenceCard headingLevel={3} />
            <BulletinMaintenanceCard headingLevel={3} />
          </section>
        </div>
      </div>
    </div>
  )
}

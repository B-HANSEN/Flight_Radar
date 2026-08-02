import { getTranslations } from 'next-intl/server'
import NotFoundCard from '@/components/NotFoundCard'

export default async function NotFound() {
  const t = await getTranslations('NotFoundPage')

  return <NotFoundCard title={t('title')} body={t('body')} cta={t('cta')} />
}

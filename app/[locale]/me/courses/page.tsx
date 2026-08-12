import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import Courses from '@/components/Courses'
import { DUMMY_COURSE_PROGRESS } from '@/components/Courses.data'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function CoursesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('CoursesPage')

  return (
    <>
      <h1 className='sr-only'>{t('title')}</h1>
      <Courses progress={DUMMY_COURSE_PROGRESS} />
    </>
  )
}

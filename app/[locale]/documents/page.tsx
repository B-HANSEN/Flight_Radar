import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { getLocale, getTranslations } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import DocumentsBrowser from '@/components/DocumentsBrowser'
import JsonLd from '@/components/JsonLd'
import type { DocumentFolder } from '@/components/DocumentsBrowser.types'
import type { Instructor } from '@/components/RoleSwitcher.types'
import { fetchApi } from '@/lib/api'
import {
  CURRENT_ROLE_COOKIE,
  instructorIdFromRoleValue,
  isInstructorRoleValue,
} from '@/lib/currentRole'
import { buildPageMetadata } from '@/lib/metadata'
import { buildWebPageSchema } from '@/lib/structuredData'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

// Instructors can upload into the folders; everyone else only browses. The
// legacy role value names no instructor, so it falls back to the first.
async function currentInstructorId(): Promise<string | undefined> {
  const roleCookie = (await cookies()).get(CURRENT_ROLE_COOKIE)?.value
  if (!isInstructorRoleValue(roleCookie)) return undefined

  const selectedId = instructorIdFromRoleValue(roleCookie)
  if (selectedId) return selectedId
  const instructors = await fetchApi<Instructor[]>('/instructors')
  return instructors[0]?.id
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = await getTranslations('DocumentsPage')

  return buildPageMetadata({
    locale,
    href: '/documents',
    title: t('title'),
    description: t('meta.description'),
  })
}

export default async function DocumentsPage() {
  const locale = await getLocale()
  const t = await getTranslations('DocumentsPage')
  const [folders, instructorId] = await Promise.all([
    fetchApi<DocumentFolder[]>('/documents'),
    currentInstructorId(),
  ])

  return (
    <>
      <JsonLd
        data={buildWebPageSchema({
          locale,
          href: '/documents',
          title: t('title'),
          description: t('meta.description'),
        })}
      />
      <h1 className='sr-only'>{t('title')}</h1>
      <DocumentsBrowser folders={folders} instructorId={instructorId} />
    </>
  )
}

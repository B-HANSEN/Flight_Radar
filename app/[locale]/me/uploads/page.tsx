import { cookies } from 'next/headers'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { redirect } from '@/i18n/navigation'
import {
  CURRENT_ROLE_COOKIE,
  instructorIdFromRoleValue,
  isInstructorRoleValue,
} from '@/lib/currentRole'
import PersonFileUpload from '@/components/PersonFileUpload'
import type { PersonFile } from '@/components/PersonFileList.types'
import type { Instructor, Student } from '@/components/RoleSwitcher.types'
import { fetchApi } from '@/lib/api'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

const toOption = ({ id, name }: { id: string; name: string }) => ({ id, name })

export default async function UploadsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  // Instructor-only, like /me/scheduling — a student view is sent back to
  // their own /me.
  const roleCookie = (await cookies()).get(CURRENT_ROLE_COOKIE)?.value
  if (!isInstructorRoleValue(roleCookie)) {
    redirect({ href: '/me', locale })
  }

  const t = await getTranslations('UploadsPage')
  const [students, instructors] = await Promise.all([
    fetchApi<Student[]>('/students'),
    fetchApi<Instructor[]>('/instructors'),
  ])
  const selectedInstructorId = instructorIdFromRoleValue(roleCookie)
  const currentInstructor =
    instructors.find((instructor) => instructor.id === selectedInstructorId) ??
    instructors[0]
  // Four-eyes principle: the current instructor can't be their own
  // recipient.
  const otherInstructors = instructors.filter(
    (instructor) => instructor.id !== currentInstructor?.id,
  )

  // The panel opens on the first recipient; later picks fetch on the client.
  const firstRecipientId = (students[0] ?? otherInstructors[0])?.id
  const initialFiles = firstRecipientId
    ? await fetchApi<PersonFile[]>(
        `/person-files?personId=${encodeURIComponent(firstRecipientId)}`,
      )
    : []

  return (
    <>
      <h1 className='sr-only'>{t('title')}</h1>
      <PersonFileUpload
        students={students.map(toOption)}
        instructors={otherInstructors.map(toOption)}
        instructorId={currentInstructor?.id}
        initialFiles={initialFiles}
      />
    </>
  )
}

import { cookies } from 'next/headers'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { redirect } from '@/i18n/navigation'
import {
  CURRENT_ROLE_COOKIE,
  instructorIdFromRoleValue,
  isInstructorRoleValue,
} from '@/lib/currentRole'
import InstructorScheduleView from '@/components/InstructorScheduleView'
import StudentFileUpload from '@/components/StudentFileUpload'
import type { StudentFile } from '@/components/StudentFileList.types'
import type { RawStudentSchedule } from '@/components/InstructorScheduleView.types'
import type { Instructor } from '@/components/RoleSwitcher.types'
import type { ScheduleAircraft } from '@/components/ScheduleBoard.types'
import { fetchApi } from '@/lib/api'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function InstructorPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  // Only an instructor view (RoleSwitcher's instructor options) may see
  // this page — a student's own preview never should. The default, absent
  // any fr-current-role cookie, is the student view (see NavBar's Jamie
  // Torres default), so an unrecognized visitor is denied too.
  const roleCookie = (await cookies()).get(CURRENT_ROLE_COOKIE)?.value
  if (!isInstructorRoleValue(roleCookie)) {
    redirect({ href: '/me', locale })
  }

  const t = await getTranslations('InstructorPage')
  const [students, instructors, aircraft] = await Promise.all([
    fetchApi<RawStudentSchedule[]>('/students/schedule'),
    fetchApi<Instructor[]>('/instructors'),
    fetchApi<ScheduleAircraft[]>('/aircraft'),
  ])
  const selectedInstructorId = instructorIdFromRoleValue(roleCookie)
  const currentInstructor =
    instructors.find((instructor) => instructor.id === selectedInstructorId) ??
    instructors[0]
  // The upload panel opens on the first student; later picks fetch on the
  // client.
  const firstStudentId = students[0]?.id
  const initialFiles = firstStudentId
    ? await fetchApi<StudentFile[]>(
        `/student-files?studentId=${encodeURIComponent(firstStudentId)}`,
      )
    : []

  return (
    <>
      <h1 className='sr-only'>{t('title')}</h1>
      <InstructorScheduleView
        instructorName={currentInstructor?.name}
        currentInstructorId={currentInstructor?.id}
        instructors={instructors}
        students={students}
        aircraft={aircraft}
      />
      <div className='mt-6'>
        <StudentFileUpload
          students={students.map(({ id, name }) => ({ id, name }))}
          instructorId={currentInstructor?.id}
          initialFiles={initialFiles}
        />
      </div>
    </>
  )
}

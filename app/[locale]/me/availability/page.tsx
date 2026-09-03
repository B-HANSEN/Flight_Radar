import { cookies } from 'next/headers'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import {
  CURRENT_ROLE_COOKIE,
  instructorIdFromRoleValue,
  isInstructorRoleValue,
} from '@/lib/currentRole'
import Availability from '@/components/Availability'
import InstructorAvailability from '@/components/InstructorAvailability'
import type { AvailabilityEntry } from '@/components/Availability.types'
import type { InstructorTimeOffEntry } from '@/components/InstructorAvailability.types'
import type { Instructor, Student } from '@/components/RoleSwitcher.types'
import { fetchApi } from '@/lib/api'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function AvailabilityPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('AvailabilityPage')
  const roleCookie = (await cookies()).get(CURRENT_ROLE_COOKIE)?.value

  // Instructors manage days off here — regular ones are granted on request,
  // personal leave waits for the Chief Flight Instructor (who self-approves
  // and reviews everyone else's requests).
  if (isInstructorRoleValue(roleCookie)) {
    const instructors = await fetchApi<Instructor[]>('/instructors')
    const instructorId = instructorIdFromRoleValue(roleCookie)
    const instructor =
      instructors.find((i) => i.id === instructorId) ?? instructors[0]

    const entries = await fetchApi<InstructorTimeOffEntry[]>(
      `/instructor-time-off?instructorId=${instructor.id}`,
    )
    const reviewQueue = instructor.isChief
      ? await fetchApi<InstructorTimeOffEntry[]>('/instructor-time-off')
      : []
    const instructorNames = Object.fromEntries(
      instructors.map((i) => [i.id, i.name]),
    )

    return (
      <>
        <h1 className='sr-only'>{t('title')}</h1>
        {/* key forces a remount when the previewed instructor changes —
            InstructorAvailability seeds local state from these props on
            mount, so without this a FI↔CFI switch (router.refresh re-runs
            this component) would keep showing the previous instructor's
            days off and review queue. Same pattern as ProfileCardContainer
            in me/layout.tsx. */}
        <InstructorAvailability
          key={instructor.id}
          entries={entries}
          instructorId={instructor.id}
          isChief={instructor.isChief}
          reviewQueue={reviewQueue}
          instructorNames={instructorNames}
        />
      </>
    )
  }

  // Same persona resolution as the rest of /me — the cookie value is the
  // student's own id, falling back to the default demo persona.
  const students = await fetchApi<Student[]>('/students')
  const student =
    students.find((s) => s.id === roleCookie) ??
    students.find((s) => s.name === 'Jamie Torres') ??
    students[0]

  const entries = await fetchApi<AvailabilityEntry[]>(
    `/availability?studentId=${student.id}`,
  )

  return (
    <>
      <h1 className='sr-only'>{t('title')}</h1>
      {/* Remount on a student switch for the same reason as the instructor
          branch above — Availability copies entries into local state. */}
      <Availability key={student.id} entries={entries} studentId={student.id} />
    </>
  )
}

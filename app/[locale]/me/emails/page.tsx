import { cookies } from 'next/headers'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import Mailbox from '@/components/Mailbox'
import type { MailboxEmail, MailboxPerson } from '@/components/Mailbox.types'
import type { Instructor, Student } from '@/components/RoleSwitcher.types'
import { fetchApi } from '@/lib/api'
import {
  CURRENT_ROLE_COOKIE,
  instructorIdFromRoleValue,
  isInstructorRoleValue,
} from '@/lib/currentRole'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function EmailsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('EmailsPage')
  const roles = await getTranslations('MePage.profileCard')

  const roleCookie = (await cookies()).get(CURRENT_ROLE_COOKIE)?.value
  const isInstructorView = isInstructorRoleValue(roleCookie)

  const [students, instructors] = await Promise.all([
    fetchApi<Student[]>('/students'),
    fetchApi<Instructor[]>('/instructors'),
  ])

  // Both lists back a required lookup below (the current persona, plus the
  // compose recipient list) — surface a clear failure via the app's error
  // boundary rather than crashing on `undefined.id` if either is empty.
  if (students.length === 0 || instructors.length === 0) {
    throw new Error(
      'Mailbox requires at least one seeded student and instructor',
    )
  }

  let currentPerson: { id: string; name: string; role: string }
  if (isInstructorView) {
    const instructorId = instructorIdFromRoleValue(roleCookie)
    const instructor =
      instructors.find((i) => i.id === instructorId) ?? instructors[0]
    currentPerson = {
      id: instructor.id,
      name: instructor.name,
      role: roles('instructorRoleValue'),
    }
  } else {
    // No cookie yet defaults to the site's default demo persona, matching
    // NavBar's own fallback.
    const student =
      students.find((s) => s.id === roleCookie) ??
      students.find((s) => s.name === 'Jamie Torres') ??
      students[0]
    currentPerson = {
      id: student.id,
      name: student.name,
      role: roles('studentRoleValue'),
    }
  }

  const people: MailboxPerson[] = [
    ...students.map((s) => ({
      id: s.id,
      name: s.name,
      kind: 'student' as const,
    })),
    ...instructors.map((i) => ({
      id: i.id,
      name: i.name,
      kind: 'instructor' as const,
    })),
  ].filter((person) => person.id !== currentPerson.id)

  const [inbox, sent] = await Promise.all([
    fetchApi<MailboxEmail[]>(`/mailbox?recipientId=${currentPerson.id}`),
    fetchApi<MailboxEmail[]>(`/mailbox?senderId=${currentPerson.id}`),
  ])

  return (
    <>
      <h1 className='sr-only'>{t('title')}</h1>
      {/* Remount on persona switch so filters, selection and the local
          read-state reset for the new mailbox. */}
      <Mailbox
        key={currentPerson.id}
        emails={inbox}
        sentEmails={sent}
        people={people}
        currentPersonId={currentPerson.id}
        currentPersonName={currentPerson.name}
        currentPersonRole={currentPerson.role}
        canSendAsDesk={isInstructorView}
      />
    </>
  )
}

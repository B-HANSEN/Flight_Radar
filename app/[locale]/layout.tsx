import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { cookies } from 'next/headers'
import { routing } from '@/i18n/routing'
import NavBar from '@/components/NavBar'
import JsonLd from '@/components/JsonLd'
import { fetchApi } from '@/lib/api'
import {
  buildOrganizationSchema,
  buildWebSiteSchema,
} from '@/lib/structuredData'
import {
  CURRENT_ROLE_COOKIE,
  instructorIdFromRoleValue,
  isInstructorRoleValue,
} from '@/lib/currentRole'
import type { Instructor, Student } from '@/components/RoleSwitcher.types'
import '../globals.css'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  ),
  title: {
    template: '%s | Flight Radar',
    default: 'Flight Radar',
  },
  description:
    'A flight school management platform for tracking bookings, logbooks, certificates, and courses.',
}

// The locale is read from next/root-params (see i18n/request.ts), which
// also 404s an unsupported locale segment.
export default async function LocaleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()
  const students = await fetchApi<Student[]>('/students')
  const instructors = await fetchApi<Instructor[]>('/instructors')
  const roleCookie = (await cookies()).get(CURRENT_ROLE_COOKIE)?.value
  const initialSelectedStudentId =
    roleCookie === undefined
      ? undefined
      : isInstructorRoleValue(roleCookie)
        ? null
        : roleCookie
  const initialSelectedInstructorId = instructorIdFromRoleValue(roleCookie)

  return (
    <html
      lang={locale}
      className='scroll-pt-16 scrollbar-gutter-stable md:scroll-pt-18'
    >
      <body className='min-h-screen overflow-x-hidden bg-white text-slate-900 antialiased'>
        <JsonLd
          data={[buildOrganizationSchema(), buildWebSiteSchema(locale)]}
        />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <NavBar
            students={students}
            instructors={instructors}
            initialSelectedStudentId={initialSelectedStudentId}
            initialSelectedInstructorId={initialSelectedInstructorId}
          />
          <main className='mx-auto max-w-3xl px-4 py-8'>{children}</main>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

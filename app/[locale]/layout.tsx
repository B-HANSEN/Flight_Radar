import type { Metadata } from 'next'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import NavBar from '@/components/NavBar'
import '../globals.css'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export const metadata: Metadata = {
  title: 'Flight Radar',
  description: 'A light-weight flight radar demo',
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }
  setRequestLocale(locale)
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body className='min-h-screen bg-white text-slate-900 antialiased'>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <NavBar />
          <main className='mx-auto max-w-3xl px-4 py-8'>{children}</main>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

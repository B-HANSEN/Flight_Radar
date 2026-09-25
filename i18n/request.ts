import * as rootParams from 'next/root-params'
import { notFound } from 'next/navigation'
import { getRequestConfig } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { routing } from './routing'

// The locale comes from the app/[locale] root segment via next/root-params,
// so pages and layouts no longer call setRequestLocale. An explicit
// `getTranslations({ locale })` still wins. An unsupported segment value
// (e.g. /fr, or /favicon.txt caught by [locale]) is a 404 here — this is
// the single place locales are validated.
export default getRequestConfig(async ({ locale: explicitLocale }) => {
  const requested = explicitLocale ?? (await rootParams.locale())
  if (!hasLocale(routing.locales, requested)) notFound()

  return {
    locale: requested,
    messages: (await import(`../messages/${requested}.json`)).default,
  }
})

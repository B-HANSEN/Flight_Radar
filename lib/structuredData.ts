import type { Organization, WebSite, WithContext } from 'schema-dts'
import { getPathname } from '@/i18n/navigation'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
const SITE_NAME = 'Flight Radar'
const SITE_DESCRIPTION =
  'A flight school management platform for tracking bookings, logbooks, certificates, and courses.'

const ORGANIZATION_ID = `${SITE_URL}/#organization`
const WEBSITE_ID = `${SITE_URL}/#website`

// Returning the literal object (checked via `satisfies`) rather than
// annotating the function with `WithContext<Organization>` keeps the
// inferred type narrow — schema-dts's `Organization`/`WebSite` types are
// wide unions that also admit a bare `string` (an IdReference), so an
// explicit annotation here would widen every field back to `unknown`-ish
// unions for callers.
export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: SITE_NAME,
    url: SITE_URL,
  } satisfies WithContext<Organization>
}

export function buildWebSiteSchema(locale: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: `${SITE_URL}${getPathname({ href: '/', locale })}`,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    inLanguage: locale,
    publisher: { '@id': ORGANIZATION_ID },
  } satisfies WithContext<WebSite>
}

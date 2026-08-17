import type { MetadataRoute } from 'next'
import { routing } from '@/i18n/routing'
import { getPathname } from '@/i18n/navigation'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

// Public, non-authenticated routes only — /me/* is excluded via app/robots.ts
// and its own noindex metadata. Add new public pages here as they're built.
const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/news',
  '/schedule',
  '/aircraft',
  '/documents',
] as const

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_ROUTES.map((href) => ({
    url: `${SITE_URL}${getPathname({ href, locale: routing.defaultLocale })}`,
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((locale) => [
          locale,
          `${SITE_URL}${getPathname({ href, locale })}`,
        ]),
      ),
    },
  }))
}

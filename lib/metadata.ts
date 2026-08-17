import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'
import { getPathname } from '@/i18n/navigation'

const SITE_NAME = 'Flight Radar'

type BuildPageMetadataInput = {
  locale: string
  href: string
  title: string
  description: string
  // The root layout's title.template ("%s | Flight Radar") applies to every
  // child route segment, but not to a page sharing the exact same segment as
  // the layout that defines it — i.e. only app/[locale]/page.tsx itself.
  isHomeSegment?: boolean
}

export function buildPageMetadata({
  locale,
  href,
  title,
  description,
  isHomeSegment = false,
}: BuildPageMetadataInput): Metadata {
  return {
    title: isHomeSegment ? `${title} | ${SITE_NAME}` : title,
    description,
    alternates: {
      canonical: getPathname({ href, locale }),
      languages: Object.fromEntries(
        routing.locales.map((altLocale) => [
          altLocale,
          getPathname({ href, locale: altLocale }),
        ]),
      ),
    },
    openGraph: {
      // Open Graph titles aren't templated by the layout, so the site name
      // suffix is always applied here regardless of isHomeSegment.
      title: `${title} | ${SITE_NAME}`,
      description,
      siteName: SITE_NAME,
      type: 'website',
      images: [
        {
          url: '/og-image.webp',
          width: 1200,
          height: 630,
          alt: SITE_NAME,
        },
      ],
    },
  }
}

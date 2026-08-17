import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Every /<locale>/me/* route is a signed-in student's private data —
      // kept out of the crawl entirely, on top of the noindex meta tag it
      // already carries (see app/[locale]/me/layout.tsx).
      disallow: '/*/me',
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}

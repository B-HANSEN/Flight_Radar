---
name: new-page
description: Add a new locale-routed page under app/[locale]/ in this Next.js app-router repo. Use when the user asks to add a page, add a route, or create a new section of the site. Ensures generateStaticParams, setRequestLocale, and matching message keys land in all three locale files in one pass, since a missing key in one locale fails silently only when that locale is visited.
---

Add a new page under `app/[locale]/<route>/page.tsx`. Follow `app/[locale]/about/page.tsx` as the reference implementation — copy its shape exactly rather than improvising:

```tsx
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import PageHeading from '@/components/PageHeading'
import { buildPageMetadata } from '@/lib/metadata'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: '<Name>Page' })

  return buildPageMetadata({
    locale,
    href: '/<route>',
    title: t('title'),
    description: t('body'),
  })
}

export default async function <Name>Page({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('<Name>Page')

  return <PageHeading title={t('title')} description={t('body')} />
}
```

## Steps

1. Create `app/[locale]/<route>/page.tsx` in this shape. `generateStaticParams()` and `setRequestLocale(locale)` are required on every page — the locale-validity check itself (`hasLocale`/`notFound()`) already happens once in `app/[locale]/layout.tsx`, don't repeat it per-page.
2. Pick a namespace name for the page's strings (e.g. `FlightsPage`) and add it, with at least `title` and `body` keys (or whatever the page actually needs), to **all three** message files in the same pass: `messages/en.json`, `messages/de.json`, `messages/es.json`. Do this before considering the page done — a key present only in `en.json` breaks silently for `de`/`es` visitors and won't show up in an English-only smoke test.
3. Use `getTranslations('<Name>Page')` (this repo's pages are async server components) to read the strings — never hardcode UI text in the page.
4. If the page needs a heading, reuse `components/PageHeading.tsx` (`title` + optional `description` props) instead of hand-rolling a heading.
5. Add `generateMetadata` exactly as shown above, calling `buildPageMetadata` (`lib/metadata.ts`) with the same `<Name>Page` namespace's `title`/`body`. That helper handles the title-template quirk, `alternates.canonical` + per-locale `alternates.languages`, and an Open Graph block, all in one place — don't hand-roll any of that in the page itself. If the page's `title`/`body` keys aren't suitable as a meta description (e.g. no natural body text, or it's too long/short for a search snippet), add a dedicated `<Name>Page.meta.description` key instead and pass `t('meta.description')` — see `app/[locale]/schedule/page.tsx` for that variant. Skip this step only for pages nested under `/me` — those are private per-user data, already excluded from the crawl by `app/robots.ts` and marked `robots: { index: false, follow: false }` in `app/[locale]/me/layout.tsx`, so they don't need their own SEO metadata. The one exception to calling `buildPageMetadata` plainly is `app/[locale]/page.tsx` itself (the home page): pass `isHomeSegment: true` there, since it shares the exact same route segment as `app/[locale]/layout.tsx` and so doesn't get the layout's `title.template` applied automatically (every other page does — see the comment in `lib/metadata.ts` for why).
6. If this is a new top-level public route (not nested under `/me`), add it to `PUBLIC_ROUTES` in `app/sitemap.ts` so it's included in the generated sitemap.
7. Ask whether the page should be linked from the main nav before assuming it should be. If yes: add a `Link` entry in `components/Nav.tsx` using `t('<key>')` from the `Nav` namespace, and add that same key to the `Nav` namespace in all three message files.
8. For any in-page links, import `Link` (and `usePathname`/`useRouter`/`redirect`/`getPathname` if needed) from `i18n/navigation.ts` — never from `next/link` or `next/navigation` directly.
9. After creating the page, verify it renders at `/en/<route>` via `npm run dev`, and that the locale switcher in the nav correctly reaches `/de/<route>` and `/es/<route>`. Curl the page and check for exactly one `| Flight Radar` in the `<title>` tag, an `og:title` meta tag, and a `<link rel="canonical">` tag.

## Read failures

If the page (or a component it renders) does `await fetchApi(...)`, let a failure throw — don't wrap the page body in a defensive `try/catch` that swallows it. `app/[locale]/error.tsx` is a global boundary that catches any uncaught throw in the locale subtree and renders `components/ErrorCard` (translated via the `ErrorPage` namespace) with a retry button. Add a segment-scoped `app/[locale]/<route>/error.tsx` only if this route genuinely needs its own recovery UI. Mutation flows (a button click, not a page load) are the exception — those still need an inline `try/catch` + `Toast` in the client component, since there's no navigation for the boundary to catch; see the `design-to-component` command.

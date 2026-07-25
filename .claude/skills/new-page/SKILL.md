---
description: Add a new locale-routed page under app/[locale]/ in this Next.js app-router repo. Use when the user asks to add a page, add a route, or create a new section of the site. Ensures generateStaticParams, setRequestLocale, and matching message keys land in all three locale files in one pass, since a missing key in one locale fails silently only when that locale is visited.
---

Add a new page under `app/[locale]/<route>/page.tsx`. Follow `app/[locale]/about/page.tsx` as the reference implementation — copy its shape exactly rather than improvising:

```tsx
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import PageHeading from '@/components/PageHeading'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
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
5. Ask whether the page should be linked from the main nav before assuming it should be. If yes: add a `Link` entry in `components/Nav.tsx` using `t('<key>')` from the `Nav` namespace, and add that same key to the `Nav` namespace in all three message files.
6. For any in-page links, import `Link` (and `usePathname`/`useRouter`/`redirect`/`getPathname` if needed) from `i18n/navigation.ts` — never from `next/link` or `next/navigation` directly.
7. After creating the page, verify it renders at `/en/<route>` via `npm run dev`, and that the locale switcher in the nav correctly reaches `/de/<route>` and `/es/<route>`.

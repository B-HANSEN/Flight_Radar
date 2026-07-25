# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

A light-weight clone of private-radar.com: a flight tracking web app built with Next.js (App Router), TypeScript, next-intl, and Tailwind CSS. Currently scaffolding-stage — pages are placeholder text used to verify routing/i18n; no flight data integration exists yet. See `TODO.md` for the project outline and roadmap.

## Commands

```bash
npm run dev              # start dev server
npm run build             # production build
npm run lint               # eslint
npm run format              # prettier --write .
npm run format:check        # prettier --check .
npm run test                # vitest run (single run)
npm run test:watch          # vitest watch mode
npm run test:coverage       # vitest run with coverage; enforces 80% lines/branches/functions/statements per component
npm run storybook           # storybook dev, port 6006
npm run build-storybook     # static storybook build
```

Run a single test file: `npx vitest run components/PageHeading.test.tsx`

## Architecture

- **Locale-scoped routing**: every route lives under `app/[locale]/`, driven by `i18n/routing.ts` (`locales: ['en', 'de', 'es']`, default `en`, `localePrefix: 'always'`). `/` redirects to `/en`. `app/[locale]/layout.tsx` validates the locale param with `hasLocale`/`notFound()` and calls `setRequestLocale`; every page does the same and must export `generateStaticParams()` returning `routing.locales.map(locale => ({ locale }))` for static rendering.
- **i18n plumbing**: import navigation primitives (`Link`, `usePathname`, `useRouter`, `redirect`, `getPathname`) from `i18n/navigation.ts`, never from `next/link` or `next/navigation` directly — these are locale-aware wrappers. `i18n/request.ts` loads the message bundle per request. Translation strings live in `messages/{en,de,es}.json`, keyed by namespace (e.g. `Nav`, `HomePage`, `AboutPage`, `FlightsPage`); use `getTranslations(namespace)` in server components and `useTranslations(namespace)` in client components. Adding a page means adding a matching key set to all three message files.
- **Middleware**: `proxy.ts` (not `middleware.ts`) runs `next-intl`'s `createMiddleware(routing)` — this is one of the breaking-change file-naming conventions called out in `AGENTS.md`.
- **Components**: all React components live flat in `/components` (no subfolders per component), are functional/typed with a `Props` type, and each ships a `*.stories.tsx` (CSF3) alongside optional `*.test.tsx`. Storybook only picks up stories under `components/**` (see `.storybook/main.ts`). The Storybook preview wraps every story in `NextIntlClientProvider` with the English messages, so components relying on `useTranslations` render correctly in isolation.
- **Styling**: Tailwind utility classes directly in JSX; no CSS modules or styled-components in use.

## Conventions

- No semicolons, single quotes (`.prettierrc.json`). `.vscode/settings.json` runs Prettier on save; `npm run format` is the manual/CI fallback.
- Components must be WCAG-AA 2.2 compatible and SEO/AEO-compatible (per `TODO.md`); the Storybook a11y addon is wired up (`test: 'todo'` in `.storybook/preview.tsx`) — check its output when adding components.
- Each component under `/components` needs a `*.test.tsx` covering it at ≥80% lines/branches/functions/statements (`npm run test:coverage`, configured per-file in `vitest.config.ts`). `*.stories.tsx` files are excluded from coverage.
- A `/playwright` e2e folder is planned but not yet set up.

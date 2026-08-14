# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

A flight school management platform: a Next.js (App Router) + TypeScript + next-intl + Tailwind CSS frontend, backed by a NestJS + MongoDB API (`server/`, npm workspace — see its own architecture notes below). Public pages (home, about, news, aircraft directory, schedule overview) are visible to anyone; a `/me` area lets students track their own progress (logbook, certificates, courses). Instructor tooling is planned for later. Currently scaffolding-stage — frontend pages still render from `DUMMY_*` data and the backend only has config/MongoDB/health-check groundwork; no feature endpoints exist yet. See `TODO.md` for the project outline and roadmap.

## Commands

```bash
npm run dev              # start dev server
npm run build             # production build
npm run lint               # eslint
npm run type-check          # tsc --noEmit
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
- **i18n plumbing**: import navigation primitives (`Link`, `usePathname`, `useRouter`, `redirect`, `getPathname`) from `i18n/navigation.ts`, never from `next/link` or `next/navigation` directly — these are locale-aware wrappers. `i18n/request.ts` loads the message bundle per request. Translation strings live in `messages/{en,de,es}.json`, keyed by namespace (e.g. `Nav`, `Homepage`, `AboutPage`, `LogbookPage`); use `getTranslations(namespace)` in server components and `useTranslations(namespace)` in client components. Adding a page means adding a matching key set to all three message files.
- **Middleware**: `proxy.ts` (not `middleware.ts`) runs `next-intl`'s `createMiddleware(routing)` — this is one of the breaking-change file-naming conventions called out in `AGENTS.md`.
- **Components**: all React components live flat in `/components` (no subfolders per component), are functional/typed with a `Props` type, and each ships a `*.stories.tsx` (CSF3) alongside optional `*.test.tsx`. Storybook only picks up stories under `components/**` (see `.storybook/main.ts`). The Storybook preview wraps every story in `NextIntlClientProvider` with the English messages, so components relying on `useTranslations` render correctly in isolation.
- **Styling**: Tailwind utility classes directly in JSX; no CSS modules or styled-components in use.

## Commit messages

Use Conventional Commits: `<type>(<scope>): <description>`.

- `type` is one of `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `style`, `build`, `ci`, `perf`.
- `scope` is optional and names the area touched (e.g. `nav`, `i18n`, `flights`, `storybook`) — omit it if the change is repo-wide.
- `description` is lowercase, imperative mood, no trailing period (e.g. `fix(nav): correct locale-aware link href`).
- Add a body only when the _why_ isn't obvious from the diff; wrap at ~72 chars.
- Breaking changes get a `!` after the type/scope (`feat(routing)!: drop de locale`) plus a `BREAKING CHANGE:` footer explaining the migration.

## Conventions

- No semicolons, single quotes (`.prettierrc.json`). `.vscode/settings.json` runs Prettier on save; `npm run format` is the manual/CI fallback.
- TypeScript `strict` mode is on (`tsconfig.json`). `npm run lint` does not type-check (`eslint-config-next/typescript` runs without `parserOptions.project`, so it's syntactic only) — run `npm run type-check` after non-trivial TS changes rather than relying on `npm run build` to eventually catch a strict-mode violation.
- Components must be WCAG-AA 2.2 compatible and SEO/AEO-compatible (per `TODO.md`); the Storybook a11y addon is wired up (`test: 'todo'` in `.storybook/preview.tsx`) — check its output when adding components.
- Each component under `/components` needs a `*.test.tsx` covering it at ≥80% lines/branches/functions/statements (`npm run test:coverage`, configured per-file in `vitest.config.ts`). `*.stories.tsx` files are excluded from coverage.
- A `/playwright` e2e folder is planned but not yet set up.
- Raster images under `/public` must be `.webp` (`config/check-image-formats.mjs`, run as part of `npm run lint`, fails the build if a `.png`/`.jpg`/`.jpeg`/`.gif`/`.bmp`/`.tiff` is found) — `.svg`/`.ico` are exempt. Convert with `cwebp -q 90 in.png -o out.webp`.

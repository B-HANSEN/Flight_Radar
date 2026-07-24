# Flight Radar

A light-weight flight tracking web app, built with Next.js.

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [next-intl](https://next-intl.dev) — English (default), German, Spanish
- [Tailwind CSS](https://tailwindcss.com)
- [Storybook](https://storybook.js.org) for component documentation
- [Vitest](https://vitest.dev) + [React Testing Library](https://testing-library.com/react) for testing
- [Prettier](https://prettier.io) + ESLint for formatting/linting

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to `/en` by default.

## Scripts

| Script                    | Description                       |
| ------------------------- | --------------------------------- |
| `npm run dev`             | Start the dev server              |
| `npm run build`           | Production build                  |
| `npm run start`           | Run the production build          |
| `npm run lint`            | Lint the codebase                 |
| `npm run format`          | Format the codebase with Prettier |
| `npm run format:check`    | Check formatting without writing  |
| `npm run test`            | Run unit tests                    |
| `npm run test:watch`      | Run unit tests in watch mode      |
| `npm run storybook`       | Start Storybook locally           |
| `npm run build-storybook` | Build a static Storybook site     |

## Project structure

```
app/[locale]/    Pages (App Router, one segment per locale)
components/      React components, documented with Storybook
i18n/            next-intl routing/navigation/request config
messages/        Translation files (en, de, es)
```

See `TODO.md` for the project outline and roadmap.

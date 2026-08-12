# Flight Radar

A flight school management platform: a Next.js frontend backed by a NestJS +
MongoDB API, in one repo as an npm workspace.

Public pages (home, about, news, aircraft directory, schedule overview) are
visible to anyone; a `/me` area lets students track their own progress.
Instructor tooling is planned for later.

## Tech stack

**Frontend** (repo root)

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [next-intl](https://next-intl.dev) — English (default), German, Spanish
- [Tailwind CSS](https://tailwindcss.com)
- [Storybook](https://storybook.js.org) for component documentation
- [Vitest](https://vitest.dev) + [React Testing Library](https://testing-library.com/react) for testing

**Backend** (`server/`, npm workspace)

- [NestJS](https://nestjs.com) + TypeScript
- [MongoDB](https://www.mongodb.com) via [Mongoose](https://mongoosejs.com) (Atlas in production)
- `class-validator`/`class-transformer` for env and request validation
- `helmet` + scoped CORS
- [Jest](https://jestjs.io) for testing

**Shared**

- [Prettier](https://prettier.io) + ESLint for formatting/linting

## Getting started

```bash
npm install          # installs both the frontend and server/ workspace
npm run dev:all       # frontend + backend together (needs server/.env, see below)
```

Or run them separately:

```bash
npm run dev           # frontend dev server
npm run server:dev    # backend dev server (needs server/.env, see below)
```

Open [http://localhost:3000](http://localhost:3000) for the frontend — it
redirects to `/en` by default. The backend listens on
[http://localhost:4000](http://localhost:4000); check it's up via
`curl http://localhost:4000/health`.

The backend needs a `server/.env` (gitignored) — copy `server/.env.example`
and fill in `MONGODB_URI` (Atlas connection string) and `CORS_ORIGIN`.

The frontend needs a root `.env.local` (gitignored) — copy `.env.example` and
set `NEXT_PUBLIC_API_URL` to the backend's URL (`http://localhost:4000` for
local dev). Seed the database with `npm run seed --workspace server` before
starting the frontend, so pages that fetch from the API have data to show.

## Scripts

Run from the repo root — npm workspaces resolves both projects from one
`node_modules`.

| Script                    | Description                               |
| ------------------------- | ----------------------------------------- |
| `npm run dev`             | Start the frontend dev server             |
| `npm run dev:all`         | Start the frontend and backend together   |
| `npm run build`           | Frontend production build                 |
| `npm run start`           | Run the frontend production build         |
| `npm run lint`            | Lint the frontend codebase                |
| `npm run format`          | Format the whole repo with Prettier       |
| `npm run format:check`    | Check formatting without writing          |
| `npm run test`            | Run frontend unit tests                   |
| `npm run test:watch`      | Run frontend unit tests in watch mode     |
| `npm run test:coverage`   | Frontend unit tests with coverage         |
| `npm run storybook`       | Start Storybook locally                   |
| `npm run build-storybook` | Build a static Storybook site             |
| `npm run server:dev`      | Start the backend dev server (watch mode) |
| `npm run server:build`    | Backend production build                  |

Backend-specific scripts (`lint`, `test`, `test:cov`, `test:e2e`, ...) live in
`server/package.json` — run them via `npm run <script> --workspace server`.

## Project structure

```
app/[locale]/    Pages (App Router, one segment per locale)
components/      React components, documented with Storybook
i18n/            next-intl routing/navigation/request config
lib/api.ts       fetchApi() — fetches from NEXT_PUBLIC_API_URL, no-store
messages/        Translation files (en, de, es)
server/          NestJS backend (npm workspace)
  src/
    certificates/  GET /certificates
    config/        Env validation
    health/        GET /health — reports API + Mongo connection status
    mailbox/       GET /mailbox
    seed/          npm run seed — reseeds collections from fixture data
    app.module.ts   Wires ConfigModule, MongooseModule, feature modules
```

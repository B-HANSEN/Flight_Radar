---
description: Write or add Vitest/Testing Library tests for a component in this repo (*.test.tsx). Use when the user asks to write tests, add test coverage, or when a component is missing a test file needed to hit the 80% per-file coverage threshold. Aims for the fewest tests that meaningfully cover real behavior — no padding, no snapshot tests, no fluff.
---

Write component tests for this repo's stack: Vitest + `@testing-library/react`, jsdom environment, colocated as `<Component>.test.tsx` next to the component (see `components/PageHeading.test.tsx` and `components/Nav.test.tsx` for the established pattern).

## Goal

Hit the per-file 80% lines/branches/functions/statements threshold defined in `vitest.config.ts`, using the smallest set of tests that actually exercises meaningful behavior — not one test per trivial prop combination, and not tests that exist only to move a number.

## How to write them

- Test observable behavior through `render`/`screen` queries (`getByRole`, `getByText`, `toHaveAttribute`, etc.), not implementation details like internal state or function calls.
- Prefer `getByRole` over `getByTestId` or CSS selectors — it also doubles as a light accessibility check, since it fails if the element isn't exposed correctly to the accessibility tree.
- One `it` per conceptually distinct scenario. Don't split a single scenario into multiple assertions-only tests, and don't cram unrelated scenarios into one test.
- Every conditional (ternary, `&&`, default prop value, branch) needs at least one test that hits each side — that's what "branches" coverage actually measures. But if one well-chosen scenario naturally exercises both sides, that's one test, not two.
- Skip: snapshot tests, "renders without crashing" smoke tests with no real assertion, and tests that just restate the implementation.
- If the component uses `useTranslations` (next-intl), wrap it in `NextIntlClientProvider` with the real `messages/en.json` (or the relevant namespace) rather than mocking translations away — this catches missing or renamed message keys for free.
- If the component imports from `@/i18n/navigation` (Link, usePathname, etc.), mock that module minimally rather than trying to provide a full Next.js router context — follow the pattern in `components/Nav.test.tsx`.
- No comments in test files unless something genuinely non-obvious justifies one — same rule as the rest of the codebase.

## After writing

Run `npm run test:coverage` and check the specific file's row. If it's below 80% on any metric, look at the "Uncovered Line #s" column:

- If the gap is a real untested scenario, add a test for it.
- If the gap is trivial or effectively unreachable, don't write a fake test just to chase the number — tell the user what's uncovered and why you left it, so they can decide.

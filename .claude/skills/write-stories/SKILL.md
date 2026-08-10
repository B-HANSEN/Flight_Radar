---
name: write-stories
description: Write or add a Storybook CSF3 story for a component in this repo (*.stories.tsx). Use when the user asks to write a story, add Storybook coverage, or document a component in Storybook. Defaults to one control-driven story per component instead of several near-duplicate hardcoded variants.
---

Write Storybook stories for this repo's stack: CSF3, `@storybook/nextjs-vite`, stories colocated as `<Component>.stories.tsx` next to the component (see `components/PageHeading.stories.tsx` and `components/Nav.stories.tsx` for the established pattern: `Meta<typeof Component>` as the default export, named `StoryObj<typeof Component>` exports).

## Default to one story, driven by controls

Prefer a single `Default` story whose states are all reachable via `args`/`argTypes`, over multiple hardcoded story exports (`Default`, `WithFoo`, `WithBar`) that each freeze one combination. Concretely:

- For every prop the component accepts, add an `argTypes` entry so it shows up as a Storybook control: booleans as toggles, strings as text inputs, union/variant props as a `select`.
- If the component takes no props (reads only from hooks/context, like `Nav`), a single parameterless `Default: StoryObj<typeof Component> = {}` is correct — don't invent fake prop variants just to have more than one story.

## When a second story export is justified

Only add another named export when a state genuinely isn't reachable through controls on the base story — e.g. it depends on an async effect, a specific route/pathname, or a mock/decorator the default story doesn't have. If you add one, it should be because controls structurally can't reach that state, not for convenience.

## Conventions to respect

- Components using `useTranslations` render correctly automatically — `.storybook/preview.tsx` already wraps every story in `NextIntlClientProvider` with English messages. Don't add a per-story provider.
- Don't disable or override the `a11y` addon per-story; it's globally configured (`test: 'todo'` in `.storybook/preview.tsx`) and should stay that way unless the user explicitly asks otherwise.
- No comments in story files unless something non-obvious justifies one.

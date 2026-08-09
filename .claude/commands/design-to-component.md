---
description: Turn a design from /designs into a finished component — build it, add a story, add tests, wire it into the app, then run /review. Stops before staging or committing anything.
---

Run the repeatable "design-to-component" pipeline for `$ARGUMENTS` (a filename or description identifying one file under `designs/`, e.g. `Certificates.dc.html` or "the logbook design"). If `$ARGUMENTS` is empty or ambiguous, list the candidates in `designs/` and ask which one.

This command exists so this workflow doesn't need re-explaining or re-approving step by step each time. Permissions for the routine tool calls below (repo-scoped Edit/Write, npm/npx, git status/diff/add — not commit, vitest, eslint, prettier, cwebp, find/grep) are already granted in `.claude/settings.local.json`, so run them directly without pausing to ask. **Never run `git add` or `git commit` as part of this command, even though `git commit *` happens to be permitted — staging and committing stay manual, the user reviews and commits themselves.**

**Guardrail — cap self-correction, don't grind.** Steps 4, 6, and 7 involve rerunning a check after fixing what it flagged (coverage gap, lint error, build error, review finding). Cap each at **2 fix-and-rerun attempts**. If it's still failing after that, stop, show the actual error/output, and ask the user how to proceed instead of keep iterating — a stubborn failure usually means a wrong assumption, not a fixable typo, and grinding on it burns tokens without progress. Same applies to step 1: skim only what's needed to build this one component, not the whole design-system export.

1. **Read the design.** Open the target file(s) in `designs/` (`.dc.html` exports, or a referenced `.png`/screenshot). If it references other assets (e.g. `designs/extracted/`, the design-system zip), pull in only what's needed to understand this one component — don't try to absorb the whole design system per run.

2. **Build the component**, following `CLAUDE.md` conventions: flat under `/components`, functional + typed with a `Props` type, Tailwind utility classes directly in JSX, no CSS modules. Match the design's structure/spacing/copy as closely as the design file specifies. If the component needs translated strings, add the namespace/keys to all three `messages/{en,de,es}.json` files in this same step — not as a follow-up.

3. **Write the story.** Invoke the `write-stories` skill for the new component — one control-driven `Default` story unless a state genuinely isn't reachable via controls.

4. **Write tests.** Invoke the `write-tests` skill for the new component, then run `npm run test:coverage` and confirm the new file clears 80% lines/branches/functions/statements. Fix gaps that represent real untested behavior; don't pad for the number.

5. **Integrate into the app.** Place the component on the page(s) it belongs to. If that page doesn't exist yet, follow the `new-page` skill to scaffold it (locale routing, `generateStaticParams`, message keys in all three locales). If it's unclear which existing page/route the component belongs on, ask rather than guessing.

6. **Sanity-check.** Run `npm run lint` and `npm run build`. Fix anything they surface before moving on.

7. **Run `/review` automatically, then fix what it finds.** Follow `.claude/commands/review.md` as written (it already scales subagent count to the size of the diff). Do not skip this step and do not ask permission to run it; it's part of this command by definition. Apply corrections yourself for the findings it reports — don't just list them and stop. After fixing, re-verify (re-run the specific reviewer(s) that flagged something, or at minimum re-check the concrete issue directly, e.g. recompute a contrast ratio or re-run the affected tests) until no violations remain, subject to the 2-attempt cap above. If a finding is subjective/a style call rather than a clear defect, or a fix would require a design decision only the user can make, leave it and flag it explicitly in the final summary instead of guessing.

8. **Stop here.** Summarize what was created/changed (files touched, story name, coverage numbers, review findings and how each was resolved) and hand control back. Do not stage, commit, or push — that's the user's call once they've looked at the diff themselves.

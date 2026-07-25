---
description: Final pre-commit review — runs correctness, simplification, and accessibility (WCAG 2.2 AA) subagents in parallel against the uncommitted changes.
---

Run a final pre-commit review of the current uncommitted changes (staged and unstaged).

1. Run `git status` and `git diff` yourself first to know what's actually changed, so you can sanity-check the subagents' findings against the real diff.
2. Invoke these three subagents in a single message, in parallel, via the Agent tool — do not run them sequentially:
   - `correctness-reviewer`
   - `simplification-reviewer`
   - `accessibility-reviewer`
3. Wait for all three to report back. Each reports through the `ReportFindings` tool.
4. Present the combined results to the user grouped by agent, most-severe findings first within each group. If an agent reported zero findings, say so briefly rather than omitting it.
5. Do not apply any fixes yourself unless the user asks you to — this command is a review, not an auto-fix pass.

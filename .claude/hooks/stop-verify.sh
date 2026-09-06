#!/bin/bash
# Stop hook: run type-check + tests against files actually changed this
# session, so a "the classifier allowed it" turn doesn't also need to be a
# "the code actually works" turn on faith. Scoped to changed files only —
# a turn with no relevant edits (docs, config, an unrelated area) exits
# immediately rather than adding latency to every single response.
#
# Deliberately does NOT run `npm run test:coverage`: per-file coverage
# thresholds are intermittently flaky on unrelated files even on a clean
# tree (see memory project_coverage_per_file_flaky) — gating on that would
# block turns for noise unrelated to the change. Plain `npm test` (vitest,
# no coverage) is what this checks instead.
#
# Also deliberately does NOT run `npm run lint` (eslint): that is a
# style/quality check, not a "does the code work" check, and it already
# hard-blocks `git push` in git-commit-push-gate.sh. It is also whole-repo
# (the npm script takes no path) and would add its full runtime to every
# turn, which the changed-files scoping here is meant to avoid. Formatting
# is handled separately by the prettier PostToolUse hook (format-file.sh).
#
# Frontend TS is covered by `npm run type-check`, but the root tsconfig.json
# excludes server/ entirely, so a changed server/src/*.ts file gets its own
# `tsc --noEmit -p server/tsconfig.json` pass — otherwise server changes
# would sail through this hook with zero type checking.

project_dir="${CLAUDE_PROJECT_DIR:-$PWD}"
cd "$project_dir" || exit 0

# Stop hooks receive session JSON on stdin; nothing in it is needed here.
cat >/dev/null

tracked_changed=$(git diff --name-only HEAD 2>/dev/null)
untracked=$(git ls-files --others --exclude-standard 2>/dev/null)
changed=$(printf '%s\n%s\n' "$tracked_changed" "$untracked" | sed '/^$/d' | sort -u)

[ -z "$changed" ] && exit 0

relevant=$(printf '%s\n' "$changed" | grep -E '^(app/|components/|i18n/|server/src/)')
[ -z "$relevant" ] && exit 0

fail=0
report=""

fe_ts_changed=$(printf '%s\n' "$relevant" | grep -E '^(app/|components/|i18n/).*\.tsx?$')
server_ts_changed=$(printf '%s\n' "$relevant" | grep -E '^server/src/.*\.ts$')
test_relevant=$(printf '%s\n' "$relevant" | grep -E '(\.test\.tsx?$|^components/)')

if [ -n "$fe_ts_changed" ]; then
  out=$(npm run type-check 2>&1)
  if [ $? -ne 0 ]; then
    fail=1
    report="${report}## npm run type-check failed
${out}

"
  fi
fi

if [ -n "$server_ts_changed" ]; then
  out=$(npx tsc --noEmit -p server/tsconfig.json 2>&1)
  if [ $? -ne 0 ]; then
    fail=1
    report="${report}## server type-check failed (tsc -p server/tsconfig.json)
${out}

"
  fi
fi

if [ -n "$test_relevant" ]; then
  out=$(npm test 2>&1)
  if [ $? -ne 0 ]; then
    fail=1
    report="${report}## npm test (vitest) failed
${out}

"
  fi
fi

if [ "$fail" -ne 0 ]; then
  printf '%s' "$report" | tail -c 6000 >&2
  exit 2
fi

exit 0
